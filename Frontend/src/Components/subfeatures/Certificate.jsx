import React from "react";
import { useNavigate } from "react-router-dom";

function Certificate() {
  const navigate = useNavigate();

  const handleStartExam = () => {
    navigate("/exam");
  };

  return (
    <div className="space-y-6">

      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-4">

        <h2 className="text-xl font-bold text-white">
          Final Certification Exam
        </h2>

        <p className="text-sm text-gray-400">
          Complete the final exam to earn your course completion certificate.
        </p>

        <button
          onClick={handleStartExam}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold text-white transition"
        >
          Start Exam
        </button>

      </div>

    </div>
  );
}
export default Certificate;

