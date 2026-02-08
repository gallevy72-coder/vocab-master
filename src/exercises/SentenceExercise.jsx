import { useState, useMemo } from 'react';

// Example sentences for demo purposes
const EXAMPLE_SENTENCES = {
  apple: 'I like to eat a fresh ___ every morning.',
  book: 'She is reading an interesting ___ about history.',
  computer: 'He uses his ___ for work every day.',
  window: 'Please open the ___ to let fresh air in.',
  teacher: 'The ___ explained the lesson very clearly.',
  student: 'The ___ asked many questions during class.',
  beautiful: 'The sunset was absolutely ___ tonight.',
  important: 'This is a very ___ decision for our future.',
  environment: 'We must protect the ___ for future generations.',
  knowledge: 'Reading helps expand your ___ of the world.',
  understand: 'I finally ___ how this works.',
  remember: 'Do you ___ what happened yesterday?',
  difficult: 'This math problem is very ___.',
  experience: 'This job requires at least 3 years of ___.',
  communication: 'Good ___ is essential in a team.',
};

function SentenceExercise({
  currentWord,
  options,
  feedback,
  isTransitioning,
  onAnswer,
  onSkip,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  // Get or generate sentence for current word
  const sentence = useMemo(() => {
    if (!currentWord) return '';
    return (
      EXAMPLE_SENTENCES[currentWord.en.toLowerCase()] ||
      `The word is ___. Can you find the Hebrew translation?`
    );
  }, [currentWord]);

  const handleOptionClick = (option) => {
    if (isTransitioning) return;
    setSelectedOption(option);
    onAnswer(option);
    setTimeout(() => setSelectedOption(null), 600);
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

  // Split sentence to highlight the blank
  const sentenceParts = sentence.split('___');

  return (
    <div className="py-4">
      {/* Sentence Display */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-4">Fill in the blank and select the Hebrew translation:</p>

        <div className="bg-gray-50 rounded-xl p-6 mb-4">
          <p className="text-xl leading-relaxed ltr">
            {sentenceParts[0]}
            <span className="inline-block px-4 py-1 mx-1 bg-primary-100 text-primary-700 rounded-lg font-bold border-2 border-dashed border-primary-300">
              {currentWord.en}
            </span>
            {sentenceParts[1]}
          </p>
        </div>

        <p className="text-sm text-gray-600">
          What does <span className="font-bold text-primary-600">{currentWord.en}</span> mean?
        </p>
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

export default SentenceExercise;
