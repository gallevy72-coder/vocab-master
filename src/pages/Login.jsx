import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, Badge } from '../components/ui';
import toast from 'react-hot-toast';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address');
      } else {
        toast.error('Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    try {
      const demoEmail = role === 'teacher' ? 'teacher@demo.com' : 'student@demo.com';
      await login(demoEmail, 'demo123');
      toast.success(`Welcome, Demo ${role === 'teacher' ? 'Teacher' : 'Student'}!`);
      navigate(role === 'teacher' ? '/teacher' : '/dashboard', { replace: true });
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Failed to start demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            Vocab Master
          </h1>
          <p className="text-gray-600">Master English vocabulary with fun exercises</p>
          {isDemoMode && (
            <Badge variant="warning" className="mt-2">
              Demo Mode - No Firebase Required
            </Badge>
          )}
        </div>

        <Card>
          <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back</h2>

          {/* Quick Demo Buttons */}
          {isDemoMode && (
            <div className="mb-6 p-4 bg-primary-50 rounded-xl">
              <p className="text-sm text-primary-700 mb-3 text-center font-medium">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                >
                  Try as Student
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDemoLogin('teacher')}
                  disabled={loading}
                >
                  Try as Teacher
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Login
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </div>
        </Card>

        {isDemoMode && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Data is saved locally in your browser
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
