
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppState, QuestionAnswer } from './types';
import { parseQuestionsFromText } from './services/geminiService';

import InputPhase from './components/InputPhase';
import SetupPhase from './components/SetupPhase';
import QuizPhase from './components/QuizPhase';
import ResultsPhase from './components/ResultsPhase';

const App: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return true;
  });
  const timerRef = useRef<number | null>(null);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newTheme;
    });
  };

  const handleInstallClick = async () => {
    try {
      if (deferredPrompt && typeof deferredPrompt.prompt === 'function') {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } else {
        setShowInstallModal(true);
      }
    } catch (error) {
      console.error("Install prompt error:", error);
      setShowInstallModal(true);
    }
  };

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

  const handleRetake = () => {
    setAppState(AppState.QUIZ);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setMarkedForReview(new Set());
    setCheckedAnswers({});
    setScore(0);
    setTimeLeft(totalTime); // Use the previous total time
    setIsPaused(false);
    // Note: We do NOT clear questions here, so they can retake the same exam
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
            onRetake={handleRetake}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100 via-slate-50 to-slate-50 dark:from-yellow-900/20 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-yellow-500/30 transition-colors duration-300">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8 relative">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="absolute left-0 top-0 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-500 border border-blue-500/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a10 10 0 1 0 3.43-8.91L2.5 9"></path></svg>
              Update App
            </button>
          )}
          <div className="absolute right-0 top-0 flex gap-2">
            <button
              onClick={toggleTheme}
              className="bg-slate-200/50 hover:bg-slate-300/50 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700/50 p-1.5 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
            <button
              onClick={handleInstallClick}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-600 dark:text-yellow-500 border border-yellow-500/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Install App
            </button>
          </div>
          <div className="inline-block px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/30 mb-2 mt-8 md:mt-0">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-500">EMAGYNE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 dark:from-yellow-400 dark:via-yellow-500 dark:to-yellow-600 tracking-tight drop-shadow-sm">EMAGYNE SIMULATOR</h1>
        </header>
        <main className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-yellow-500/30 dark:border-yellow-500/20 shadow-2xl shadow-yellow-500/10 dark:shadow-yellow-900/10 p-6 md:p-10 min-h-[450px] flex flex-col justify-center transition-all duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
          {renderContent()}
        </main>
        
        {/* Install Modal */}
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in relative">
              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                How to Install
              </h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                <p>The automatic install prompt doesn't work inside this preview window or on certain devices (like iOS).</p>
                <p className="font-bold text-slate-900 dark:text-white">To install this app manually:</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Open the <a href="https://ais-pre-iuxvtpmzv4xjxt7q7whskt-161161414133.europe-west2.run.app" target="_blank" rel="noopener noreferrer" className="text-yellow-600 dark:text-yellow-500 hover:underline">Shared App URL</a> in a new browser tab (Safari/Chrome).</li>
                  <li>Tap the <strong>Share</strong> icon (iOS) or <strong>Browser Menu</strong> (Android/Desktop).</li>
                  <li>Select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.</li>
                </ol>
              </div>
              <button 
                onClick={() => setShowInstallModal(false)}
                className="mt-6 w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold py-3 px-4 rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}

        <footer className="text-center mt-12 text-slate-500 dark:text-slate-600 text-[10px] font-mono uppercase tracking-widest">
          <p>&copy; 2024 EMAGYNE Ed-Tech Systems // Ghana Academic Support</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
