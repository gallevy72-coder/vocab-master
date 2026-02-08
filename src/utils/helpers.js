import { LEVEL_THRESHOLDS, POINTS_BY_DIFFICULTY, SR_INTERVALS } from './constants';

/**
 * Calculate level from XP
 */
export function calculateLevel(xp) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calculate XP needed for next level
 */
export function xpToNextLevel(xp) {
  const currentLevel = calculateLevel(xp);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0;
  }
  return LEVEL_THRESHOLDS[currentLevel] - xp;
}

/**
 * Get progress percentage to next level
 */
export function getLevelProgress(xp) {
  const currentLevel = calculateLevel(xp);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 100;
  }
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Calculate points for a correct answer
 */
export function calculatePoints(difficulty, streak = 0) {
  const basePoints = POINTS_BY_DIFFICULTY[difficulty] || 10;
  const streakBonus = Math.min(streak * 2, 20); // Max 20 bonus points
  return basePoints + streakBonus;
}

/**
 * Calculate next review date based on SM-2 algorithm
 */
export function calculateNextReview(repetitions, correctCount, wrongCount) {
  const successRate = correctCount / (correctCount + wrongCount || 1);

  // If success rate is low, reset to beginning
  if (successRate < 0.6 && repetitions > 0) {
    return {
      interval: SR_INTERVALS[0],
      repetitions: 0,
    };
  }

  // Move to next interval
  const intervalIndex = Math.min(repetitions, SR_INTERVALS.length - 1);
  return {
    interval: SR_INTERVALS[intervalIndex],
    repetitions: repetitions + 1,
  };
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate random options for multiple choice
 */
export function generateOptions(correctAnswer, allAnswers, count = 4) {
  const options = [correctAnswer];
  const otherAnswers = allAnswers.filter(a => a !== correctAnswer);
  const shuffled = shuffleArray(otherAnswers);

  for (let i = 0; i < count - 1 && i < shuffled.length; i++) {
    options.push(shuffled[i]);
  }

  return shuffleArray(options);
}

/**
 * Format date for display
 */
export function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : date.toDate();
  return d.toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(nextReview) {
  if (!nextReview) return true;
  const reviewDate = nextReview instanceof Date ? nextReview : nextReview.toDate();
  return reviewDate <= new Date();
}

/**
 * Parse CSV to word list
 */
export function parseCSVToWords(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const word = {};
    headers.forEach((header, index) => {
      word[header] = values[index];
    });

    if (word.en && word.he) {
      words.push({
        id: `word_${Date.now()}_${i}`,
        en: word.en,
        he: word.he,
        difficulty: parseInt(word.difficulty) || 1,
        imageUrl: word.imageurl || word.image || null,
        audioUrl: word.audiourl || word.audio || null,
      });
    }
  }

  return words;
}

/**
 * Get struggling words (high error rate)
 */
export function getStrugglingWords(progressData, threshold = 0.5) {
  return progressData.filter(p => {
    const total = p.correctCount + p.wrongCount;
    if (total < 3) return false; // Need at least 3 attempts
    return p.correctCount / total < threshold;
  });
}
