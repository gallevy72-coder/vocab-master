import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '../components/ui';
import { getTextUnits } from '../services/firestore';

function Dashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [textUnits, setTextUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTextUnits()
      .then(setTextUnits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {userData?.name || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-1">Choose a text to read and learn new words.</p>
      </div>

      {/* Text List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
        </div>
      ) : textUnits.length > 0 ? (
        <div className="grid gap-4">
          {textUnits.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{unit.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {unit.text?.substring(0, 150)}...
                  </p>
                  <span className="text-xs text-gray-400 mt-2 inline-block">
                    {unit.words?.length || 0} vocabulary words
                  </span>
                </div>
                <div className="ml-4">
                  <Button onClick={() => navigate(`/read/${unit.id}`)}>Read</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <p className="text-gray-500">No texts available yet.</p>
          <p className="text-gray-400 text-sm mt-1">Ask your teacher to add some reading texts!</p>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
