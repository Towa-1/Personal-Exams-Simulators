
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
        <h2 className="text-2xl font-bold text-white mb-2">Initialize Dataset</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Input your questions using the format: <br/>
          <code className="text-amber-500 font-mono text-[10px]">Type (MCQ/NUM) | Question | Options/Unit | Answer | Explanation | ImageURL</code>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="MCQ | What is 2+2? | 3,4,5,6 | 4 | Math is logic. | null&#10;NUM | Speed = d/t. d=10, t=2. | m/s | 5 | Distance divided by time. | null"
            className="w-full h-56 p-5 bg-black border-2 border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-slate-300 font-mono text-sm resize-none placeholder:text-slate-800"
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
          className="mt-6 w-full bg-white text-black font-black py-4 px-6 rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center shadow-xl disabled:bg-slate-800 disabled:text-slate-600"
        >
          {isLoading ? <Loader /> : 'INITIALIZE SIMULATOR'}
        </button>
      </form>
    </div>
  );
};

export default InputPhase;
