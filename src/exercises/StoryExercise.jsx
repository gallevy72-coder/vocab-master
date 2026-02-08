import { useState, useEffect } from 'react';
import { generateStoryFallback } from '../services/gemini';
import { Button, Card } from '../components/ui';
import Tooltip from '../components/Tooltip';

function StoryExercise({ words = [], onComplete }) {
  const [story, setStory] = useState(null);
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [showTranslations, setShowTranslations] = useState(false);

  const generateNewStory = async () => {
    setLoading(true);
    try {
      // Get English words from the word list
      const englishWords = words.slice(0, 5).map((w) => w.en);

      // Use fallback for demo - in production, use Firebase function
      const result = generateStoryFallback(englishWords);
      setStory(result.story);
      setHighlightedWords(englishWords);
      setSelectedWords(new Set());
    } catch (error) {
      console.error('Story generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (words.length > 0 && !story) {
      // Auto-generate story on mount
      const englishWords = words.slice(0, 5).map((w) => w.en);
      setLoading(true);
      Promise.resolve().then(() => {
        const result = generateStoryFallback(englishWords);
        setStory(result.story);
        setHighlightedWords(englishWords);
        setLoading(false);
      });
    }
  }, [words, story]);

  const handleWordClick = (word) => {
    setSelectedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  const renderStoryWithHighlights = () => {
    if (!story) return null;

    // Split story into words while preserving punctuation
    const tokens = story.split(/(\s+)/);

    return tokens.map((token, index) => {
      // Check if this token contains a highlighted word
      const cleanToken = token.replace(/[.,!?;:'"]/g, '').toLowerCase();
      const isHighlighted = highlightedWords.some(
        (hw) => hw.toLowerCase() === cleanToken
      );

      if (isHighlighted) {
        return (
          <Tooltip key={index} word={cleanToken}>
            <span
              onClick={() => handleWordClick(cleanToken)}
              className={`cursor-pointer rounded px-0.5 transition-colors ${
                selectedWords.has(cleanToken)
                  ? 'bg-success-200 text-success-800'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {token}
            </span>
          </Tooltip>
        );
      }

      return <span key={index}>{token}</span>;
    });
  };

  const allWordsFound = highlightedWords.every((w) =>
    selectedWords.has(w.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Story Time</h2>
        <p className="text-gray-600">
          Read the story and click on the vocabulary words you recognize.
        </p>
      </div>

      {loading ? (
        <Card className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4" />
            <p className="text-gray-600">Generating your story...</p>
          </div>
        </Card>
      ) : story ? (
        <>
          <Card className="mb-6">
            <p className="text-lg leading-relaxed ltr">{renderStoryWithHighlights()}</p>
          </Card>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Highlighted words are from your vocabulary list</li>
              <li>• Click on each highlighted word to mark it as found</li>
              <li>• Hover over words to see their translation</li>
              <li>• Find all {highlightedWords.length} words to complete the exercise</li>
            </ul>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm text-gray-600">
              Words found: {selectedWords.size} / {highlightedWords.length}
            </span>
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className="text-sm text-primary-600 hover:text-primary-700 underline"
            >
              {showTranslations ? 'Hide translations' : 'Show translations'}
            </button>
          </div>

          {/* Word List */}
          {showTranslations && (
            <Card className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Vocabulary Words:</h3>
              <div className="grid grid-cols-2 gap-2">
                {words.slice(0, 5).map((word) => (
                  <div
                    key={word.id}
                    className={`p-2 rounded-lg text-sm ${
                      selectedWords.has(word.en.toLowerCase())
                        ? 'bg-success-100 text-success-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="ltr font-medium">{word.en}</span>
                    <span className="mx-2">-</span>
                    <span className="rtl">{word.he}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <Button variant="secondary" onClick={generateNewStory} disabled={loading}>
              Generate New Story
            </Button>
            {allWordsFound && (
              <Button
                variant="success"
                onClick={() => onComplete?.({ wordsFound: selectedWords.size })}
              >
                Complete Exercise
              </Button>
            )}
          </div>

          {allWordsFound && (
            <div className="mt-6 p-4 bg-success-50 rounded-xl text-center">
              <p className="text-success-700 font-medium">
                Excellent! You found all the vocabulary words!
              </p>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-600 mb-4">No story generated yet.</p>
          <Button onClick={generateNewStory}>Generate Story</Button>
        </Card>
      )}
    </div>
  );
}

export default StoryExercise;
