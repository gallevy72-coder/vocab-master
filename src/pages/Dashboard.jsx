import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { useProgress } from '../hooks/useProgress';
import { Card, Button, ProgressBar, Badge } from '../components/ui';
import { BADGES } from '../utils/constants';

function Dashboard() {
  const { userData } = useAuth();
  const { currentLevel, currentXP, levelProgress, badges } = useGame();
  const { progress, getMasteredCount, getSuccessRate } = useProgress();

  const masteredCount = getMasteredCount();
  const successRate = getSuccessRate();

  // Get earned badges info
  const earnedBadges = Object.values(BADGES).filter((badge) =>
    badges.includes(badge.id)
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {userData?.name || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Ready to expand your vocabulary today?
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/practice">
            <Button size="lg">Start Practice</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{currentLevel}</span>
          </div>
          <p className="text-sm text-gray-600">Level</p>
          <div className="mt-2">
            <ProgressBar value={levelProgress} size="sm" />
          </div>
        </Card>

        {/* XP Card */}
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-1">{currentXP}</div>
          <p className="text-sm text-gray-600">Total XP</p>
        </Card>

        {/* Words Mastered Card */}
        <Card className="text-center">
          <div className="text-3xl font-bold text-success-600 mb-1">{masteredCount}</div>
          <p className="text-sm text-gray-600">Words Mastered</p>
        </Card>

        {/* Success Rate Card */}
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-1">
            {Math.round(successRate)}%
          </div>
          <p className="text-sm text-gray-600">Success Rate</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Practice Options */}
        <Card>
          <Card.Header>
            <Card.Title>Practice Exercises</Card.Title>
            <Card.Description>Choose your learning style</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/practice?type=matching">
                <div className="p-4 rounded-xl bg-primary-50 hover:bg-primary-100 transition-colors text-center">
                  <span className="text-3xl mb-2 block">🎯</span>
                  <span className="font-medium text-primary-700">Matching</span>
                </div>
              </Link>
              <Link to="/practice?type=visual">
                <div className="p-4 rounded-xl bg-success-50 hover:bg-success-100 transition-colors text-center">
                  <span className="text-3xl mb-2 block">🖼️</span>
                  <span className="font-medium text-success-700">Visual</span>
                </div>
              </Link>
              <Link to="/practice?type=audio">
                <div className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors text-center">
                  <span className="text-3xl mb-2 block">🔊</span>
                  <span className="font-medium text-purple-700">Audio</span>
                </div>
              </Link>
              <Link to="/practice?type=sentence">
                <div className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors text-center">
                  <span className="text-3xl mb-2 block">📝</span>
                  <span className="font-medium text-orange-700">Sentence</span>
                </div>
              </Link>
            </div>
          </Card.Content>
        </Card>

        {/* Badges */}
        <Card>
          <Card.Header>
            <Card.Title>Your Badges</Card.Title>
            <Card.Description>
              {earnedBadges.length} of {Object.keys(BADGES).length} earned
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="text-center p-3 rounded-xl bg-gray-50"
                    title={badge.description}
                  >
                    <span className="text-3xl block mb-1">{badge.icon}</span>
                    <span className="text-xs font-medium text-gray-700">
                      {badge.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="mb-2">No badges yet!</p>
                <p className="text-sm">Start practicing to earn your first badge.</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Recent Activity / Words to Review */}
      <Card>
        <Card.Header>
          <Card.Title>Words to Review</Card.Title>
          <Card.Description>
            These words are due for practice
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {progress.length > 0 ? (
            <div className="space-y-2">
              {progress.slice(0, 5).map((p, index) => (
                <div
                  key={p.id || index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-gray-900 ltr">{p.wordId}</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-600">
                      {p.correctCount} correct, {p.wrongCount} wrong
                    </span>
                  </div>
                  <Badge
                    variant={
                      p.correctCount / (p.correctCount + p.wrongCount || 1) > 0.7
                        ? 'success'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {Math.round(
                      (p.correctCount / (p.correctCount + p.wrongCount || 1)) * 100
                    )}
                    %
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No practice history yet.</p>
              <Link to="/practice">
                <Button variant="outline" className="mt-4">
                  Start your first session
                </Button>
              </Link>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

export default Dashboard;
