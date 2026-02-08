import { useState, useEffect, useCallback } from 'react';
import { speakEnglish, isTTSSupported } from '../services/tts';

function AudioExercise({
  currentWord,
  options,
  feedback,
  isTransitioning,
  onAnswer,
  onSkip,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const playAudio = useCallback(async () => {
    if (!currentWord || isPlaying) return;

    setIsPlaying(true);
    try {
      await speakEnglish(currentWord.en);
      setHasPlayed(true);
    } catch (error) {
      console.error('TTS error:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [currentWord, isPlaying]);

  // Play audio when word changes
  useEffect(() => {
    setHasPlayed(false);
    if (currentWord && isTTSSupported()) {
      // Small delay to avoid rapid consecutive calls
      const timer = setTimeout(() => {
        speakEnglish(currentWord.en).then(() => setHasPlayed(true)).catch(console.error);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentWord?.id]);

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

  return (
    <div className="py-4">
      {/* Audio Player */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-4">Listen and select the correct meaning:</p>

        {/* Play Button */}
        <button
          onClick={playAudio}
          disabled={isPlaying}
          className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-200 touch-target ${
            isPlaying
              ? 'bg-primary-100 text-primary-500'
              : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
          }`}
        >
          {isPlaying ? (
            <svg className="w-12 h-12 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55A4 4 0 1014 17V7h4V3h-6z" />
            </svg>
          ) : (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>

        {!isTTSSupported() && (
          <p className="mt-4 text-sm text-error-500">
            Audio is not supported in your browser
          </p>
        )}

        {hasPlayed && (
          <button
            onClick={playAudio}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 underline"
          >
            Play again
          </button>
        )}
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

export default AudioExercise;
