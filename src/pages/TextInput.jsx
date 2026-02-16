import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Badge } from '../components/ui';
import TextDisplay from '../components/TextDisplay';
import { createTextUnit, getTextUnits, getTextUnit, updateTextUnit, deleteTextUnit } from '../services/firestore';
import { translateWord, findSentenceForWord } from '../services/translation';
import toast from 'react-hot-toast';

// Views: 'list' | 'input' | 'select'
function TextInput() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [view, setView] = useState(id ? 'select' : 'list');
  const [textUnits, setTextUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Input view state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  // Select view state
  const [selectedWords, setSelectedWords] = useState([]); // [{ en, he, sentenceInText }]
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);

  // Fetch text units
  const fetchTextUnits = useCallback(async () => {
    try {
      const units = await getTextUnits();
      setTextUnits(units);
    } catch (error) {
      console.error('Error fetching text units:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTextUnits();
  }, [fetchTextUnits]);

  // Load existing text unit for editing
  useEffect(() => {
    if (id) {
      const loadUnit = async () => {
        try {
          const unit = await getTextUnit(id);
          setTitle(unit.title);
          setText(unit.text);
          setSelectedWords(unit.words || []);
          setEditingTextId(unit.id);
          setView('select');
        } catch (error) {
          console.error('Error loading text unit:', error);
          toast.error('Text not found');
          navigate('/teacher/texts');
        }
      };
      loadUnit();
    }
  }, [id, navigate]);

  // Handle word click in select view
  const handleWordClick = async (word) => {
    const lower = word.toLowerCase();

    // Toggle off if already selected
    const existingIndex = selectedWords.findIndex((w) => w.en.toLowerCase() === lower);
    if (existingIndex !== -1) {
      setSelectedWords((prev) => prev.filter((_, i) => i !== existingIndex));
      return;
    }

    // Add word with auto-translation
    setTranslating(true);
    try {
      const he = await translateWord(word);
      const sentenceInText = findSentenceForWord(text, word);
      setSelectedWords((prev) => [
        ...prev,
        {
          id: `tw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          en: lower,
          he: he || '',
          sentenceInText,
        },
      ]);
    } catch {
      setSelectedWords((prev) => [
        ...prev,
        {
          id: `tw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          en: lower,
          he: '',
          sentenceInText: findSentenceForWord(text, word),
        },
      ]);
    } finally {
      setTranslating(false);
    }
  };

  // Edit a translation
  const handleTranslationEdit = (index, newHe) => {
    setSelectedWords((prev) =>
      prev.map((w, i) => (i === index ? { ...w, he: newHe } : w))
    );
  };

  // Proceed from input to select view
  const handleProceedToSelect = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!text.trim()) {
      toast.error('Please paste some text');
      return;
    }
    setView('select');
  };

  // Save text unit
  const handleSave = async () => {
    const wordsWithTranslations = selectedWords.filter((w) => w.he.trim());
    if (wordsWithTranslations.length === 0) {
      toast.error('Please select at least one word with a translation');
      return;
    }

    setSaving(true);
    try {
      if (editingTextId) {
        await updateTextUnit(editingTextId, {
          title,
          text,
          words: wordsWithTranslations,
        });
        toast.success('Text updated!');
      } else {
        await createTextUnit(userData?.uid || 'demo', title, text, wordsWithTranslations);
        toast.success('Text saved!');
      }
      navigate('/teacher/texts');
    } catch (error) {
      console.error('Error saving text unit:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Delete text unit
  const handleDelete = async (unitId, unitTitle) => {
    if (!window.confirm(`Delete "${unitTitle}"?`)) return;
    try {
      await deleteTextUnit(unitId);
      toast.success('Deleted');
      fetchTextUnits();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  // New text flow
  const handleNewText = () => {
    setTitle('');
    setText('');
    setSelectedWords([]);
    setEditingTextId(null);
    setView('input');
  };

  // ==================== LIST VIEW ====================
  if (view === 'list') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Texts</h1>
            <p className="text-gray-600 mt-1">Manage your teaching texts</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={handleNewText}>New Text</Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
          </div>
        ) : textUnits.length > 0 ? (
          <div className="grid gap-4">
            {textUnits.map((unit) => (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/teacher/texts/${unit.id}`)}
                  >
                    <h3 className="font-semibold text-gray-900 text-lg">{unit.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {unit.text?.substring(0, 150)}...
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="primary">{unit.words?.length || 0} words</Badge>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(unit.id, unit.title);
                    }}
                    className="text-gray-400 hover:text-error-500 p-2 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <p className="text-gray-500 mb-4">No texts yet. Create your first one!</p>
            <Button onClick={handleNewText}>Create Text</Button>
          </Card>
        )}
      </div>
    );
  }

  // ==================== INPUT VIEW ====================
  if (view === 'input') {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => {
            setView('list');
            navigate('/teacher/texts');
          }}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to texts
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          {editingTextId ? 'Edit Text' : 'New Text'}
        </h1>

        <Card>
          <Card.Content>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., The Adventure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste an English text here..."
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
                />
              </div>

              <Button
                onClick={handleProceedToSelect}
                fullWidth
                size="lg"
                disabled={!title.trim() || !text.trim()}
              >
                Next: Select Words
              </Button>
            </div>
          </Card.Content>
        </Card>
      </div>
    );
  }

  // ==================== SELECT VIEW ====================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => setView('input')}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to edit text
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">Click words to select them for learning</p>
        </div>
        {translating && (
          <span className="text-sm text-primary-600 animate-pulse">Translating...</span>
        )}
      </div>

      {/* Text with clickable words */}
      <Card>
        <Card.Header>
          <Card.Title>Text</Card.Title>
          <Card.Description>Click on words to add them to the vocabulary list</Card.Description>
        </Card.Header>
        <Card.Content>
          <TextDisplay
            text={text}
            selectedWords={selectedWords.map((w) => w.en)}
            mode="teacher-select"
            onWordClick={handleWordClick}
            className="ltr"
          />
        </Card.Content>
      </Card>

      {/* Selected words with translations */}
      {selectedWords.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Selected Words ({selectedWords.length})</Card.Title>
            <Card.Description>Edit translations before saving</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {selectedWords.map((word, index) => (
                <div
                  key={word.id || index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900 w-32 ltr">{word.en}</span>
                  <input
                    type="text"
                    value={word.he}
                    onChange={(e) => handleTranslationEdit(index, e.target.value)}
                    placeholder="Hebrew translation"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-right rtl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    dir="rtl"
                  />
                  <span className="text-xs text-gray-400 max-w-[200px] truncate hidden md:block" title={word.sentenceInText}>
                    {word.sentenceInText}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedWords((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="text-gray-400 hover:text-error-500 p-1"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      <Button
        onClick={handleSave}
        fullWidth
        size="lg"
        disabled={saving || selectedWords.filter((w) => w.he.trim()).length === 0}
      >
        {saving ? 'Saving...' : editingTextId ? 'Update Text' : 'Save Text'}
      </Button>
    </div>
  );
}

export default TextInput;
