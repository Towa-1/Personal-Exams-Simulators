
import React from 'react';

interface ResultsPhaseProps {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  onRestart: () => void;
}

const ResultsPhase: React.FC<ResultsPhaseProps> = ({ score, totalQuestions, timeTaken, onRestart }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="text-center animate-fade-in py-6">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Simulation Results</h2>
        <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.3em]">Performance Analytics Report</p>
      </div>

      <div className="bg-slate-950/50 p-8 rounded-3xl border border-slate-800 mb-10 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-black mb-1">Final Score</p>
              <p className="text-3xl font-black text-amber-500">{score} <span className="text-slate-600 text-lg">/ {totalQuestions}</span></p>
            </div>
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-black mb-1">Percentage</p>
              <p className="text-3xl font-black text-white">{percentage}<span className="text-slate-600 text-lg">%</span></p>
            </div>
          </div>
          
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Time Elapsed</p>
            <p className="text-xl font-bold text-slate-200">{formatTime(timeTaken)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-600 text-white font-black py-4 px-8 rounded-2xl hover:bg-amber-500 transition-all uppercase tracking-widest text-sm shadow-xl shadow-amber-900/20"
        >
          Retake New Exam
        </button>
        <button
          onClick={onRestart}
          className="text-slate-500 font-bold py-3 hover:text-white transition-colors uppercase tracking-[0.2em] text-[10px]"
        >
          Return to Editor
        </button>
      </div>
    </div>
  );
};

export default ResultsPhase;
