
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, QuestionAnswer } from './types';
import { parseQuestionsFromText } from './services/geminiService';

import InputPhase from './components/InputPhase';
import SetupPhase from './components/SetupPhase';
import QuizPhase from './components/QuizPhase';
import ResultsPhase from './components/ResultsPhase';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [questions, setQuestions] = useState<QuestionAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleQuizFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleProcessText = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedQuestions = await parseQuestionsFromText(text);
      if (parsedQuestions.length === 0) throw new Error("No questions detected.");
      setQuestions(parsedQuestions);
      setAppState(AppState.SETUP);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parsing error.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartExam = (minutes: number) => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setScore(0);
    startTimer(minutes);
  };

  const handleQuizFinish = useCallback(() => {
    stopTimer();
    setAppState(AppState.RESULTS);
  }, []);

  const handleRestart = () => {
    setAppState(AppState.INPUT);
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.INPUT:
        return <InputPhase onProcess={handleProcessText} isLoading={isLoading} error={error} />;
      case AppState.SETUP:
        return <SetupPhase onStart={handleStartExam} />;
      case AppState.QUIZ:
        return (
          <QuizPhase
            question={questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onCorrect={() => setScore(s => s + 1)}
            onNext={() => {
              if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                handleQuizFinish();
              }
            }}
            timeLeft={timeLeft}
          />
        );
      case AppState.RESULTS:
        return (
          <ResultsPhase 
            score={score}
            totalQuestions={questions.length}
            timeTaken={totalTime - timeLeft}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-500/30">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/30 mb-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-amber-500">Academic Simulator</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">NTOW'S EXAMS SIMULATOR</h1>
        </header>
        <main className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-10 min-h-[450px] flex flex-col justify-center transition-all duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
          {renderContent()}
        </main>
        <footer className="text-center mt-12 text-slate-600 text-[10px] font-mono uppercase tracking-widest">
          <p>&copy; 2024 Ntow Ed-Tech Systems // Ghana Academic Support</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
