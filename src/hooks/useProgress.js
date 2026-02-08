import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProgress, updateProgress, getWordsDueForReview } from '../services/firestore';

export function useProgress(listId = null) {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [dueWords, setDueWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setDueWords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [progressData, dueData] = await Promise.all([
        getProgress(user.uid, listId),
        getWordsDueForReview(user.uid, listId),
      ]);
      setProgress(progressData);
      setDueWords(dueData);
      setError(null);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, listId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const recordAnswer = useCallback(
    async (wordId, currentListId, isCorrect) => {
      if (!user) return;

      try {
        await updateProgress(user.uid, wordId, currentListId || listId, isCorrect);
        // Refresh progress after update
        await fetchProgress();
      } catch (err) {
        console.error('Error updating progress:', err);
        throw err;
      }
    },
    [user, listId, fetchProgress]
  );

  const getWordProgress = useCallback(
    (wordId) => {
      return progress.find((p) => p.wordId === wordId) || null;
    },
    [progress]
  );

  const isWordMastered = useCallback(
    (wordId) => {
      const wordProgress = getWordProgress(wordId);
      if (!wordProgress) return false;
      // Consider mastered if interval is 30 days and success rate > 80%
      const successRate =
        wordProgress.correctCount /
        (wordProgress.correctCount + wordProgress.wrongCount || 1);
      return wordProgress.interval >= 30 && successRate >= 0.8;
    },
    [getWordProgress]
  );

  const getMasteredCount = useCallback(() => {
    return progress.filter((p) => {
      const successRate = p.correctCount / (p.correctCount + p.wrongCount || 1);
      return p.interval >= 30 && successRate >= 0.8;
    }).length;
  }, [progress]);

  const getSuccessRate = useCallback(() => {
    const total = progress.reduce(
      (acc, p) => ({
        correct: acc.correct + p.correctCount,
        wrong: acc.wrong + p.wrongCount,
      }),
      { correct: 0, wrong: 0 }
    );
    const totalAttempts = total.correct + total.wrong;
    return totalAttempts > 0 ? (total.correct / totalAttempts) * 100 : 0;
  }, [progress]);

  return {
    progress,
    dueWords,
    loading,
    error,
    recordAnswer,
    getWordProgress,
    isWordMastered,
    getMasteredCount,
    getSuccessRate,
    refresh: fetchProgress,
  };
}
