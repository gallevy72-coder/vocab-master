import { useState, useMemo } from 'react';

// Placeholder images for demo (in production, these would come from the word data)
const PLACEHOLDER_IMAGES = {
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&h=200&fit=crop',
  book: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop',
  computer: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=200&fit=crop',
  window: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=200&h=200&fit=crop',
  teacher: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop',
  student: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=200&fit=crop',
};

function VisualExercise({
  currentWord,
  options,
  feedback,
  isTransitioning,
  onAnswer,
  onSkip,
}) {
  const [selectedOption, setSelectedOption] = useState(null);

  // Generate image options
  const imageOptions = useMemo(() => {
    return options.map((option) => ({
      he: option,
      // In production, map Hebrew to English and get the image URL
      imageUrl: Object.values(PLACEHOLDER_IMAGES)[
        Math.abs(option.charCodeAt(0)) % Object.keys(PLACEHOLDER_IMAGES).length
      ],
    }));
  }, [options]);

  const handleOptionClick = (option) => {
    if (isTransitioning) return;
    setSelectedOption(option);
    onAnswer(option);
    setTimeout(() => setSelectedOption(null), 300);
  };

  const getOptionClasses = (option) => {
    const baseClasses =
      'relative rounded-xl border-4 overflow-hidden transition-all duration-200 cursor-pointer touch-target';

    if (selectedOption === option) {
      if (feedback === 'correct') {
        return `${baseClasses} border-success-500 ring-4 ring-success-200 animate-pulse-success`;
      }
      if (feedback === 'incorrect') {
        return `${baseClasses} border-error-500 ring-4 ring-error-200 animate-shake`;
      }
    }

    return `${baseClasses} border-gray-200 hover:border-primary-300 hover:ring-4 hover:ring-primary-100 active:scale-95`;
  };

  if (!currentWord) return null;

  return (
    <div className="py-4">
      {/* Word Display */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">Select the image that matches:</p>
        <h2 className="text-4xl font-bold text-gray-900 ltr">{currentWord.en}</h2>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 gap-4">
        {imageOptions.map((option, index) => (
          <button
            key={`${option.he}-${index}`}
            onClick={() => handleOptionClick(option.he)}
            disabled={isTransitioning}
            className={getOptionClasses(option.he)}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={option.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-center py-2 text-lg font-medium rtl">
              {option.he}
            </div>
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

export default VisualExercise;
