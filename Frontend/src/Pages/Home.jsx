import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for routing
import { BookOpen, Search, Sparkles, GraduationCap, Zap, ShieldCheck, PlayCircle, Clock } from "lucide-react";
import youtubeLogo from "../assets/youtube.png";

function Home() {
  const navigate = useNavigate(); // Initialize navigation
  const [playlistLink, setPlaylistLink] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!playlistLink) return;

    setIsConverting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/users/add-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          link: playlistLink,
          hoursPerDay: 2,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Store the structured course for the Main page to use
        localStorage.setItem("currentCourse", JSON.stringify(data.structured));

        // Delay navigation slightly so the user sees the "Generating" animation
        setTimeout(() => {
          navigate("/Main");
        }, 2000);
      } else {
        alert(data.message || "Failed to process playlist");
        setIsConverting(false);
      }
    } catch (error) {
      console.error("Conversion failed", error);
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-black font-sans text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0f0f0f] to-[#1a0505] animate-gradient"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <img
            key={i}
            src={youtubeLogo}
            alt="bg-rain"
            className="absolute opacity-5 animate-rain grayscale brightness-150"
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 12 + 12}px`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 12 + 6}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-4 md:px-10 py-6">
        <div className="w-full flex items-center justify-between bg-white/[0.02] backdrop-blur-3xl border border-white/5 px-6 md:px-12 py-4 rounded-[2rem] shadow-2xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-600 rounded-xl shadow-xl shadow-red-600/30 transform hover:scale-105 transition-all">
              <BookOpen size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Fokusflow AI</span>
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-[0.4em]">Educational Ecosystem</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#home" className="hover:text-white transition-colors text-white border-b border-red-600 pb-1">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Curriculum</a>
            <a href="#services" className="hover:text-white transition-colors">AI Tutor</a>
            <a href="#work" className="hover:text-white transition-colors">Resources</a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center font-black text-sm border border-white/10 text-red-500 shadow-lg cursor-pointer">
              D
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center w-full pt-10 pb-20">
        <div className="text-center space-y-8 max-w-5xl animate-slideUp px-6">
          <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-2 rounded-full text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">
            <Sparkles size={14} className="text-red-600" />
            <span>Structured Learning Platform</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1]">
            Turn Content into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-600 to-white">
              Knowledge.
            </span>
          </h1>

          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed italic">
            Convert any YouTube playlist into a focused, ad-free academic course with AI-generated assessments.
          </p>
        </div>

        {/* Search/Convert Form */}
        <form
          onSubmit={handleConvert}
          className="mt-12 w-full max-w-4xl relative group animate-slideUp px-6"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="relative flex items-center bg-[#0d0d0d] border border-white/10 p-2 rounded-[2rem] shadow-3xl group-focus-within:border-red-600/50 transition-all">
            <div className="pl-6 text-gray-600">
              <Search size={24} strokeWidth={2} />
            </div>
            <input
              type="text"
              value={playlistLink}
              onChange={(e) => setPlaylistLink(e.target.value)}
              placeholder="Paste educational playlist link here..."
              className="w-full bg-transparent border-none outline-none px-6 py-5 text-lg text-white placeholder:text-gray-700 font-medium"
            />
            <button
              type="submit"
              disabled={isConverting}
              className={`bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center space-x-3 transition-all active:scale-95 shadow-lg shadow-red-600/20 whitespace-nowrap ${isConverting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span>{isConverting ? "Processing..." : "Convert to Course"}</span>
              <Zap size={16} fill="currentColor" />
            </button>
          </div>
        </form>

        {/* Progress Card (Mockup) */}
        <div className="mt-20 w-full max-w-4xl px-6 animate-slideUp" style={{ animationDelay: "0.4s" }}>
          <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center">
            <PlayCircle size={14} className="mr-2 text-red-600" /> Current Course Progress
          </h3>
          <div
            onClick={() => navigate("/Main")}
            className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-6">
              <div className="w-24 h-14 bg-gradient-to-br from-gray-800 to-black rounded-xl border border-white/10 flex items-center justify-center overflow-hidden">
                <img src={youtubeLogo} className="w-8 opacity-20" alt="course" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-white group-hover:text-red-500 transition-colors">Resume Learning</h4>
                <div className="flex items-center space-x-4 mt-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span className="flex items-center"><Clock size={12} className="mr-1" /> Ongoing Session</span>
                  <span className="text-red-500">View Roadmap</span>
                </div>
              </div>
            </div>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Resume Session</button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-black border-t border-white/5 px-10 py-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="flex items-center space-x-6">
            <span>© 2026 Fokusflow AI</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
          </div>
          <div className="flex items-center space-x-8 text-white">
            <span className="flex items-center space-x-2"><GraduationCap size={16} className="text-red-600" /> <span>Verified Mastery</span></span>
            <span className="flex items-center space-x-2"><ShieldCheck size={16} className="text-red-600" /> <span>Academic Integrity</span></span>
          </div>
        </div>
      </footer>

      {/* Full Screen Loading Overlay */}
      {isConverting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/98 backdrop-blur-xl">
          <div className="relative z-10 text-center space-y-10">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-4 border-white/5 border-t-red-600 rounded-full animate-spin"></div>
              <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" size={32} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-widest text-white">Generating Curriculum</h2>
              <p className="text-gray-500 font-black tracking-[0.4em] text-[9px] uppercase animate-pulse">AI is parsing video transcripts & creating assessments</p>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes rain {
            0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
            50% { opacity: 0.1; }
            100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-gradient { background-size: 200% 200%; animation: gradientMove 15s ease infinite; }
          .animate-rain { animation: rain linear infinite; }
          .animate-slideUp { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        `}
      </style>
    </div>
  );
}

export default Home;