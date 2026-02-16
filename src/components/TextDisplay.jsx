import { useMemo } from 'react';

/**
 * Reusable component that renders text with clickable/highlighted words.
 *
 * Modes:
 * - "teacher-select": Teacher clicks words to select them (clickable, toggles selection)
 * - "student-read": Student clicks words — teacher-selected words get collected,
 *                   non-selected words show translation via callback
 * - "highlight": Words are highlighted (for static display)
 */
function TextDisplay({
  text,
  selectedWords = [],
  mode = 'highlight',
  onWordClick,
  className = '',
}) {
  // Tokenize text into words and whitespace/punctuation
  const tokens = useMemo(() => {
    if (!text) return [];
    return text.split(/(\s+)/).flatMap((segment) => {
      if (/^\s+$/.test(segment)) {
        return [{ type: 'space', value: segment }];
      }
      const match = segment.match(/^([^a-zA-Z']*)([\w'-]+)([^a-zA-Z']*)$/);
      if (match) {
        const tokens = [];
        if (match[1]) tokens.push({ type: 'punct', value: match[1] });
        tokens.push({ type: 'word', value: match[2], clean: match[2].toLowerCase().replace(/['']/g, "'") });
        if (match[3]) tokens.push({ type: 'punct', value: match[3] });
        return tokens;
      }
      return [{ type: 'punct', value: segment }];
    });
  }, [text]);

  const selectedSet = useMemo(() => {
    return new Set(selectedWords.map((w) => w.toLowerCase()));
  }, [selectedWords]);

  return (
    <div className={`leading-relaxed text-lg ${className}`}>
      {tokens.map((token, i) => {
        if (token.type === 'space') {
          return <span key={i}>{token.value}</span>;
        }

        if (token.type === 'punct') {
          return <span key={i}>{token.value}</span>;
        }

        // Word token
        const isSelected = selectedSet.has(token.clean);

        // Teacher-select mode: words are clickable to toggle selection
        if (mode === 'teacher-select') {
          return (
            <span
              key={i}
              onClick={() => onWordClick && onWordClick(token.clean)}
              className={`cursor-pointer rounded px-0.5 transition-colors ${
                isSelected
                  ? 'bg-primary-200 text-primary-800 font-semibold'
                  : 'hover:bg-gray-100'
              }`}
            >
              {token.value}
            </span>
          );
        }

        // Student-read mode: all words clickable, different behavior per type
        if (mode === 'student-read') {
          return (
            <span
              key={i}
              onClick={(e) => onWordClick && onWordClick(token.clean, isSelected, e)}
              className={`cursor-pointer rounded px-0.5 transition-colors ${
                isSelected
                  ? 'bg-yellow-100 hover:bg-yellow-200 border-b-2 border-yellow-400'
                  : 'hover:bg-gray-100'
              }`}
              title={isSelected ? 'Click to collect this word' : 'Click to see translation'}
            >
              {token.value}
            </span>
          );
        }

        // Highlight mode (default)
        if (isSelected) {
          return (
            <span
              key={i}
              className="bg-yellow-200 text-yellow-900 font-semibold rounded px-0.5"
            >
              {token.value}
            </span>
          );
        }

        return <span key={i}>{token.value}</span>;
      })}
    </div>
  );
}

export default TextDisplay;
