
import React, { useState } from 'react';

interface SetupPhaseProps {
  onStart: (minutes: number) => void;
}

const SetupPhase: React.FC<SetupPhaseProps> = ({ onStart }) => {
  const [minutes, setMinutes] = useState('30');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(minutes, 10);
    if (!isNaN(val) && val > 0) {
      onStart(val);
    }
  };

  return (
    <div className="text-center animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Exam Configuration</h2>
        <p className="text-slate-400">Define your session duration before initiating the simulator.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xs mx-auto">
        <div className="mb-6">
          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Session Duration (Minutes)</label>
          <input
            autoFocus
            type="number"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            className="w-full p-4 bg-slate-950 border-2 border-slate-800 rounded-xl focus:border-amber-500 outline-none text-center text-3xl font-black tracking-tight text-white transition-all placeholder:text-slate-700"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-600 text-white font-black py-4 px-8 rounded-xl hover:bg-amber-500 transition-all uppercase tracking-widest shadow-lg shadow-amber-900/20"
        >
          Start Exam
        </button>
      </form>
    </div>
  );
};

export default SetupPhase;
