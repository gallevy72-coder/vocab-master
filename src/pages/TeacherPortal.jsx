import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Badge } from '../components/ui';
import { getTextUnits, getAllStudents } from '../services/firestore';

function TeacherPortal() {
  const { userData } = useAuth();
  const [textUnits, setTextUnits] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [texts, studentData] = await Promise.all([
          getTextUnits(),
          getAllStudents(),
        ]);
        setTextUnits(texts);
        setStudents(studentData);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {userData?.name || 'Teacher'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-3">
          <Link to="/teacher/texts">
            <Button variant="outline">Manage Texts</Button>
          </Link>
          <Link to="/teacher/texts/new">
            <Button>New Text</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{textUnits.length}</div>
          <p className="text-sm text-gray-600">Texts</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-success-600">
            {textUnits.reduce((acc, u) => acc + (u.words?.length || 0), 0)}
          </div>
          <p className="text-sm text-gray-600">Total Words</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{students.length}</div>
          <p className="text-sm text-gray-600">Students</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Texts */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Texts</Card.Title>
            <Card.Description>Your latest teaching texts</Card.Description>
          </Card.Header>
          <Card.Content>
            {textUnits.length > 0 ? (
              <div className="space-y-3">
                {textUnits.slice(0, 5).map((unit) => (
                  <Link
                    key={unit.id}
                    to={`/teacher/texts/${unit.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{unit.title}</h4>
                        <p className="text-sm text-gray-500">
                          {unit.words?.length || 0} words
                        </p>
                      </div>
                      <Badge variant="primary">{unit.words?.length || 0}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="mb-4">No texts yet.</p>
                <Link to="/teacher/texts/new">
                  <Button variant="outline" size="sm">
                    Create your first text
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Student List */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <div>
                <Card.Title>Students</Card.Title>
                <Card.Description>{students.length} registered</Card.Description>
              </div>
              <Link to="/teacher/students">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </Card.Header>
          <Card.Content>
            {students.length > 0 ? (
              <div className="space-y-3">
                {students.slice(0, 8).map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No students registered yet.
              </p>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default TeacherPortal;
