import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateDisplay from "../CertificateDisplay";

function Certificate() {

  const [certificateData, setCertificateData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    const storedExam = localStorage.getItem("examResult");

    if (!storedExam) return;

    const parsedExam = JSON.parse(storedExam);
    setExamResult(parsedExam);

    // If passed → generate certificate
    if (parsedExam.completed && parsedExam.score >= 60) {

      let existingCert = localStorage.getItem("certificateData");

      if (existingCert) {
        setCertificateData(JSON.parse(existingCert));
      } else {

        const generatedId = "CERT-" + Date.now();
        const fakeTxId = "TX-" + Math.random().toString(36).substring(2, 12);

        const certObject = {
          studentName: parsedExam.name,
          courseName: parsedExam.title,
          certificateId: generatedId,
          txId: fakeTxId,
          issueDate: new Date().toLocaleDateString()
        };

        localStorage.setItem("certificateData", JSON.stringify(certObject));
        setCertificateData(certObject);
      }
    }

  }, []);

  // 🚫 If exam not completed yet → show button
  if (!examResult || !examResult.completed) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-6 text-white">

        <h2 className="text-2xl font-semibold">
          Complete the exam to unlock your certificate.
        </h2>

        <button
          onClick={() => navigate("/exam")}
          className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition"
        >
          Take Exam
        </button>

      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-10 mt-10 text-white">

      {/* RESULT SECTION */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">
          Your Score: {examResult.score}%
        </h2>

        {examResult.score < 60 ? (
          <>
            <p className="text-red-400 mt-4">
              Minimum 60% required to get certificate.
            </p>

            <button
              onClick={() => navigate("/exam")}
              className="mt-6 bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-xl font-semibold text-black shadow-lg transition"
            >
              Retake Exam
            </button>
          </>
        ) : (
          <p className="text-green-400 mt-4">
            Congratulations! You passed 🎉
          </p>
        )}
      </div>

      {/* CERTIFICATE */}
      {examResult.score >= 60 && certificateData && (
        <CertificateDisplay
          studentName={certificateData.studentName}
          courseName={certificateData.courseName}
          certificateId={certificateData.certificateId}
          txId={certificateData.txId}
          issueDate={certificateData.issueDate}
        />
      )}

    </div>
  );
}

export default Certificate;
