import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Exam() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [examId, setExamId] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    generateExam();
  }, []);

  const generateExam = async () => {
    try {
      setLoading(true);

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

      const questionRes = await fetch(
        `http://localhost:3000/api/users/get-exam-questions/${data.examId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const questionData = await questionRes.json();

      if (questionData.success) {
        setQuestions(questionData.questions || []);
      }

      setLoading(false);
    } catch (err) {
      console.error("Exam generation error:", err);
      setLoading(false);
    }
  };

  const parseOptions = (options) => {
    try {
      if (Array.isArray(options)) return options;
      if (typeof options === "string") return JSON.parse(options);
      return [];
    } catch {
      return [];
    }
  };

  const handleSelect = (qIndex, optionIndex) => {
    const updated = [...selected];
    updated[qIndex] = optionIndex;
    setSelected(updated);
  };

  const submitExam = async () => {
  if (selected.length !== questions.length) {
    alert("Please answer all questions before submitting.");
    return;
  }

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

    if (!data.success) {
      alert("Something went wrong");
      return;
    }

    const percentage = data.total
      ? Math.round((data.score / data.total) * 100)
      : 0;

    const passed = percentage >= 60;

    // ✅ Save exam result for Certificate tab
    localStorage.setItem(
      "examResult",
      JSON.stringify({
        completed: true,
        score: percentage,
        name: "Darshan", // or fetch from user
        title: "Final Certification Exam",
      })
    );

    // ✅ Save certificate if backend gives one
    if (passed && data.certificate) {
      localStorage.setItem(
        "certificateData",
        JSON.stringify({
          studentName: "Darshan",
          courseName: "Final Certification Exam",
          certificateId: data.certificate.certificateId,
          txId: data.certificate.txId,
          issueDate: new Date().toLocaleDateString(),
        })
      );
    }

    setResult({
      ...data,
      percentage,
      passed,
    });

    // ⏳ Wait 2 seconds then go back to Features page
    setTimeout(() => {
      navigate("/Main"); // change if your features route is different
    }, 2000);

  } catch (error) {
    console.error("Submit error:", error);
  }
};


  // ======================
  // LOADING SCREEN
  // ======================
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500"></div>
        <p className="text-lg">Generating AI Exam...</p>
      </div>
    );
  }

  // ======================
  // RESULT SCREEN
  // ======================
  if (result) {
    const percentage = result?.score && result?.total
  ? Math.round((result.score / result.total) * 100)
  : 0;

    const passed = percentage >= 60;

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white space-y-6">

        <h2 className="text-3xl font-bold">Exam Completed</h2>

        <p className="text-xl">
          Score: {result.score} / {result.total}
        </p>

        <p className={`text-2xl font-bold ${passed ? "text-green-400" : "text-red-500"}`}>
          {percentage}% — {passed ? "PASSED ✅" : "FAILED ❌"}
        </p>

        {passed ? (
          <button
            onClick={() => navigate("/certificate")}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold"
          >
            View Certificate
          </button>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-semibold"
          >
            Retake Exam
          </button>
        )}

      </div>
    );
  }

  // ======================
  // NO QUESTIONS
  // ======================
  if (!questions.length) {
    return (
      <div className="flex justify-center items-center h-screen bg-black text-red-500">
        No questions available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 text-white bg-gradient-to-br from-black via-gray-900 to-black min-h-screen">

      <h1 className="text-3xl font-bold text-center">
        Final Certification Exam
      </h1>

      <p className="text-center text-gray-400">
        Minimum 60% required to unlock blockchain certificate
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-3">
        <div
          className="bg-red-600 h-3 rounded-full transition-all duration-300"
          style={{
            width: `${(selected.filter(v => v !== undefined).length / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Questions */}
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

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={submitExam}
          className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-xl font-semibold disabled:opacity-50"
          disabled={selected.filter(v => v !== undefined).length !== questions.length}
        >
          Submit Exam
        </button>
      </div>

    </div>
  );
}

export default Exam;
