import React from "react";
import { Sparkles, Send } from "lucide-react";

function AITutor() {
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex-grow space-y-6">
        <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-2xl">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles size={14} className="text-red-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">AI Assistant</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            I've analyzed the transcript for "Introduction to AI Architecture". Ask me anything about the concepts discussed!
          </p>
        </div>
        
        <div className="text-center py-10">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No recent questions</p>
        </div>
      </div>

      <div className="mt-auto pt-4 relative">
        <input 
          type="text" 
          placeholder="Ask a doubt..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-red-600/50 transition-all"
        />
        <button className="absolute right-2 top-[22px] text-red-600 hover:text-red-500">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

export default AITutor;