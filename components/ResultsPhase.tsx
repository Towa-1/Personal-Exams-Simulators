
import React from 'react';
import type { QuestionAnswer } from '../types';
import LatexText from './LatexText';

interface ResultsPhaseProps {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  questions: QuestionAnswer[];
  userAnswers: Record<number, string>;
  onRestart: () => void;
}

const ResultsPhase: React.FC<ResultsPhaseProps> = ({ score, totalQuestions, timeTaken, questions, userAnswers, onRestart }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="animate-fade-in py-6 w-full flex flex-col h-full max-h-[80vh]">
      <div className="text-center mb-8 shrink-0">
        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Simulation Results</h2>
        <p className="text-amber-500 font-mono text-xs uppercase tracking-[0.3em]">Performance Analytics Report</p>
      </div>

      <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 mb-8 shrink-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Final Score</p>
            <p className="text-3xl font-black text-amber-500">{score} <span className="text-slate-600 text-lg">/ {totalQuestions}</span></p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Percentage</p>
            <p className="text-3xl font-black text-white">{percentage}<span className="text-slate-600 text-lg">%</span></p>
          </div>
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Time Elapsed</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{formatTime(timeTaken)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 mb-8 space-y-6 custom-scrollbar">
        <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2">Detailed Review</h3>
        {questions.map((q, idx) => {
          const uAns = userAnswers[idx] || '';
          const isCorrect = uAns.trim().toLowerCase() === q.answerKey.trim().toLowerCase();
          
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-green-950/10 border-green-900/30' : 'bg-red-950/10 border-red-900/30'}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-slate-200 mb-2">
                    <LatexText text={q.question} />
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1 text-xs uppercase font-bold">Your Answer</span>
                      <span className={`font-medium ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {uAns ? <LatexText text={uAns} /> : <span className="italic opacity-50">No answer provided</span>}
                      </span>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1 text-xs uppercase font-bold">Correct Answer</span>
                      <span className="font-medium text-green-400">
                        <LatexText text={q.answerKey} />
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-sm">
                    <span className="text-amber-500 block mb-2 text-xs uppercase font-bold">Explanation</span>
                    <div className="text-slate-300 leading-relaxed">
                      <LatexText text={q.explanation} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 shrink-0 border-t border-slate-800 pt-6">
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-600 text-white font-black py-3 px-8 rounded-xl hover:bg-amber-500 transition-all uppercase tracking-widest text-sm shadow-xl shadow-amber-900/20"
        >
          Retake New Exam
        </button>
        <button
          onClick={onRestart}
          className="bg-slate-800 text-white font-black py-3 px-8 rounded-xl hover:bg-slate-700 transition-all uppercase tracking-widest text-sm"
        >
          Return to Editor
        </button>
      </div>
    </div>
  );
};

export default ResultsPhase;
