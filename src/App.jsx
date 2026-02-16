import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import StudentReading from './pages/StudentReading';
import TeacherPortal from './pages/TeacherPortal';
import TextInput from './pages/TextInput';
import Students from './pages/Students';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '10px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Student routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/read/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StudentReading />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Teacher routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requireTeacher>
                  <Layout>
                    <TeacherPortal />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/texts"
              element={
                <ProtectedRoute requireTeacher>
                  <Layout>
                    <TextInput />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/texts/new"
              element={
                <ProtectedRoute requireTeacher>
                  <Layout>
                    <TextInput />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/texts/:id"
              element={
                <ProtectedRoute requireTeacher>
                  <Layout>
                    <TextInput />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute requireTeacher>
                  <Layout>
                    <Students />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard or login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
