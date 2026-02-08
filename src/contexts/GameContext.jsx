import { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { calculatePoints, calculateLevel, xpToNextLevel, getLevelProgress } from '../utils/helpers';
import { BADGES } from '../utils/constants';
import toast from 'react-hot-toast';

const GameContext = createContext(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function GameProvider({ children }) {
  const { userData, updateUserData } = useAuth();
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    wrong: 0,
    streak: 0,
    points: 0,
    startTime: null,
  });

  const startSession = useCallback(() => {
    setSessionStats({
      correct: 0,
      wrong: 0,
      streak: 0,
      points: 0,
      startTime: Date.now(),
    });
  }, []);

  const recordCorrectAnswer = useCallback(async (difficulty = 1) => {
    const points = calculatePoints(difficulty, sessionStats.streak);

    setSessionStats((prev) => ({
      ...prev,
      correct: prev.correct + 1,
      streak: prev.streak + 1,
      points: prev.points + points,
    }));

    // Update user data
    if (userData) {
      const newXP = (userData.xp || 0) + points;
      const newLevel = calculateLevel(newXP);
      const oldLevel = userData.level || 1;

      const updates = {
        totalScore: (userData.totalScore || 0) + points,
        xp: newXP,
        level: newLevel,
      };

      // Check for level up
      if (newLevel > oldLevel) {
        toast.success(`🎉 Level Up! You're now level ${newLevel}!`);
      }

      await updateUserData(updates);
    }

    return points;
  }, [sessionStats.streak, userData, updateUserData]);

  const recordWrongAnswer = useCallback(() => {
    setSessionStats((prev) => ({
      ...prev,
      wrong: prev.wrong + 1,
      streak: 0,
    }));
  }, []);

  const awardBadge = useCallback(async (badgeId) => {
    if (!userData) return;

    const currentBadges = userData.badges || [];
    if (currentBadges.includes(badgeId)) return;

    const badge = Object.values(BADGES).find((b) => b.id === badgeId);
    if (!badge) return;

    await updateUserData({
      badges: [...currentBadges, badgeId],
    });

    toast.success(`🏆 New Badge: ${badge.name}!`);
  }, [userData, updateUserData]);

  const checkAndAwardBadges = useCallback(async () => {
    if (!userData) return;

    const badges = userData.badges || [];
    const newBadges = [];

    // First Steps - first exercise completed
    if (!badges.includes('first_steps') && sessionStats.correct > 0) {
      newBadges.push('first_steps');
    }

    // Perfect Round - no mistakes in session
    if (!badges.includes('perfect_round') && sessionStats.correct >= 10 && sessionStats.wrong === 0) {
      newBadges.push('perfect_round');
    }

    // Speed Demon - 10 correct in under 30 seconds
    if (!badges.includes('speed_demon') && sessionStats.correct >= 10) {
      const elapsed = (Date.now() - sessionStats.startTime) / 1000;
      if (elapsed < 30) {
        newBadges.push('speed_demon');
      }
    }

    // Award new badges
    for (const badgeId of newBadges) {
      await awardBadge(badgeId);
    }
  }, [userData, sessionStats, awardBadge]);

  const endSession = useCallback(async () => {
    await checkAndAwardBadges();

    const finalStats = { ...sessionStats };
    setSessionStats({
      correct: 0,
      wrong: 0,
      streak: 0,
      points: 0,
      startTime: null,
    });

    return finalStats;
  }, [sessionStats, checkAndAwardBadges]);

  const value = {
    // Session stats
    sessionStats,
    startSession,
    endSession,

    // Scoring
    recordCorrectAnswer,
    recordWrongAnswer,

    // Badges
    awardBadge,
    checkAndAwardBadges,

    // Computed values
    currentLevel: userData?.level || 1,
    currentXP: userData?.xp || 0,
    xpToNext: xpToNextLevel(userData?.xp || 0),
    levelProgress: getLevelProgress(userData?.xp || 0),
    totalScore: userData?.totalScore || 0,
    badges: userData?.badges || [],
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
