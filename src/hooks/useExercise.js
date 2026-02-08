import { useState, useCallback, useEffect } from 'react';
import { shuffleArray, generateOptions } from '../utils/helpers';
import { FEEDBACK_DELAY, EXERCISE_TYPES } from '../utils/constants';

export function useExercise(words, exerciseType = EXERCISE_TYPES.MATCHING) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [answers, setAnswers] = useState([]);

  const generateOptionsForWord = useCallback((word, allWords) => {
    if (!word) return;
    const allHebrewOptions = allWords.map((w) => w.he);
    const newOptions = generateOptions(word.he, allHebrewOptions, 4);
    setOptions(newOptions);
  }, []);

  // Initialize exercise
  useEffect(() => {
    if (words && words.length > 0) {
      const shuffled = shuffleArray(words);
      setShuffledWords(shuffled);
      setCurrentIndex(0);
      setSessionComplete(false);
      setAnswers([]);
      // Generate options inline to avoid dependency issues
      if (shuffled[0]) {
        const allHebrewOptions = shuffled.map((w) => w.he);
        const newOptions = generateOptions(shuffled[0].he, allHebrewOptions, 4);
        setOptions(newOptions);
      }
    }
  }, [words]);

  const currentWord = shuffledWords[currentIndex] || null;
  const progress = shuffledWords.length > 0
    ? ((currentIndex) / shuffledWords.length) * 100
    : 0;

  const moveToNext = useCallback(() => {
    if (currentIndex < shuffledWords.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      generateOptionsForWord(shuffledWords[nextIndex], shuffledWords);
      setFeedback(null);
      setIsTransitioning(false);
    } else {
      setSessionComplete(true);
      setFeedback(null);
      setIsTransitioning(false);
    }
  }, [currentIndex, shuffledWords, generateOptionsForWord]);

  const handleAnswer = useCallback(
    (selectedAnswer, onCorrect, onIncorrect) => {
      if (isTransitioning || !currentWord) return;

      const isCorrect = selectedAnswer === currentWord.he;

      setAnswers((prev) => [
        ...prev,
        {
          wordId: currentWord.id,
          word: currentWord.en,
          correct: currentWord.he,
          selected: selectedAnswer,
          isCorrect,
        },
      ]);

      if (isCorrect) {
        const needsDelayedFeedback =
          exerciseType === EXERCISE_TYPES.AUDIO ||
          exerciseType === EXERCISE_TYPES.SENTENCE;

        if (needsDelayedFeedback) {
          setFeedback('correct');
          setIsTransitioning(true);

          setTimeout(() => {
            onCorrect?.(currentWord);
            moveToNext();
          }, FEEDBACK_DELAY.DELAYED);
        } else {
          onCorrect?.(currentWord);
          moveToNext();
        }
      } else {
        setFeedback('incorrect');
        onIncorrect?.(currentWord);

        setTimeout(() => {
          setFeedback(null);
        }, 500);
      }
    },
    [currentWord, isTransitioning, exerciseType, moveToNext]
  );

  const skipWord = useCallback(() => {
    if (isTransitioning) return;

    setShuffledWords((prev) => {
      const newWords = [...prev];
      const skipped = newWords.splice(currentIndex, 1)[0];
      newWords.push(skipped);
      return newWords;
    });

    if (shuffledWords[currentIndex + 1]) {
      generateOptionsForWord(shuffledWords[currentIndex + 1], shuffledWords);
    }
  }, [currentIndex, shuffledWords, isTransitioning, generateOptionsForWord]);

  const restart = useCallback(() => {
    const shuffled = shuffleArray(words);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setSessionComplete(false);
    setFeedback(null);
    setIsTransitioning(false);
    setAnswers([]);
    if (shuffled[0]) {
      const allHebrewOptions = shuffled.map((w) => w.he);
      const newOptions = generateOptions(shuffled[0].he, allHebrewOptions, 4);
      setOptions(newOptions);
    }
  }, [words]);

  const getSessionStats = useCallback(() => {
    const correct = answers.filter((a) => a.isCorrect).length;
    const wrong = answers.filter((a) => !a.isCorrect).length;
    const total = correct + wrong;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    return { correct, wrong, total, accuracy, answers };
  }, [answers]);

  return {
    currentWord,
    currentIndex,
    options,
    feedback,
    isTransitioning,
    sessionComplete,
    progress,
    totalWords: shuffledWords.length,
    handleAnswer,
    skipWord,
    restart,
    getSessionStats,
    answers,
  };
}
