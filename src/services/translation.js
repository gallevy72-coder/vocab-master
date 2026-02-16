// Translation service using MyMemory API (free, no key required)
// Translates English → Hebrew with rate limiting

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';
const DELAY_MS = 300; // Rate limit: 300ms between requests

// Simple dictionary fallback for common words
const DICTIONARY = {
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
  house: 'בית',
  water: 'מים',
  food: 'אוכל',
  dog: 'כלב',
  cat: 'חתול',
  school: 'בית ספר',
  friend: 'חבר',
  family: 'משפחה',
  love: 'אהבה',
  time: 'זמן',
  day: 'יום',
  night: 'לילה',
  morning: 'בוקר',
  city: 'עיר',
  world: 'עולם',
  life: 'חיים',
  work: 'עבודה',
  child: 'ילד',
  children: 'ילדים',
  man: 'איש',
  woman: 'אישה',
  people: 'אנשים',
  big: 'גדול',
  small: 'קטן',
  new: 'חדש',
  old: 'ישן',
  good: 'טוב',
  bad: 'רע',
  happy: 'שמח',
  sad: 'עצוב',
  fast: 'מהיר',
  slow: 'איטי',
  help: 'עזרה',
  learn: 'ללמוד',
  write: 'לכתוב',
  read: 'לקרוא',
  speak: 'לדבר',
  think: 'לחשוב',
  go: 'ללכת',
  come: 'לבוא',
  see: 'לראות',
  know: 'לדעת',
  want: 'לרצות',
  give: 'לתת',
  take: 'לקחת',
  make: 'לעשות',
  find: 'למצוא',
  run: 'לרוץ',
  walk: 'ללכת',
  eat: 'לאכול',
  drink: 'לשתות',
  play: 'לשחק',
  open: 'לפתוח',
  close: 'לסגור',
  begin: 'להתחיל',
  end: 'לסיים',
  story: 'סיפור',
  adventure: 'הרפתקה',
  color: 'צבע',
  red: 'אדום',
  blue: 'כחול',
  green: 'ירוק',
  white: 'לבן',
  black: 'שחור',
  sun: 'שמש',
  moon: 'ירח',
  star: 'כוכב',
  tree: 'עץ',
  flower: 'פרח',
  mountain: 'הר',
  river: 'נהר',
  sea: 'ים',
  rain: 'גשם',
  wind: 'רוח',
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Translate a single English word to Hebrew using MyMemory API
 * Falls back to local dictionary if API fails
 */
export async function translateWord(word) {
  const lower = word.toLowerCase().trim();

  // Check dictionary first
  if (DICTIONARY[lower]) {
    return DICTIONARY[lower];
  }

  try {
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(lower)}&langpair=en|he`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translation = data.responseData.translatedText;
      // MyMemory sometimes returns the original word if it can't translate
      if (translation.toLowerCase() !== lower) {
        return translation;
      }
    }

    return null; // No translation found
  } catch (error) {
    console.warn(`Translation failed for "${word}":`, error.message);
    return null;
  }
}

/**
 * Translate multiple words with rate limiting
 * Returns array of { en, he } objects (he may be null if translation failed)
 */
export async function translateWords(words) {
  const results = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const translation = await translateWord(word);
    results.push({ en: word, he: translation });

    // Rate limit - don't delay after the last word
    if (i < words.length - 1) {
      await delay(DELAY_MS);
    }
  }

  return results;
}

/**
 * Find the sentence in the text that contains the given word
 */
export function findSentenceForWord(text, word) {
  // Split text into sentences (handle ., !, ?)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  // Find sentence containing the word (case-insensitive, whole word)
  const wordRegex = new RegExp(`\\b${escapeRegex(word)}\\b`, 'i');
  const sentence = sentences.find((s) => wordRegex.test(s));

  return sentence ? sentence.trim() : text.split('.')[0].trim() + '.';
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
