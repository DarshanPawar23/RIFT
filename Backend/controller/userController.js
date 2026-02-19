import db from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateStructure } from "../services/geminiService.js";
import { fetchCourseNotes } from "../services/notesService.js";
import { generateOverview } from "../services/courseOverviewService.js";
import { generateExamQuestions } from "../services/examQuestionService.js";

dotenv.config();

export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await db.query(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword]
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        const [user] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(
            password,
            user[0].password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const token = jwt.sign(
            {
                id: user[0].id,
                email: user[0].email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const addPlaylist = async (req, res) => {
    try {
        const { link } = req.body;
        const userId = req.user.id;

        if (!link || !link.includes("list=")) {
            return res.status(400).json({
                success: false,
                message: "Invalid playlist link"
            });
        }

        const playlistId = new URL(link).searchParams.get("list");

        if (!playlistId) {
            return res.status(400).json({
                success: false,
                message: "Invalid playlist ID"
            });
        }

        // 🔥 Fetch ALL playlist videos (with duration)
        const ytResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${process.env.YT_API_KEY}`
        );

        const ytData = await ytResponse.json();

        if (!ytData.items || ytData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Playlist not found"
            });
        }

        const videoData = ytData.items.map(item => ({
            title: item.snippet.title,
            videoId: item.contentDetails.videoId
        }));

        // ✅ Generate structured curriculum
        const structured = await generateStructure(videoData);

        // 🔥 Calculate approximate total minutes (simple estimate)
        const totalVideos = videoData.length;
        const totalMinutes = totalVideos * 15; // assume avg 15 min per video

        // ✅ Generate AI Overview
        const overview = await generateOverview(structured, totalMinutes);

        // ✅ Save Everything
        await db.query(
            `INSERT INTO playlists 
            (user_id, youtube_playlist_id, structured_data, overview_data) 
            VALUES (?, ?, ?, ?)`,
            [
                userId,
                playlistId,
                JSON.stringify(structured),
                JSON.stringify(overview)
            ]
        );

        return res.status(201).json({
            success: true,
            structured,
            overview
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCurrentCourse = async (req, res) => {
    try {
        const [course] = await db.query(
            `SELECT structured_data, overview_data 
             FROM playlists 
             WHERE user_id = ? 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [req.user.id]
        );

        if (course.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No course found"
            });
        }

        return res.status(200).json({
            success: true,
            structured:
                typeof course[0].structured_data === "string"
                    ? JSON.parse(course[0].structured_data)
                    : course[0].structured_data,
            overview:
                typeof course[0].overview_data === "string"
                    ? JSON.parse(course[0].overview_data)
                    : course[0].overview_data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addNote = async (req, res) => {
  const { playlistId, videoId, noteText, timestamp } = req.body;

  await db.query(
    `INSERT INTO lecture_notes 
     (user_id, playlist_id, video_id, note_text, timestamp_seconds)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, playlistId, videoId, noteText, timestamp || 0]
  );

  res.json({ success: true });
};

export const getNotes = async (req, res) => {
  const { playlistId, videoId, type } = req.query;

  let query = `
    SELECT * FROM lecture_notes
    WHERE user_id = ? AND playlist_id = ?
  `;

  let values = [req.user.id, playlistId];

  if (type === "current") {
    query += " AND video_id = ?";
    values.push(videoId);
  }

  query += " ORDER BY created_at DESC";

  const [notes] = await db.query(query, values);

  res.json({ success: true, notes });
};

export const createExam = async (req, res) => {
  try {

    const userId = req.user.id;

    const [playlist] = await db.query(
      "SELECT id, structured_data FROM playlists WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (playlist.length === 0) {
      return res.status(404).json({ success: false, message: "No course found" });
    }

    const playlistId = playlist[0].id;

    const structured =
      typeof playlist[0].structured_data === "string"
        ? JSON.parse(playlist[0].structured_data)
        : playlist[0].structured_data;

    const courseTitle = structured[0]?.sectionTitle || "Course Exam";

    console.log("Generating exam for:", courseTitle);

    const questions = await generateExamQuestions(courseTitle, structured);

    if (!questions || questions.length === 0) {
      return res.status(500).json({ success: false, message: "No questions generated" });
    }

    const [examResult] = await db.query(
      "INSERT INTO exams (playlist_id, title, total_questions) VALUES (?, ?, ?)",
      [playlistId, `${courseTitle} Final Exam`, questions.length]
    );

    const examId = examResult.insertId;

    for (const q of questions) {
      await db.query(
        "INSERT INTO questions (exam_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?)",
        [
          examId,
          q.question,
          JSON.stringify(q.options),
          q.correctIndex
        ]
      );
    }

    res.json({
      success: true,
      examId,
      totalQuestions: questions.length
    });

  } catch (error) {
    console.error("Create Exam Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const submitExam = async (req, res) => {
  try {

    const userId = req.user.id;
    const { examId, answers } = req.body;

    const [questions] = await db.query(
      "SELECT id, correct_answer FROM questions WHERE exam_id = ?",
      [examId]
    );

    let score = 0;

    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        score++;
      }
    });

    await db.query(
      "INSERT INTO exam_attempts (user_id, exam_id, score) VALUES (?, ?, ?)",
      [userId, examId, score]
    );

    res.json({
      success: true,
      score,
      total: questions.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    const [questions] = await db.query(
      "SELECT id, question_text, options FROM questions WHERE exam_id = ?",
      [examId]
    );

    res.json({
      success: true,
      questions
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

