import React, { useEffect, useState } from "react";

function Exam() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [examId, setExamId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    generateExam();
  }, []);

  const generateExam = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create exam
      const res = await fetch(
        "http://localhost:3000/api/users/create-exam",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!data.success) {
        setLoading(false);
        return;
      }

      setExamId(data.examId);

      // 2️⃣ Get questions
      const questionRes = await fetch(
        `http://localhost:3000/api/users/get-exam-questions/${data.examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const questionData = await questionRes.json();

      if (questionData.success) {
        setQuestions(questionData.questions || []);
      } else if (Array.isArray(questionData)) {
        setQuestions(questionData);
      }

      setLoading(false);
    } catch (err) {
      console.error("Exam generation error:", err);
      setLoading(false);
    }
  };

  // ✅ SAFE OPTIONS PARSER
  const parseOptions = (options) => {
    try {
      if (Array.isArray(options)) return options;
      if (typeof options === "string") return JSON.parse(options);
      return [];
    } catch (error) {
      return [];
    }
  };

  const handleSelect = (qIndex, optionIndex) => {
    const updated = [...selected];
    updated[qIndex] = optionIndex;
    setSelected(updated);
  };

  const submitExam = async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/users/submit-exam",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            examId,
            answers: selected,
          }),
        }
      );

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // ======================
  // UI STATES
  // ======================

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-white">
        Generating AI Exam...
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <h2 className="text-3xl font-bold mb-4">Exam Completed</h2>
        <p className="text-xl text-green-500">
          Score: {result.score} / {result.total}
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500">
        No questions available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-center">
        Final Certification Exam
      </h1>

      {questions.map((q, index) => (
        <div
          key={q.id}
          className="bg-white/5 p-6 rounded-xl border border-white/10"
        >
          <p className="font-semibold mb-4">
            {index + 1}. {q.question_text}
          </p>

          {parseOptions(q.options).map((option, optIndex) => (
            <button
              key={optIndex}
              onClick={() => handleSelect(index, optIndex)}
              className={`block w-full text-left px-4 py-3 mb-3 rounded-lg border transition ${
                selected[index] === optIndex
                  ? "bg-red-600 border-red-600"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      ))}

      <div className="text-center">
        <button
          onClick={submitExam}
          className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
}

export default Exam;
