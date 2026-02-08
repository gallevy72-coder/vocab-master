import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { PracticeEngine, StoryExercise } from '../exercises';
import { EXERCISE_TYPES, DEFAULT_WORDS } from '../utils/constants';
import { getWordLists } from '../services/firestore';

function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedList, setSelectedList] = useState(null);
  const [wordLists, setWordLists] = useState([]);
  const [, setLoading] = useState(true);
  const [practicing, setPracticing] = useState(false);

  // Check for exercise type in URL
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && Object.values(EXERCISE_TYPES).includes(typeParam)) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  // Fetch available word lists
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const lists = await getWordLists();
        setWordLists(lists);
      } catch (error) {
        console.error('Error fetching word lists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLists();
  }, []);

  const exerciseTypes = [
    {
      type: EXERCISE_TYPES.MATCHING,
      name: 'Word Matching',
      nameHe: 'התאמת מילים',
      description: 'Match English words to Hebrew translations',
      icon: '🎯',
      color: 'primary',
    },
    {
      type: EXERCISE_TYPES.VISUAL,
      name: 'Visual Learning',
      nameHe: 'למידה חזותית',
      description: 'Connect words to images',
      icon: '🖼️',
      color: 'success',
    },
    {
      type: EXERCISE_TYPES.AUDIO,
      name: 'Listening Practice',
      nameHe: 'תרגול האזנה',
      description: 'Listen and select the meaning',
      icon: '🔊',
      color: 'purple',
    },
    {
      type: EXERCISE_TYPES.SENTENCE,
      name: 'Fill in the Blank',
      nameHe: 'השלמת משפטים',
      description: 'Complete sentences with vocabulary',
      icon: '📝',
      color: 'orange',
    },
    {
      type: EXERCISE_TYPES.STORY,
      name: 'Story Time',
      nameHe: 'זמן סיפור',
      description: 'Read AI-generated stories with your words',
      icon: '📖',
      color: 'pink',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary-50 hover:bg-primary-100 border-primary-200 text-primary-700',
      success: 'bg-success-50 hover:bg-success-100 border-success-200 text-success-700',
      purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700',
    };
    return colors[color] || colors.primary;
  };

  const handleStartPractice = () => {
    if (selectedType) {
      setPracticing(true);
    }
  };

  const handleBack = () => {
    if (practicing) {
      setPracticing(false);
    } else if (selectedType) {
      setSelectedType(null);
      navigate('/practice', { replace: true });
    }
  };

  // Get words for practice
  const getWords = () => {
    if (selectedList) {
      const list = wordLists.find((l) => l.id === selectedList);
      return list?.words || DEFAULT_WORDS;
    }
    return DEFAULT_WORDS;
  };

  // Render practice session
  if (practicing && selectedType) {
    if (selectedType === EXERCISE_TYPES.STORY) {
      return (
        <div>
          <button
            onClick={handleBack}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <StoryExercise
            words={getWords()}
            onComplete={() => setPracticing(false)}
          />
        </div>
      );
    }

    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <PracticeEngine
          words={getWords()}
          exerciseType={selectedType}
          listId={selectedList}
        />
      </div>
    );
  }

  // Render exercise type selection
  if (selectedType) {
    const exercise = exerciseTypes.find((e) => e.type === selectedType);

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to exercise types
        </button>

        <Card className="mb-6">
          <div className="text-center py-6">
            <span className="text-6xl mb-4 block">{exercise?.icon}</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{exercise?.name}</h2>
            <p className="text-gray-600">{exercise?.description}</p>
          </div>
        </Card>

        {/* Word List Selection */}
        <Card className="mb-6">
          <Card.Header>
            <Card.Title>Select Word List</Card.Title>
            <Card.Description>Choose which words to practice</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedList(null)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  selectedList === null
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium">Default Vocabulary</span>
                <span className="block text-sm text-gray-500">
                  {DEFAULT_WORDS.length} words
                </span>
              </button>

              {wordLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => setSelectedList(list.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    selectedList === list.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{list.name}</span>
                  <span className="block text-sm text-gray-500">
                    {list.words?.length || 0} words
                  </span>
                </button>
              ))}
            </div>
          </Card.Content>
        </Card>

        <Button fullWidth size="lg" onClick={handleStartPractice}>
          Start Practice
        </Button>
      </div>
    );
  }

  // Render exercise type grid
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice</h1>
        <p className="text-gray-600">Choose an exercise type to start learning</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exerciseTypes.map((exercise) => (
          <button
            key={exercise.type}
            onClick={() => setSelectedType(exercise.type)}
            className={`p-6 rounded-xl border-2 text-left transition-all ${getColorClasses(
              exercise.color
            )} hover:scale-[1.02] active:scale-[0.98]`}
          >
            <span className="text-4xl mb-4 block">{exercise.icon}</span>
            <h3 className="text-lg font-semibold mb-1">{exercise.name}</h3>
            <p className="text-sm opacity-80">{exercise.description}</p>
          </button>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="mt-8">
        <Card.Header>
          <Card.Title>Tips for Effective Learning</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-medium text-gray-900">Practice Daily</h4>
                <p className="text-sm text-gray-600">
                  Short daily sessions are more effective than long weekly ones.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔄</span>
              <div>
                <h4 className="font-medium text-gray-900">Mix Exercise Types</h4>
                <p className="text-sm text-gray-600">
                  Different exercises help build stronger memory connections.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-medium text-gray-900">Focus on Mistakes</h4>
                <p className="text-sm text-gray-600">
                  Words you get wrong will appear more often to help you learn.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-2xl">🔊</span>
              <div>
                <h4 className="font-medium text-gray-900">Use Audio</h4>
                <p className="text-sm text-gray-600">
                  Hearing words helps with pronunciation and recognition.
                </p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}

export default Practice;
