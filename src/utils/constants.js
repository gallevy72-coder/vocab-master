// XP Level thresholds
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];

// Points per answer based on difficulty (1-5)
export const POINTS_BY_DIFFICULTY = {
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
};

// Spaced repetition intervals in days
export const SR_INTERVALS = [1, 3, 7, 14, 30];

// Badge definitions
export const BADGES = {
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'First Steps',
    nameHe: 'צעדים ראשונים',
    description: 'Complete your first exercise',
    descriptionHe: 'השלם את התרגיל הראשון שלך',
    icon: '🎯',
  },
  WORD_MASTER: {
    id: 'word_master',
    name: 'Word Master',
    nameHe: 'אלוף המילים',
    description: 'Master 50 words',
    descriptionHe: 'שלוט ב-50 מילים',
    icon: '📚',
  },
  STREAK_STAR: {
    id: 'streak_star',
    name: 'Streak Star',
    nameHe: 'כוכב הרצף',
    description: '7-day practice streak',
    descriptionHe: 'רצף תרגול של 7 ימים',
    icon: '⭐',
  },
  STORY_CREATOR: {
    id: 'story_creator',
    name: 'Story Creator',
    nameHe: 'יוצר סיפורים',
    description: 'Generate your first AI story',
    descriptionHe: 'צור את הסיפור הראשון שלך עם AI',
    icon: '📖',
  },
  PERFECT_ROUND: {
    id: 'perfect_round',
    name: 'Perfect Round',
    nameHe: 'סיבוב מושלם',
    description: 'Complete a practice session with no mistakes',
    descriptionHe: 'השלם סשן תרגול ללא טעויות',
    icon: '💯',
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    nameHe: 'שד המהירות',
    description: 'Answer 10 questions in under 30 seconds',
    descriptionHe: 'ענה על 10 שאלות בפחות מ-30 שניות',
    icon: '⚡',
  },
};

// Exercise types (kept for potential future use)
export const EXERCISE_TYPES = {
  MATCHING: 'matching',
};

// Default word list for demo purposes
export const DEFAULT_WORDS = [
  { id: '1', en: 'apple', he: 'תפוח', difficulty: 1 },
  { id: '2', en: 'book', he: 'ספר', difficulty: 1 },
  { id: '3', en: 'computer', he: 'מחשב', difficulty: 2 },
  { id: '4', en: 'window', he: 'חלון', difficulty: 1 },
  { id: '5', en: 'teacher', he: 'מורה', difficulty: 1 },
  { id: '6', en: 'student', he: 'תלמיד', difficulty: 1 },
  { id: '7', en: 'beautiful', he: 'יפה', difficulty: 2 },
  { id: '8', en: 'important', he: 'חשוב', difficulty: 2 },
  { id: '9', en: 'environment', he: 'סביבה', difficulty: 3 },
  { id: '10', en: 'knowledge', he: 'ידע', difficulty: 3 },
  { id: '11', en: 'understand', he: 'להבין', difficulty: 2 },
  { id: '12', en: 'remember', he: 'לזכור', difficulty: 2 },
  { id: '13', en: 'difficult', he: 'קשה', difficulty: 2 },
  { id: '14', en: 'experience', he: 'ניסיון', difficulty: 3 },
  { id: '15', en: 'communication', he: 'תקשורת', difficulty: 4 },
];
