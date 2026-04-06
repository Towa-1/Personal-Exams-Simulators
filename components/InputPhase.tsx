
import React, { useState } from 'react';
import Loader from './Loader';

interface InputPhaseProps {
  onProcess: (text: string) => void;
  isLoading: boolean;
  error: string | null;
}

const InputPhase: React.FC<InputPhaseProps> = ({ onProcess, isLoading, error }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProcess(text);
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">Initialize Dataset</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          Input your questions using the 6-column pipe format: <br/>
          <code className="text-yellow-500 font-mono text-[10px]">Type | Question | Options/Unit | Answer | Explanation | IMAGE_URL</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="MCQ | Identify the logo. | Google,Apple,Meta | Google | This is the official Google logo. | https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png&#10;NUM | What is 50/2? | magnitude | 25 | Simple division. | null"
            className="w-full h-64 p-5 bg-white dark:bg-black border-2 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all text-slate-700 dark:text-slate-300 font-mono text-sm resize-none placeholder:text-slate-400 dark:placeholder:text-slate-800"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium animate-pulse">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="mt-6 w-full bg-slate-900 text-white dark:bg-white dark:text-black font-black py-4 px-6 rounded-xl hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-all flex items-center justify-center shadow-xl disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
        >
          {isLoading ? <Loader /> : 'INITIALIZE SIMULATOR'}
        </button>
      </form>
    </div>
  );
};

export default InputPhase;
