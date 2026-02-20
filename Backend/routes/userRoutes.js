import express from "express";
import { registerUser, loginUser ,addPlaylist,getCurrentCourse,addNote,getNotes,createExam,submitExam,getExamQuestions,verifyCertificate} from "../controller/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const userRoutes = express.Router();

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/add-playlist", protect, addPlaylist);
userRoutes.get("/current-course", protect, getCurrentCourse);

userRoutes.post("/add-Note",protect,addNote);
userRoutes.get("/get-Notes",protect,getNotes);

userRoutes.post("/create-exam", protect, createExam);
userRoutes.post("/submit-exam", protect, submitExam);
userRoutes.get("/get-exam-questions/:examId", protect, getExamQuestions);
userRoutes.get("/verify/:certificateId", verifyCertificate);

export default userRoutes;
