
import React, { useState, useEffect } from 'react';
import type { QuestionAnswer } from '../types';

interface QuizPhaseProps {
  question: QuestionAnswer;
  questionNumber: number;
  totalQuestions: number;
  onCorrect: () => void;
  onNext: () => void;
  timeLeft: number;
}

const QuizPhase: React.FC<QuizPhaseProps> = ({ 
  question, 
  questionNumber, 
  totalQuestions, 
  onCorrect,
  onNext,
  timeLeft 
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
  }, [question]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerSubmit = () => {
    const correct = userAnswer.trim().toLowerCase() === question.answerKey.trim().toLowerCase();
    setIsCorrect(correct);
    if (correct) onCorrect();
    setIsSubmitted(true);
  };

  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-end mb-4">
        <div>
          <span className="text-xs font-black text-amber-500 uppercase tracking-tighter block mb-1">Time Remaining</span>
          <div className="text-2xl font-mono font-bold text-white">
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-slate-500 block mb-1">Question</span>
          <div className="text-lg font-black text-white">
            {questionNumber.toString().padStart(2, '0')} <span className="text-slate-600 text-sm">/ {totalQuestions.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-800 h-1 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-amber-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {question.imageUrl && question.imageUrl !== 'null' && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-800 bg-white/5 p-2">
          <img 
            src={question.imageUrl} 
            alt="Exam Diagram" 
            className="w-full max-h-64 object-contain mx-auto"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
          {question.question}
        </h3>
      </div>

      <div className="mb-8">
        {question.type === 'MCQ' ? (
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, idx) => {
              const label = String.fromCharCode(65 + idx);
              const isSelected = userAnswer === option;
              return (
                <label
                  key={idx}
                  className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-500/10' 
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  } ${isSubmitted && isSelected ? (isCorrect ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10') : ''}
                    ${isSubmitted ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={isSelected}
                    onChange={() => setUserAnswer(option)}
                  />
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black mr-4 border-2 transition-all ${
                    isSelected ? 'bg-amber-500 border-amber-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}>
                    {label}
                  </div>
                  <span className={`flex-1 text-md ${isSelected ? 'text-white font-bold' : 'text-slate-400'}`}>
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-xl border-2 border-slate-800 focus-within:border-amber-500 transition-all">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Magnitude"
              className="bg-transparent flex-1 text-2xl font-bold text-white outline-none"
              disabled={isSubmitted}
            />
            <span className="text-slate-500 font-mono font-bold uppercase tracking-widest">{question.unit}</span>
          </div>
        )}
      </div>

      {isSubmitted && (
        <div className={`p-6 rounded-2xl border mb-8 animate-fade-in ${
          isCorrect ? 'bg-green-950/20 border-green-500/50' : 'bg-red-950/20 border-red-500/50'
        }`}>
          <div className={`text-xl font-black mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? 'CORRECT' : 'WRONG'}
          </div>
          <div className="text-slate-300 text-sm leading-relaxed italic">
            <span className="font-bold text-slate-100 not-italic block mb-1">Explanation:</span>
            {question.explanation}
          </div>
        </div>
      )}

      {!isSubmitted ? (
        <button
          onClick={handleAnswerSubmit}
          disabled={!userAnswer.trim()}
          className="w-full bg-amber-600 text-white font-black py-4 px-6 rounded-xl hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 transition-all uppercase tracking-widest shadow-lg shadow-amber-900/20"
        >
          Submit Answer
        </button>
      ) : (
        <button
          onClick={onNext}
          className="w-full bg-white text-slate-950 font-black py-4 px-6 rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest shadow-xl"
        >
          Next Question
        </button>
      )}
    </div>
  );
};

export default QuizPhase;
