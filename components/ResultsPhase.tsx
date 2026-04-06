
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
  onRetake: () => void;
}

const ResultsPhase: React.FC<ResultsPhaseProps> = ({ score, totalQuestions, timeTaken, questions, userAnswers, onRestart, onRetake }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="animate-fade-in py-6 w-full flex flex-col h-full max-h-[80vh]">
      <div className="text-center mb-8 shrink-0">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2 uppercase tracking-tighter">Simulation Results</h2>
        <p className="text-yellow-500 font-mono text-xs uppercase tracking-[0.3em]">Performance Analytics Report</p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 shrink-0">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm dark:shadow-none">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Final Score</p>
            <p className="text-3xl font-black text-yellow-500">{score} <span className="text-slate-400 dark:text-slate-600 text-lg">/ {totalQuestions}</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm dark:shadow-none">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Percentage</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{percentage}<span className="text-slate-400 dark:text-slate-600 text-lg">%</span></p>
          </div>
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm dark:shadow-none">
            <p className="text-xs text-slate-500 uppercase font-black mb-1">Time Elapsed</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{formatTime(timeTaken)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 mb-8 space-y-6 custom-scrollbar">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Detailed Review</h3>
        {questions.map((q, idx) => {
          const uAns = userAnswers[idx] || '';
          const isCorrect = uAns.trim().toLowerCase() === q.answerKey.trim().toLowerCase();
          
          return (
            <div key={idx} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-green-50 dark:bg-green-950/10 border-green-200 dark:border-green-900/30' : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${isCorrect ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-200 mb-2">
                    <LatexText text={q.question} />
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                      <span className="text-slate-500 block mb-1 text-xs uppercase font-bold">Your Answer</span>
                      <span className={`font-medium ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {uAns ? <LatexText text={uAns} /> : <span className="italic opacity-50">No answer provided</span>}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
                      <span className="text-slate-500 block mb-1 text-xs uppercase font-bold">Correct Answer</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        <LatexText text={q.answerKey} />
                      </span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm shadow-sm dark:shadow-none">
                    <span className="text-yellow-600 dark:text-yellow-500 block mb-2 text-xs uppercase font-bold">Explanation</span>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      <LatexText text={q.explanation} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 shrink-0 border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={onRetake}
          className="bg-yellow-600 text-white font-black py-3 px-8 rounded-xl hover:bg-yellow-500 transition-all uppercase tracking-widest text-sm shadow-xl shadow-yellow-900/20"
        >
          Retake Same Exam
        </button>
        <button
          onClick={onRestart}
          className="bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-white font-black py-3 px-8 rounded-xl dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-sm"
        >
          Start New Exam
        </button>
      </div>
    </div>
  );
};

export default ResultsPhase;
