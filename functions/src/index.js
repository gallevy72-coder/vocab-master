import { onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Define the Gemini API key as a secret
const geminiApiKey = defineSecret('GEMINI_API_KEY');

/**
 * Translate a word from English to Hebrew using Gemini API
 */
export const translateWord = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
    const { word, context } = request.data;

    if (!word) {
      throw new Error('Word is required');
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = context
        ? `Translate the English word "${word}" to Hebrew in the context of: "${context}". Only provide the Hebrew translation, nothing else.`
        : `Translate the English word "${word}" to Hebrew. Only provide the Hebrew translation, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translation = response.text().trim();

      return { translation };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate word');
    }
  }
);

/**
 * Generate a story using vocabulary words with Gemini API
 */
export const generateStory = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
    const { words, difficulty = 2 } = request.data;

    if (!words || !Array.isArray(words) || words.length === 0) {
      throw new Error('Words array is required');
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const difficultyDescriptions = {
        1: 'very simple, using short sentences suitable for beginners',
        2: 'simple, using clear sentences suitable for elementary students',
        3: 'intermediate, using varied sentence structures',
        4: 'advanced, using complex sentences and vocabulary',
        5: 'very advanced, using sophisticated language',
      };

      const prompt = `Write a short story (3-4 paragraphs) for 8th grade EFL students that naturally includes these English vocabulary words: ${words.join(', ')}.

The story should be ${difficultyDescriptions[difficulty] || difficultyDescriptions[2]}.

Requirements:
- Use each vocabulary word at least once
- The story should be engaging and age-appropriate
- Keep it educational and interesting
- Make sure the context helps students understand the meaning of each word

Just provide the story, no additional commentary.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const story = response.text().trim();

      return {
        story,
        highlightedWords: words,
      };
    } catch (error) {
      console.error('Story generation error:', error);
      throw new Error('Failed to generate story');
    }
  }
);

/**
 * Generate example sentences for a word using Gemini API
 */
export const generateSentences = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
    const { word, count = 3 } = request.data;

    if (!word) {
      throw new Error('Word is required');
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Generate ${count} example sentences using the English word "${word}".

The sentences should be:
- Suitable for 8th grade EFL students
- Clear and help understand the meaning of the word
- Varied in context

Format: Return only the sentences, one per line, numbered 1., 2., 3., etc.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Parse the numbered sentences
      const sentences = text
        .split('\n')
        .map((line) => line.replace(/^\d+\.\s*/, '').trim())
        .filter((line) => line.length > 0);

      return { sentences };
    } catch (error) {
      console.error('Sentence generation error:', error);
      throw new Error('Failed to generate sentences');
    }
  }
);
