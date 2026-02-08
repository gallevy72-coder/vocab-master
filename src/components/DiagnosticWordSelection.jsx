import { useState, useMemo } from 'react';
import { Card, Button, Badge } from './ui';
import Tooltip from './Tooltip';

// Sample curriculum text for demonstration
const SAMPLE_TEXT = `
Learning English opens up a world of opportunities. When you understand new vocabulary,
you can communicate with people from different countries and cultures.

Education is important for everyone. Students who study hard and remember their lessons
become successful in life. A good teacher helps students discover their potential.

The environment around us needs our attention. We must protect nature for future generations.
With knowledge and experience, we can solve many difficult problems.

Communication skills are essential in today's world. Whether you're using a computer or
having a beautiful conversation, being able to express yourself clearly is valuable.
`;

function DiagnosticWordSelection({
  text = SAMPLE_TEXT,
  onWordsSelected,
  availableWords = [],
}) {
  const [selectedWords, setSelectedWords] = useState(new Set());

  // Parse text into clickable words
  const tokens = useMemo(() => {
    return text.split(/(\s+|[.,!?;:'"()]+)/).filter(Boolean);
  }, [text]);

  // Get words that can be selected (exist in available vocabulary)
  const selectableWords = useMemo(() => {
    if (availableWords.length > 0) {
      return new Set(availableWords.map((w) => w.en.toLowerCase()));
    }
    // Default vocabulary words
    return new Set([
      'learning', 'english', 'opportunities', 'understand', 'vocabulary',
      'communicate', 'countries', 'cultures', 'education', 'important',
      'students', 'study', 'remember', 'lessons', 'successful', 'teacher',
      'discover', 'potential', 'environment', 'protect', 'nature',
      'knowledge', 'experience', 'difficult', 'problems', 'communication',
      'essential', 'computer', 'beautiful', 'conversation', 'express', 'valuable',
    ]);
  }, [availableWords]);

  const handleWordClick = (word) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    if (!selectableWords.has(cleanWord)) return;

    setSelectedWords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cleanWord)) {
        newSet.delete(cleanWord);
      } else {
        newSet.add(cleanWord);
      }
      return newSet;
    });
  };

  const handleConfirmSelection = () => {
    const selectedWordList = Array.from(selectedWords).map((word) => {
      const foundWord = availableWords.find(
        (w) => w.en.toLowerCase() === word
      );
      return foundWord || { en: word, he: '', difficulty: 1 };
    });
    onWordsSelected?.(selectedWordList);
  };

  const handleClearSelection = () => {
    setSelectedWords(new Set());
  };

  const isSelectable = (token) => {
    const cleanToken = token.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    return selectableWords.has(cleanToken);
  };

  const isSelected = (token) => {
    const cleanToken = token.toLowerCase().replace(/[.,!?;:'"()]/g, '');
    return selectedWords.has(cleanToken);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>Select Words to Practice</Card.Title>
          <Card.Description>
            Click on highlighted words to add them to your personal practice list.
            Hover over words to see their translation.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {/* Text Display */}
          <div className="p-4 bg-gray-50 rounded-xl mb-6">
            <p className="text-lg leading-relaxed">
              {tokens.map((token, index) => {
                const selectable = isSelectable(token);
                const selected = isSelected(token);
                const cleanToken = token
                  .toLowerCase()
                  .replace(/[.,!?;:'"()]/g, '');

                if (selectable) {
                  return (
                    <Tooltip key={index} word={cleanToken}>
                      <span
                        onClick={() => handleWordClick(token)}
                        className={`cursor-pointer rounded px-0.5 transition-all ${
                          selected
                            ? 'bg-success-200 text-success-800 font-medium'
                            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                        }`}
                      >
                        {token}
                      </span>
                    </Tooltip>
                  );
                }

                return <span key={index}>{token}</span>;
              })}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-primary-100 rounded" />
              Available word
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 bg-success-200 rounded" />
              Selected word
            </span>
          </div>
        </Card.Content>
      </Card>

      {/* Selected Words */}
      <Card className="mb-6">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Selected Words ({selectedWords.size})</Card.Title>
              <Card.Description>
                {selectedWords.size === 0
                  ? 'Click on words above to select them'
                  : 'These words will be added to your practice list'}
              </Card.Description>
            </div>
            {selectedWords.size > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                Clear All
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Content>
          {selectedWords.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedWords).map((word) => (
                <Badge
                  key={word}
                  variant="success"
                  className="cursor-pointer hover:bg-success-200"
                  onClick={() => handleWordClick(word)}
                >
                  {word} ✕
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">
              No words selected yet. Click on highlighted words in the text above.
            </p>
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="secondary" onClick={handleClearSelection}>
          Reset
        </Button>
        <Button
          onClick={handleConfirmSelection}
          disabled={selectedWords.size === 0}
        >
          Practice Selected Words ({selectedWords.size})
        </Button>
      </div>
    </div>
  );
}

export default DiagnosticWordSelection;
