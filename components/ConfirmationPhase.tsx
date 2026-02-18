
import React from 'react';

interface ConfirmationPhaseProps {
  questionCount: number;
  onStart: () => void;
}

const ConfirmationPhase: React.FC<ConfirmationPhaseProps> = ({ questionCount, onStart }) => {
  return (
    <div className="text-center animate-fade-in">
      <h2 className="text-2xl font-semibold text-gray-300 mb-4">
        I have identified {questionCount} questions.
      </h2>
      <p className="text-gray-400 mb-6">Ready to test your knowledge?</p>
      <button
        onClick={onStart}
        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
      >
        Start
      </button>
    </div>
  );
};

export default ConfirmationPhase;
