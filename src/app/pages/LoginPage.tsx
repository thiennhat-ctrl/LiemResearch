import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import logo from '../../imports/ChatGPT_Image_10_47_26_20_thg_5__2026-removebg-preview.png';
import { getAuthSession, setAuthSession } from '../utils/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiBaseUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const session = getAuthSession();
    if (!session) return;

    navigate(session.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      const role = data?.user?.role === 'admin' ? 'admin' : 'user';
      setAuthSession({ role, email: data?.user?.email ?? email });

      navigate(role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof TypeError && /fetch/i.test(err.message)) {
        setError(`Failed to fetch. Hãy kiểm tra backend đang chạy tại ${apiBaseUrl}.`);
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="LiemResearch" className="h-40 w-auto" />
          </div>
          <h1 className="text-foreground mb-2">LiemResearch</h1>
          <p className="text-muted-foreground">Login to your account</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="student@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            {error && (
              <p className="text-red-600 text-center">{error}</p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
