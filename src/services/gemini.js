import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Translate a word or phrase to Hebrew using Gemini API
 * @param {string} word - The English word or phrase to translate
 * @param {string} context - Optional context for better translation
 * @returns {Promise<string>} Hebrew translation
 */
export async function translateWord(word, context = '') {
  try {
    const translateFn = httpsCallable(functions, 'translateWord');
    const result = await translateFn({ word, context });
    return result.data.translation;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate word');
  }
}

/**
 * Generate a story using target vocabulary words
 * @param {string[]} words - Array of English words to include in the story
 * @param {number} difficulty - Difficulty level 1-5
 * @returns {Promise<{story: string, highlightedWords: string[]}>}
 */
export async function generateStory(words, difficulty = 2) {
  try {
    const generateStoryFn = httpsCallable(functions, 'generateStory');
    const result = await generateStoryFn({ words, difficulty });
    return result.data;
  } catch (error) {
    console.error('Story generation error:', error);
    throw new Error('Failed to generate story');
  }
}

/**
 * Generate sentence examples for a word
 * @param {string} word - The English word
 * @param {number} count - Number of sentences to generate
 * @returns {Promise<string[]>} Array of example sentences
 */
export async function generateSentences(word, count = 3) {
  try {
    const generateSentencesFn = httpsCallable(functions, 'generateSentences');
    const result = await generateSentencesFn({ word, count });
    return result.data.sentences;
  } catch (error) {
    console.error('Sentence generation error:', error);
    throw new Error('Failed to generate sentences');
  }
}

// Fallback functions for when Firebase Functions are not configured

/**
 * Simple translation fallback (for demo/development)
 */
export function translateWordFallback(word) {
  // Basic dictionary for demo purposes
  const dictionary = {
    apple: 'תפוח',
    book: 'ספר',
    computer: 'מחשב',
    window: 'חלון',
    teacher: 'מורה',
    student: 'תלמיד',
    beautiful: 'יפה',
    important: 'חשוב',
    environment: 'סביבה',
    knowledge: 'ידע',
    understand: 'להבין',
    remember: 'לזכור',
    difficult: 'קשה',
    experience: 'ניסיון',
    communication: 'תקשורת',
  };

  return dictionary[word.toLowerCase()] || `[${word}]`;
}

/**
 * Simple story generator fallback (for demo/development)
 */
export function generateStoryFallback(words) {
  const templates = [
    `Once upon a time, there was a young student who loved to learn. They discovered that ${words[0] || 'learning'} was very ${words[1] || 'important'}. Every day, they would practice and grow stronger in their knowledge.`,
    `In a small classroom, a ${words[0] || 'teacher'} taught their students about the world. They learned about ${words[1] || 'nature'} and ${words[2] || 'science'}. The students were amazed by what they discovered.`,
    `The journey of learning begins with a single step. When you ${words[0] || 'study'} hard and ${words[1] || 'practice'} every day, you become ${words[2] || 'better'} at everything you do.`,
  ];

  const randomIndex = Math.floor(Math.random() * templates.length);
  return {
    story: templates[randomIndex],
    highlightedWords: words,
  };
}
