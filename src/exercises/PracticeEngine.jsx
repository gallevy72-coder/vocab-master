import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../hooks/useProgress';
import { useExercise } from '../hooks/useExercise';
import { Card, Button, ProgressBar, Modal } from '../components/ui';
import { EXERCISE_TYPES } from '../utils/constants';
import MatchingExercise from './MatchingExercise';
import VisualExercise from './VisualExercise';
import AudioExercise from './AudioExercise';
import SentenceExercise from './SentenceExercise';

function PracticeEngine({ words, exerciseType = EXERCISE_TYPES.MATCHING, listId }) {
  const navigate = useNavigate();
  const { startSession, endSession, recordCorrectAnswer, recordWrongAnswer, sessionStats } = useGame();
  const { recordAnswer } = useProgress(listId);
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState(null);
  const hasEndedSession = useRef(false);

  const {
    currentWord,
    currentIndex,
    options,
    feedback,
    isTransitioning,
    sessionComplete,
    progress,
    totalWords,
    handleAnswer,
    skipWord,
    restart,
    getSessionStats,
  } = useExercise(words, exerciseType);

  useEffect(() => {
    startSession();
    hasEndedSession.current = false;
  }, [startSession]);

  // Handle session completion
  useEffect(() => {
    if (sessionComplete && !hasEndedSession.current) {
      hasEndedSession.current = true;
      const stats = getSessionStats();

      // Use a microtask to avoid synchronous setState warning
      Promise.resolve().then(() => {
        setFinalStats(stats);
        endSession().then(() => {
          setShowResults(true);
        });
      });
    }
  }, [sessionComplete, getSessionStats, endSession]);

  const handleCorrectAnswer = useCallback(
    async (word) => {
      await recordCorrectAnswer(word.difficulty || 1);
      await recordAnswer(word.id, listId, true);
    },
    [recordCorrectAnswer, recordAnswer, listId]
  );

  const handleWrongAnswer = useCallback(
    async (word) => {
      recordWrongAnswer();
      await recordAnswer(word.id, listId, false);
    },
    [recordWrongAnswer, recordAnswer, listId]
  );

  const onAnswer = useCallback(
    (selectedAnswer) => {
      handleAnswer(selectedAnswer, handleCorrectAnswer, handleWrongAnswer);
    },
    [handleAnswer, handleCorrectAnswer, handleWrongAnswer]
  );

  const handleRestart = () => {
    setShowResults(false);
    setFinalStats(null);
    hasEndedSession.current = false;
    startSession();
    restart();
  };

  const handleExit = () => {
    navigate('/practice');
  };

  const renderExercise = () => {
    const exerciseProps = {
      currentWord,
      options,
      feedback,
      isTransitioning,
      onAnswer,
      onSkip: skipWord,
    };

    switch (exerciseType) {
      case EXERCISE_TYPES.VISUAL:
        return <VisualExercise {...exerciseProps} />;
      case EXERCISE_TYPES.AUDIO:
        return <AudioExercise {...exerciseProps} />;
      case EXERCISE_TYPES.SENTENCE:
        return <SentenceExercise {...exerciseProps} />;
      case EXERCISE_TYPES.MATCHING:
      default:
        return <MatchingExercise {...exerciseProps} />;
    }
  };

  if (!currentWord && !sessionComplete) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentIndex + 1} of {totalWords}
          </span>
          <span className="text-sm font-medium text-primary-600">
            +{sessionStats.points} pts
          </span>
        </div>
        <ProgressBar value={progress} color="gradient" />
      </div>

      {sessionStats.streak > 2 && (
        <div className="mb-4 flex items-center justify-center">
          <span className="px-4 py-2 bg-success-100 text-success-700 rounded-full text-sm font-medium animate-bounce-in">
            {sessionStats.streak} Streak! +{Math.min(sessionStats.streak * 2, 20)} bonus
          </span>
        </div>
      )}

      <Card className="mb-6">
        {renderExercise()}
      </Card>

      <div className="flex justify-center space-x-6 text-sm text-gray-600">
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-success-500 mr-2" />
          Correct: {sessionStats.correct}
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-error-500 mr-2" />
          Wrong: {sessionStats.wrong}
        </span>
      </div>

      <Modal
        isOpen={showResults}
        onClose={handleExit}
        title="Practice Complete!"
        size="md"
      >
        {finalStats && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
              <div className="text-white">
                <div className="text-4xl font-bold">{Math.round(finalStats.accuracy)}%</div>
                <div className="text-sm opacity-90">Accuracy</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-success-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-success-600">{finalStats.correct}</div>
                <div className="text-sm text-success-700">Correct</div>
              </div>
              <div className="bg-error-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-error-600">{finalStats.wrong}</div>
                <div className="text-sm text-error-700">Wrong</div>
              </div>
            </div>

            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <div className="text-2xl font-bold text-primary-600">+{sessionStats.points}</div>
              <div className="text-sm text-primary-700">Points Earned</div>
            </div>

            <div className="flex space-x-4">
              <Button variant="secondary" fullWidth onClick={handleExit}>
                Back to Practice
              </Button>
              <Button variant="primary" fullWidth onClick={handleRestart}>
                Practice Again
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PracticeEngine;
