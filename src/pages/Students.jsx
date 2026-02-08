import { useState, useEffect } from 'react';
import { Card, Badge, ProgressBar, Input } from '../components/ui';
import { getAllStudents, getProgress } from '../services/firestore';
import { LEVEL_THRESHOLDS } from '../utils/constants';

function Students() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student) => {
    setSelectedStudent(student);
    try {
      const progress = await getProgress(student.id);
      setStudentProgress(progress);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelProgress = (xp, level) => {
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 100;
    return ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-600 mt-1">View and track student progress</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1">
          <Card>
            <div className="mb-4">
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredStudents.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedStudent?.id === student.id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                      <Badge variant="primary">Lv {student.level || 1}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-gray-500">
                {searchQuery ? 'No students found' : 'No students registered yet'}
              </p>
            )}
          </Card>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {selectedStudent.level || 1}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Level Progress</span>
                    <span>
                      {selectedStudent.xp || 0} /{' '}
                      {LEVEL_THRESHOLDS[selectedStudent.level || 1] || '∞'} XP
                    </span>
                  </div>
                  <ProgressBar
                    value={getLevelProgress(
                      selectedStudent.xp || 0,
                      selectedStudent.level || 1
                    )}
                    color="gradient"
                  />
                </div>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedStudent.xp || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total XP</p>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-success-600">
                    {selectedStudent.totalScore || 0}
                  </div>
                  <p className="text-sm text-gray-600">Total Score</p>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedStudent.masteredWords?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Words Mastered</p>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedStudent.badges?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Badges</p>
                </Card>
              </div>

              {/* Word Progress */}
              <Card>
                <Card.Header>
                  <Card.Title>Word Progress</Card.Title>
                  <Card.Description>
                    {studentProgress.length} words practiced
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  {studentProgress.length > 0 ? (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {studentProgress.map((p) => {
                        const rate =
                          p.correctCount / (p.correctCount + p.wrongCount || 1);
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {p.wordId}
                              </span>
                              <span className="block text-sm text-gray-500">
                                {p.correctCount} correct, {p.wrongCount} wrong
                              </span>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  rate >= 0.8
                                    ? 'success'
                                    : rate >= 0.5
                                    ? 'warning'
                                    : 'error'
                                }
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
                    <p className="text-center py-6 text-gray-500">
                      No practice data available
                    </p>
                  )}
                </Card.Content>
              </Card>

              {/* Badges */}
              {selectedStudent.badges && selectedStudent.badges.length > 0 && (
                <Card>
                  <Card.Header>
                    <Card.Title>Badges Earned</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.badges.map((badgeId) => (
                        <Badge key={badgeId} variant="success">
                          {badgeId}
                        </Badge>
                      ))}
                    </div>
                  </Card.Content>
                </Card>
              )}
            </div>
          ) : (
            <Card className="text-center py-12">
              <span className="text-6xl mb-4 block">👈</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a student
              </h3>
              <p className="text-gray-600">
                Click on a student from the list to view their progress
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Students;
