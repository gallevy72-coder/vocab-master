import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Badge } from '../components/ui';
import { getWordLists, getStrugglingWordsAnalytics, getAllStudents } from '../services/firestore';

function TeacherPortal() {
  const { userData } = useAuth();
  const [wordLists, setWordLists] = useState([]);
  const [students, setStudents] = useState([]);
  const [strugglingWords, setStrugglingWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lists, studentData] = await Promise.all([
          getWordLists(),
          getAllStudents(),
        ]);

        setWordLists(lists);
        setStudents(studentData);

        // Get struggling words analytics
        if (lists.length > 0) {
          const listIds = lists.map((l) => l.id);
          const struggling = await getStrugglingWordsAnalytics(listIds);
          setStrugglingWords(struggling.slice(0, 10)); // Top 10 struggling words
        }
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
          <Link to="/teacher/word-lists">
            <Button variant="outline">Manage Word Lists</Button>
          </Link>
          <Link to="/teacher/word-lists/new">
            <Button>Create Word List</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{wordLists.length}</div>
          <p className="text-sm text-gray-600">Word Lists</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-success-600">
            {wordLists.reduce((acc, l) => acc + (l.words?.length || 0), 0)}
          </div>
          <p className="text-sm text-gray-600">Total Words</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-600">{students.length}</div>
          <p className="text-sm text-gray-600">Students</p>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-error-600">{strugglingWords.length}</div>
          <p className="text-sm text-gray-600">Struggling Words</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Word Lists */}
        <Card>
          <Card.Header>
            <Card.Title>Recent Word Lists</Card.Title>
            <Card.Description>Your latest vocabulary lists</Card.Description>
          </Card.Header>
          <Card.Content>
            {wordLists.length > 0 ? (
              <div className="space-y-3">
                {wordLists.slice(0, 5).map((list) => (
                  <Link
                    key={list.id}
                    to={`/teacher/word-lists/${list.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{list.name}</h4>
                        <p className="text-sm text-gray-500">
                          {list.words?.length || 0} words
                        </p>
                      </div>
                      <Badge variant="primary">{list.words?.length || 0}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="mb-4">No word lists yet.</p>
                <Link to="/teacher/word-lists/new">
                  <Button variant="outline" size="sm">
                    Create your first list
                  </Button>
                </Link>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Struggling Words */}
        <Card>
          <Card.Header>
            <Card.Title>Struggling Words</Card.Title>
            <Card.Description>Words students find difficult</Card.Description>
          </Card.Header>
          <Card.Content>
            {strugglingWords.length > 0 ? (
              <div className="space-y-3">
                {strugglingWords.map((word, index) => (
                  <div
                    key={word.wordId || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{word.wordId}</span>
                      <span className="block text-sm text-gray-500">
                        {word.studentCount} students struggling
                      </span>
                    </div>
                    <Badge variant="error">
                      {Math.round(word.successRate * 100)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                No struggling words detected yet. Students need to practice more.
              </p>
            )}
          </Card.Content>
        </Card>
      </div>

      {/* Student Overview */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Student Progress</Card.Title>
              <Card.Description>Overview of all students</Card.Description>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 font-medium">Student</th>
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">XP</th>
                    <th className="pb-3 font-medium">Words Mastered</th>
                    <th className="pb-3 font-medium">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {students.slice(0, 10).map((student) => (
                    <tr key={student.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="py-3">
                        <Badge variant="primary">Level {student.level || 1}</Badge>
                      </td>
                      <td className="py-3 text-gray-600">{student.xp || 0}</td>
                      <td className="py-3 text-gray-600">
                        {student.masteredWords?.length || 0}
                      </td>
                      <td className="py-3 text-gray-600">
                        {student.badges?.length || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">
              No students registered yet.
            </p>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}

export default TeacherPortal;
