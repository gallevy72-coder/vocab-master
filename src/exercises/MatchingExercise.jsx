import { useState } from 'react';

function MatchingExercise({
  currentWord,
  options,
  feedback,
  isTransitioning,
  onAnswer,
  onSkip,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    if (isTransitioning) return;
    setSelectedOption(option);
    onAnswer(option);

    // Reset selection after a short delay
    setTimeout(() => setSelectedOption(null), 300);
  };

  const getOptionClasses = (option) => {
    const baseClasses =
      'w-full p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 rtl touch-target';

    if (selectedOption === option) {
      if (feedback === 'correct') {
        return `${baseClasses} border-success-500 bg-success-100 text-success-700 animate-pulse-success`;
      }
      if (feedback === 'incorrect') {
        return `${baseClasses} border-error-500 bg-error-100 text-error-700 animate-shake`;
      }
    }

    return `${baseClasses} border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 cursor-pointer active:scale-95`;
  };

  if (!currentWord) return null;

  return (
    <div className="py-4">
      {/* Word Display */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">What is the Hebrew translation of:</p>
        <h2 className="text-4xl font-bold text-gray-900 ltr">{currentWord.en}</h2>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={`${option}-${index}`}
            onClick={() => handleOptionClick(option)}
            disabled={isTransitioning}
            className={getOptionClasses(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Skip Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onSkip}
          disabled={isTransitioning}
          className="text-sm text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
        >
          Skip this word
        </button>
      </div>
    </div>
  );
}

export default MatchingExercise;
