import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Input, Modal, Badge } from '../components/ui';
import { getWordLists, createWordList, deleteWordList } from '../services/firestore';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

function WordLists() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [wordLists, setWordLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploadedWords, setUploadedWords] = useState([]);

  useEffect(() => {
    fetchWordLists();
  }, []);

  const fetchWordLists = async () => {
    try {
      const lists = await getWordLists();
      setWordLists(lists);
    } catch (error) {
      console.error('Error fetching word lists:', error);
      toast.error('Failed to load word lists');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const words = results.data.map((row, index) => ({
            id: `word_${Date.now()}_${index}`,
            en: row.en || row.english || row.word || '',
            he: row.he || row.hebrew || row.translation || '',
            difficulty: parseInt(row.difficulty) || 1,
            imageUrl: row.imageUrl || row.image || null,
            audioUrl: row.audioUrl || row.audio || null,
          })).filter(w => w.en && w.he);

          if (words.length === 0) {
            toast.error('No valid words found in CSV. Make sure it has "en" and "he" columns.');
            return;
          }

          setUploadedWords(words);
          setShowUploadModal(true);
        } catch (error) {
          console.error('CSV parsing error:', error);
          toast.error('Failed to parse CSV file');
        }
      },
      error: (error) => {
        console.error('CSV error:', error);
        toast.error('Failed to read CSV file');
      },
    });

    // Reset file input
    e.target.value = '';
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    setCreating(true);
    try {
      await createWordList(user.uid, newListName, uploadedWords);
      toast.success('Word list created successfully!');
      setShowCreateModal(false);
      setShowUploadModal(false);
      setNewListName('');
      setUploadedWords([]);
      fetchWordLists();
    } catch (error) {
      console.error('Error creating word list:', error);
      toast.error('Failed to create word list');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (!confirm(`Are you sure you want to delete "${listName}"?`)) {
      return;
    }

    try {
      await deleteWordList(listId);
      toast.success('Word list deleted');
      fetchWordLists();
    } catch (error) {
      console.error('Error deleting word list:', error);
      toast.error('Failed to delete word list');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Word Lists</h1>
          <p className="text-gray-600 mt-1">Manage your vocabulary lists</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Upload CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>Create New List</Button>
        </div>
      </div>

      {/* Word Lists Grid */}
      {wordLists.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {wordLists.map((list) => (
            <Card key={list.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {list.words?.length || 0} words
                  </p>
                </div>
                <Badge variant="primary">{list.words?.length || 0}</Badge>
              </div>

              {/* Word Preview */}
              {list.words && list.words.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {list.words.slice(0, 5).map((word) => (
                    <span
                      key={word.id}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                    >
                      {word.en}
                    </span>
                  ))}
                  {list.words.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-sm">
                      +{list.words.length - 5} more
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex space-x-2">
                <Link to={`/teacher/word-lists/${list.id}`} className="flex-1">
                  <Button variant="outline" fullWidth size="sm">
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteList(list.id, list.name)}
                  className="text-error-600 hover:bg-error-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No word lists yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first word list to start teaching vocabulary.
          </p>
          <div className="flex justify-center space-x-3">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Upload CSV
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>Create Manually</Button>
          </div>
        </Card>
      )}

      {/* CSV Format Help */}
      <Card className="mt-6">
        <Card.Header>
          <Card.Title>CSV Upload Format</Card.Title>
        </Card.Header>
        <Card.Content>
          <p className="text-gray-600 mb-4">
            Upload a CSV file with the following columns:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <p>en,he,difficulty,imageUrl</p>
            <p>apple,תפוח,1,https://...</p>
            <p>book,ספר,1,</p>
            <p>computer,מחשב,2,</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Required: <code>en</code> and <code>he</code>. Optional:{' '}
            <code>difficulty</code> (1-5), <code>imageUrl</code>, <code>audioUrl</code>
          </p>
        </Card.Content>
      </Card>

      {/* Create List Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Word List"
      >
        <div className="space-y-4">
          <Input
            label="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g., Unit 1 Vocabulary"
          />
          <p className="text-sm text-gray-500">
            You'll be able to add words after creating the list.
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} loading={creating}>
              Create List
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Preview Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Import Words"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="e.g., Unit 1 Vocabulary"
          />

          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Preview ({uploadedWords.length} words)
            </h4>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">English</th>
                    <th className="px-3 py-2 text-right rtl">Hebrew</th>
                    <th className="px-3 py-2 text-center">Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedWords.slice(0, 20).map((word, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-3 py-2">{word.en}</td>
                      <td className="px-3 py-2 text-right rtl">{word.he}</td>
                      <td className="px-3 py-2 text-center">{word.difficulty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadedWords.length > 20 && (
                <p className="text-center py-2 text-gray-500 text-sm">
                  And {uploadedWords.length - 20} more words...
                </p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} loading={creating}>
              Import {uploadedWords.length} Words
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default WordLists;
