import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import TextDisplay from '../components/TextDisplay';
import { getTextUnits, getTextUnit } from '../services/firestore';
import { translateWord } from '../services/translation';

function StudentReading() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [textUnits, setTextUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sidebar: collected teacher-selected words
  const [collectedWords, setCollectedWords] = useState([]);

  // Tooltip for non-selected word translations
  const [tooltip, setTooltip] = useState(null); // { word, translation, x, y }
  const [translating, setTranslating] = useState(false);
  const tooltipTimeout = useRef(null);

  // Load text list or specific text
  useEffect(() => {
    const load = async () => {
      try {
        if (id) {
          const unit = await getTextUnit(id);
          setSelectedUnit(unit);
        } else {
          const units = await getTextUnits();
          setTextUnits(units);
        }
      } catch (error) {
        console.error('Error loading texts:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (tooltip) {
        setTooltip(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [tooltip]);

  // Handle word click in reading mode
  const handleWordClick = async (word, isTeacherWord, event) => {
    event.stopPropagation();

    if (isTeacherWord) {
      // Teacher-selected word: add to sidebar (no translation shown)
      setCollectedWords((prev) => {
        if (prev.includes(word)) return prev;
        return [...prev, word];
      });
      setTooltip(null);
    } else {
      // Non-teacher word: show Hebrew translation tooltip
      const rect = event.target.getBoundingClientRect();
      setTooltip({ word, translation: null, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
      setTranslating(true);

      try {
        const translation = await translateWord(word);
        setTooltip((prev) => {
          if (prev && prev.word === word) {
            return { ...prev, translation: translation || 'No translation found' };
          }
          return prev;
        });
      } catch {
        setTooltip((prev) => {
          if (prev && prev.word === word) {
            return { ...prev, translation: 'Translation error' };
          }
          return prev;
        });
      } finally {
        setTranslating(false);
      }

      // Auto-hide after 4 seconds
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
      tooltipTimeout.current = setTimeout(() => setTooltip(null), 4000);
    }
  };

  const removeCollectedWord = (word) => {
    setCollectedWords((prev) => prev.filter((w) => w !== word));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  // ==================== TEXT LIST VIEW ====================
  if (!selectedUnit && !id) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reading Texts</h1>
          <p className="text-gray-600 mt-1">Choose a text to read</p>
        </div>

        {textUnits.length > 0 ? (
          <div className="grid gap-4">
            {textUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/read/${unit.id}`)}
                >
                  <h3 className="font-semibold text-gray-900 text-lg">{unit.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {unit.text?.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-gray-400">
                      {unit.words?.length || 0} vocabulary words
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-500">No texts available yet. Ask your teacher to add some!</p>
          </Card>
        )}
      </div>
    );
  }

  // ==================== READING VIEW ====================
  const teacherWords = (selectedUnit?.words || []).map((w) => w.en.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to texts
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main text area */}
        <div className="flex-1">
          <Card>
            <Card.Header>
              <Card.Title>{selectedUnit?.title}</Card.Title>
              <Card.Description>Click any word to translate or collect it</Card.Description>
            </Card.Header>
            <Card.Content>
              <TextDisplay
                text={selectedUnit?.text || ''}
                selectedWords={teacherWords}
                mode="student-read"
                onWordClick={handleWordClick}
                className="ltr"
              />
            </Card.Content>
          </Card>
        </div>

        {/* Sidebar: collected words */}
        <div className="lg:w-72 shrink-0">
          <Card className="lg:sticky lg:top-24">
            <Card.Header>
              <Card.Title>Words to Learn</Card.Title>
              <Card.Description>
                {collectedWords.length === 0
                  ? 'Click highlighted words to collect them'
                  : `${collectedWords.length} word${collectedWords.length !== 1 ? 's' : ''} collected`}
              </Card.Description>
            </Card.Header>
            <Card.Content>
              {collectedWords.length > 0 ? (
                <ul className="space-y-2">
                  {collectedWords.map((word) => (
                    <li
                      key={word}
                      className="flex items-center justify-between p-2 bg-primary-50 rounded-lg"
                    >
                      <span className="font-medium text-primary-800 ltr">{word}</span>
                      <button
                        onClick={() => removeCollectedWord(word)}
                        className="text-gray-400 hover:text-error-500 p-1"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">
                  No words collected yet
                </p>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Translation tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg transform -translate-x-1/2"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.translation === null ? (
            <span className="animate-pulse">Translating...</span>
          ) : (
            <span dir="rtl">{tooltip.translation}</span>
          )}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

export default StudentReading;
