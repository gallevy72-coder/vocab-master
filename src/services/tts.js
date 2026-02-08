/**
 * Text-to-Speech service using Web Speech API
 */

let synth = null;
let voices = [];

// Initialize TTS
function initTTS() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    synth = window.speechSynthesis;

    // Load voices
    const loadVoices = () => {
      voices = synth.getVoices();
    };

    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  initTTS();
}

/**
 * Get the best English voice available
 */
function getEnglishVoice() {
  // Prefer US English voices
  const preferredVoices = [
    'Google US English',
    'Microsoft David',
    'Alex',
    'Samantha',
  ];

  for (const name of preferredVoices) {
    const voice = voices.find((v) => v.name.includes(name));
    if (voice) return voice;
  }

  // Fallback to any English voice
  const englishVoice = voices.find((v) => v.lang.startsWith('en'));
  return englishVoice || voices[0];
}

/**
 * Get the best Hebrew voice available
 */
function getHebrewVoice() {
  const hebrewVoice = voices.find((v) => v.lang.startsWith('he'));
  return hebrewVoice || null;
}

/**
 * Speak text using TTS
 * @param {string} text - Text to speak
 * @param {string} lang - Language code ('en' or 'he')
 * @param {number} rate - Speech rate (0.5 to 2, default 1)
 * @returns {Promise<void>}
 */
export function speak(text, lang = 'en', rate = 1) {
  return new Promise((resolve, reject) => {
    if (!synth) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Set voice based on language
    if (lang === 'he') {
      const hebrewVoice = getHebrewVoice();
      if (hebrewVoice) {
        utterance.voice = hebrewVoice;
        utterance.lang = 'he-IL';
      }
    } else {
      const englishVoice = getEnglishVoice();
      if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = 'en-US';
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(event.error));

    synth.speak(utterance);
  });
}

/**
 * Speak an English word
 * @param {string} word - English word to speak
 * @param {number} rate - Speech rate (default 0.9 for clarity)
 */
export function speakEnglish(word, rate = 0.9) {
  return speak(word, 'en', rate);
}

/**
 * Speak a Hebrew word
 * @param {string} word - Hebrew word to speak
 * @param {number} rate - Speech rate (default 0.9 for clarity)
 */
export function speakHebrew(word, rate = 0.9) {
  return speak(word, 'he', rate);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking() {
  if (synth) {
    synth.cancel();
  }
}

/**
 * Check if TTS is supported
 */
export function isTTSSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get available voices
 */
export function getAvailableVoices() {
  return voices;
}
