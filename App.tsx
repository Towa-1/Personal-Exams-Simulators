
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
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [checkedAnswers, setCheckedAnswers] = useState<Record<number, boolean>>({});
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('simulatorState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAppState(parsed.appState);
        setQuestions(parsed.questions);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setUserAnswers(parsed.userAnswers);
        setMarkedForReview(new Set(parsed.markedForReview));
        setCheckedAnswers(parsed.checkedAnswers);
        setScore(parsed.score);
        setTimeLeft(parsed.timeLeft);
        setTotalTime(parsed.totalTime);
        setIsPaused(parsed.isPaused);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && (appState !== AppState.INPUT || questions.length > 0)) {
      const stateToSave = {
        appState,
        questions,
        currentQuestionIndex,
        userAnswers,
        markedForReview: Array.from(markedForReview),
        checkedAnswers,
        score,
        timeLeft,
        totalTime,
        isPaused
      };
      localStorage.setItem('simulatorState', JSON.stringify(stateToSave));
    }
  }, [isLoaded, appState, questions, currentQuestionIndex, userAnswers, markedForReview, checkedAnswers, score, timeLeft, totalTime, isPaused]);

  const handleQuizFinish = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Calculate score based on checked answers
    setCheckedAnswers(prev => {
      let newScore = Object.values(prev).filter(Boolean).length;
      setScore(newScore);
      return prev;
    });
    
    setAppState(AppState.RESULTS);
  }, []);

  // Timer effect
  useEffect(() => {
    if (appState === AppState.QUIZ && !isPaused && timeLeft > 0) {
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
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [appState, isPaused, handleQuizFinish]);

  const startTimer = (minutes: number) => {
    const seconds = minutes * 60;
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
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
    setUserAnswers({});
    setMarkedForReview(new Set());
    setCheckedAnswers({});
    setScore(0);
    startTimer(minutes);
  };

  const handleRestart = () => {
    setAppState(AppState.INPUT);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setCheckedAnswers({});
    setScore(0);
    setTimeLeft(0);
    setTotalTime(0);
    setIsPaused(false);
    localStorage.removeItem('simulatorState');
  };

  const renderContent = () => {
    if (!isLoaded) return null; // Wait for localStorage to load

    switch (appState) {
      case AppState.INPUT:
        return <InputPhase onProcess={handleProcessText} isLoading={isLoading} error={error} />;
      case AppState.SETUP:
        return <SetupPhase onStart={handleStartExam} />;
      case AppState.QUIZ:
        return (
          <QuizPhase
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            markedForReview={markedForReview}
            checkedAnswers={checkedAnswers}
            onAnswerChange={(answer) => setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }))}
            onToggleMark={() => {
              setMarkedForReview(prev => {
                const newSet = new Set(prev);
                if (newSet.has(currentQuestionIndex)) {
                  newSet.delete(currentQuestionIndex);
                } else {
                  newSet.add(currentQuestionIndex);
                }
                return newSet;
              });
            }}
            onNavigate={(index) => setCurrentQuestionIndex(index)}
            onCheckAnswer={(index, isCorrect) => setCheckedAnswers(prev => ({ ...prev, [index]: isCorrect }))}
            onSubmitExam={handleQuizFinish}
            timeLeft={timeLeft}
            isPaused={isPaused}
            onTogglePause={togglePause}
            onExit={handleRestart}
          />
        );
      case AppState.RESULTS:
        return (
          <ResultsPhase 
            score={score}
            totalQuestions={questions.length}
            timeTaken={totalTime - timeLeft}
            questions={questions}
            userAnswers={userAnswers}
            onRestart={handleRestart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-amber-500/30">
      <div className="w-full max-w-4xl mx-auto">
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
