
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { QuestionAnswer } from '../types';
import LatexText from './LatexText';

interface QuizPhaseProps {
  questions: QuestionAnswer[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  markedForReview: Set<number>;
  checkedAnswers: Record<number, boolean>;
  onAnswerChange: (answer: string) => void;
  onToggleMark: () => void;
  onNavigate: (index: number) => void;
  onCheckAnswer: (index: number, isCorrect: boolean) => void;
  onSubmitExam: () => void;
  timeLeft: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onExit: () => void;
}

const QuizPhase: React.FC<QuizPhaseProps> = ({ 
  questions,
  currentQuestionIndex,
  userAnswers,
  markedForReview,
  checkedAnswers,
  onAnswerChange,
  onToggleMark,
  onNavigate,
  onCheckAnswer,
  onSubmitExam,
  timeLeft,
  isPaused,
  onTogglePause,
  onExit
}) => {
  const [imgError, setImgError] = useState(false);
  const [hoveredQuestionIndex, setHoveredQuestionIndex] = useState<number | null>(null);
  
  const question = questions[currentQuestionIndex];
  const questionNumber = currentQuestionIndex + 1;
  const totalQuestions = questions.length;
  const userAnswer = userAnswers[currentQuestionIndex] || '';

  useEffect(() => {
    setImgError(false);
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (Object.keys(userAnswers).length / totalQuestions) * 100;

  // STRICT IMAGE RENDERING LOGIC:
  const imageUrl = question.imageUrl ? question.imageUrl.trim() : null;
  const hasValidImage = !!(imageUrl && imageUrl !== 'null' && imageUrl.toLowerCase().startsWith('http'));

  return (
    <div className="animate-fade-in w-full flex flex-col md:flex-row gap-8">
      {/* Sidebar: Question Navigator Grid */}
      <div className="md:w-1/4 flex flex-col gap-4">
        <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-black text-amber-500 uppercase tracking-tighter mb-2">Navigator</div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => {
              const isAnswered = !!userAnswers[idx];
              const isMarked = markedForReview.has(idx);
              const isActive = idx === currentQuestionIndex;
              const isChecked = checkedAnswers[idx] !== undefined;
              const isCorrect = checkedAnswers[idx] === true;
              
              let btnClass = "w-full aspect-square rounded-md flex items-center justify-center text-sm font-bold transition-all border ";
              
              if (isActive) {
                btnClass += "ring-2 ring-white border-white ";
              } else {
                btnClass += "border-slate-700 ";
              }

              if (isChecked) {
                btnClass += isCorrect ? "bg-green-600 text-white border-green-500 " : "bg-red-600 text-white border-red-500 ";
              } else if (isMarked) {
                btnClass += "bg-amber-500 text-slate-950 border-amber-400 ";
              } else if (isAnswered) {
                btnClass += "bg-blue-600 text-white border-blue-500 ";
              } else {
                btnClass += "bg-slate-800 text-slate-400 hover:bg-slate-700 ";
              }

              return (
                <div key={idx} className="relative z-10">
                  <button
                    onClick={() => onNavigate(idx)}
                    onMouseEnter={() => setHoveredQuestionIndex(idx)}
                    onMouseLeave={() => setHoveredQuestionIndex(null)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                  {hoveredQuestionIndex === idx && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs text-slate-300 shadow-2xl z-50 animate-fade-in pointer-events-none">
                      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-slate-700"></div>
                      <div className="absolute left-1/2 bottom-[1px] -translate-x-1/2 translate-y-full border-8 border-transparent border-t-slate-900"></div>
                      <div className="font-bold text-slate-500 mb-1 uppercase tracking-widest">Question {idx + 1}</div>
                      <div className="line-clamp-4 leading-relaxed">
                        <LatexText text={questions[idx].question} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-600 rounded-sm"></div> Correct</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Wrong</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> Marked for Review</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-800 border border-slate-700 rounded-sm"></div> Unanswered</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:w-3/4 flex flex-col">
        {/* Simulation Header */}
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-xs font-black text-amber-500 uppercase tracking-tighter block mb-1">Session Timer</span>
            <div className="flex items-center gap-3">
              <div className={`text-2xl font-mono font-bold ${isPaused ? 'text-amber-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </div>
              <button 
                onClick={onTogglePause}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title={isPaused ? "Resume Timer" : "Pause Timer"}
              >
                {isPaused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                )}
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to exit? All progress will be lost.")) {
                    onExit();
                  }
                }}
                className="p-1.5 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors"
                title="Exit to Home"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block mb-1">Status</span>
            <div className="text-lg font-black text-white">
              {questionNumber.toString().padStart(2, '0')} <span className="text-slate-600 text-sm">/ {totalQuestions.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-800 h-1 rounded-full mb-6 overflow-hidden">
          <div 
            className="bg-amber-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Mark for Review Toggle */}
        <div className="flex justify-end mb-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden"
              checked={markedForReview.has(currentQuestionIndex)}
              onChange={onToggleMark}
            />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${markedForReview.has(currentQuestionIndex) ? 'bg-amber-500 border-amber-500 text-slate-950' : 'bg-slate-900 border-slate-700 text-transparent group-hover:border-amber-500/50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors uppercase tracking-wider">Mark for Review</span>
          </label>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col flex-1 ${isPaused ? 'pointer-events-none opacity-50 blur-sm transition-all duration-300' : 'transition-all duration-300'}`}
          >
            {/* EMERGENCY FIX: Image Container - Must be appended before the question text */}
            {hasValidImage && !imgError && (
              <div className="mb-6 bg-white/5 rounded-xl p-2 border border-slate-800 transition-all duration-500">
                <img 
                  key={imageUrl}
                  src={imageUrl!} 
                  alt="Question Diagram" 
                  referrerPolicy="no-referrer"
                  className="rounded-lg shadow-2xl"
                  style={{ 
                    display: 'block', 
                    margin: '0 auto', 
                    maxWidth: '100%', 
                    height: 'auto'
                  }}
                  onError={(e) => {
                    console.error("Failed to load image from URL:", imageUrl);
                    setImgError(true);
                  }}
                />
              </div>
            )}

            {/* Question Text */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                <LatexText text={question.question} />
              </h3>
            </div>

            {/* Answer Inputs */}
            <div className="mb-8 flex-1">
              {question.type === 'MCQ' ? (
                <div className="grid grid-cols-1 gap-3">
                  {question.options.map((option, idx) => {
                    const label = String.fromCharCode(65 + idx);
                    const isSelected = userAnswer === option;
                    const isChecked = checkedAnswers[currentQuestionIndex] !== undefined;
                    const isCorrectOption = option.trim().toLowerCase() === question.answerKey.trim().toLowerCase();
                    
                    let optionClass = `flex items-center p-4 rounded-xl border-2 transition-all `;
                    
                    if (isChecked) {
                      optionClass += "pointer-events-none ";
                      if (isSelected) {
                        optionClass += isCorrectOption ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10";
                      } else {
                        optionClass += "border-slate-800 bg-slate-950/50";
                      }
                    } else {
                      optionClass += "cursor-pointer ";
                      if (isSelected) {
                        optionClass += "border-amber-500 bg-amber-500/10";
                      } else {
                        optionClass += "border-slate-800 bg-slate-950/50 hover:border-slate-700";
                      }
                    }

                    return (
                      <label
                        key={idx}
                        className={optionClass}
                      >
                        <input
                          type="radio"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => !isChecked && onAnswerChange(option)}
                          disabled={isChecked}
                        />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black mr-4 border-2 transition-all ${
                          isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-500'
                        }`}>
                          {label}
                        </div>
                        <span className={`flex-1 text-md ${isSelected ? 'text-white font-bold' : 'text-slate-400'}`}>
                          <LatexText text={option} />
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-xl border-2 border-slate-800 focus-within:border-amber-500 transition-all">
                  <input
                    autoFocus
                    type="number"
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    placeholder="Enter magnitude only"
                    className="bg-transparent flex-1 text-2xl font-bold text-white outline-none disabled:opacity-50"
                    disabled={checkedAnswers[currentQuestionIndex] !== undefined}
                  />
                  <span className="text-slate-500 font-mono font-bold uppercase tracking-widest px-4 border-l border-slate-800">
                    <LatexText text={question.unit} />
                  </span>
                </div>
              )}
            </div>

            {/* Check Answer Button & Feedback */}
            {checkedAnswers[currentQuestionIndex] === undefined ? (
              <div className="mb-8">
                <button
                  onClick={() => {
                    const isCorrect = userAnswer.trim().toLowerCase() === question.answerKey.trim().toLowerCase();
                    onCheckAnswer(currentQuestionIndex, isCorrect);
                  }}
                  disabled={!userAnswer.trim()}
                  className="w-full bg-blue-600 text-white font-black py-4 px-6 rounded-xl hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20 transform active:scale-[0.98]"
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className={`p-6 rounded-2xl border mb-8 animate-fade-in ${
                checkedAnswers[currentQuestionIndex] ? 'bg-green-950/20 border-green-500/50' : 'bg-red-950/20 border-red-500/50'
              }`}>
                <div className={`text-xl font-black mb-2 flex items-center gap-2 ${checkedAnswers[currentQuestionIndex] ? 'text-green-400' : 'text-red-400'}`}>
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                  {checkedAnswers[currentQuestionIndex] ? 'CORRECT' : 'WRONG'}
                </div>
                <div className="text-slate-300 text-sm leading-relaxed italic">
                  <span className="font-bold text-slate-100 not-italic block mb-1">Detailed Explanation:</span>
                  <div className="mt-2">
                    <LatexText text={question.explanation} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="flex gap-4 mt-auto pt-4 border-t border-slate-800">
          <button
            onClick={() => onNavigate(currentQuestionIndex - 1)}
            disabled={currentQuestionIndex === 0}
            className="flex-1 bg-slate-800 text-white font-black py-4 px-6 rounded-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest"
          >
            Previous
          </button>
          
          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              onClick={() => onNavigate(currentQuestionIndex + 1)}
              className="flex-1 bg-white text-slate-950 font-black py-4 px-6 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest shadow-xl"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onSubmitExam}
              className="flex-1 bg-amber-600 text-white font-black py-4 px-6 rounded-xl hover:bg-amber-500 transition-all uppercase tracking-widest shadow-lg shadow-amber-900/20"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPhase;
