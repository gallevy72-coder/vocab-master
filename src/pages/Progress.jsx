import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../hooks/useProgress';
import { Card, ProgressBar, Badge } from '../components/ui';
import { BADGES, LEVEL_THRESHOLDS } from '../utils/constants';

function Progress() {
  useAuth(); // For auth check
  const { currentLevel, currentXP, levelProgress, badges } = useGame();
  const { progress, getSuccessRate } = useProgress();
  const [activeTab, setActiveTab] = useState('overview');

  const successRate = getSuccessRate();

  // Calculate stats
  const totalAttempts = progress.reduce(
    (acc, p) => acc + p.correctCount + p.wrongCount,
    0
  );
  const totalCorrect = progress.reduce((acc, p) => acc + p.correctCount, 0);
  const totalWrong = progress.reduce((acc, p) => acc + p.wrongCount, 0);

  // Group words by performance
  const strongWords = progress.filter((p) => {
    const rate = p.correctCount / (p.correctCount + p.wrongCount || 1);
    return rate >= 0.8 && p.correctCount + p.wrongCount >= 3;
  });

  const strugglingWords = progress.filter((p) => {
    const rate = p.correctCount / (p.correctCount + p.wrongCount || 1);
    return rate < 0.5 && p.correctCount + p.wrongCount >= 3;
  });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'words', label: 'Words' },
    { id: 'badges', label: 'Badges' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Progress</h1>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Level Progress */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Level Progress</h3>
                <p className="text-gray-600">Level {currentLevel}</p>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{currentLevel}</span>
              </div>
            </div>
            <ProgressBar value={levelProgress} showLabel label="XP to next level" color="gradient" />
            <p className="text-sm text-gray-500 mt-2">
              {currentXP} / {LEVEL_THRESHOLDS[currentLevel] || '∞'} XP
            </p>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <div className="text-3xl font-bold text-primary-600">{totalAttempts}</div>
              <p className="text-sm text-gray-600">Total Attempts</p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-success-600">{totalCorrect}</div>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-error-600">{totalWrong}</div>
              <p className="text-sm text-gray-600">Wrong Answers</p>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-primary-600">{Math.round(successRate)}%</div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </Card>
          </div>

          {/* Word Categories */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <Card.Title className="flex items-center">
                  <span className="mr-2">💪</span> Strong Words
                </Card.Title>
                <Card.Description>
                  {strongWords.length} words with 80%+ accuracy
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {strongWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {strongWords.slice(0, 10).map((w) => (
                      <Badge key={w.id} variant="success">
                        {w.wordId}
                      </Badge>
                    ))}
                    {strongWords.length > 10 && (
                      <Badge variant="default">+{strongWords.length - 10} more</Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Keep practicing to build strong words!</p>
                )}
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title className="flex items-center">
                  <span className="mr-2">📚</span> Words to Review
                </Card.Title>
                <Card.Description>
                  {strugglingWords.length} words need more practice
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {strugglingWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {strugglingWords.slice(0, 10).map((w) => (
                      <Badge key={w.id} variant="warning">
                        {w.wordId}
                      </Badge>
                    ))}
                    {strugglingWords.length > 10 && (
                      <Badge variant="default">+{strugglingWords.length - 10} more</Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Great job! No struggling words.</p>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      )}

      {/* Words Tab */}
      {activeTab === 'words' && (
        <Card>
          <Card.Header>
            <Card.Title>All Words ({progress.length})</Card.Title>
          </Card.Header>
          <Card.Content>
            {progress.length > 0 ? (
              <div className="space-y-2">
                {progress.map((p) => {
                  const rate = p.correctCount / (p.correctCount + p.wrongCount || 1);
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900 ltr">{p.wordId}</span>
                        <span className="block text-sm text-gray-500">
                          {p.correctCount} correct, {p.wrongCount} wrong
                        </span>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={rate >= 0.8 ? 'success' : rate >= 0.5 ? 'warning' : 'error'}
                        >
                          {Math.round(rate * 100)}%
                        </Badge>
                        <span className="block text-xs text-gray-500 mt-1">
                          Interval: {p.interval} days
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No practice data yet. Start practicing to see your progress!
              </p>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Badges Tab */}
      {activeTab === 'badges' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.values(BADGES).map((badge) => {
            const isEarned = badges.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={`text-center transition-all ${
                  isEarned ? '' : 'opacity-50 grayscale'
                }`}
              >
                <div className="text-5xl mb-3">{badge.icon}</div>
                <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{badge.description}</p>
                {isEarned ? (
                  <Badge variant="success" className="mt-3">
                    Earned!
                  </Badge>
                ) : (
                  <Badge variant="default" className="mt-3">
                    Locked
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Progress;
