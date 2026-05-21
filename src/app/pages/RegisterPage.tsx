import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Building2, CreditCard, Mail, Lock } from 'lucide-react';
import logo from '../../imports/ChatGPT_Image_10_47_26_20_thg_5__2026-removebg-preview.png?url';
import { getAuthSession } from '../utils/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    university: '',
    studentId: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiBaseUrl = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const session = getAuthSession();
    if (!session) return;

    navigate(session.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    fetch(`${apiBaseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error || data.message?.toLowerCase().includes('error')) {
          throw new Error(data.message || 'Registration failed');
        }
        navigate('/login', { replace: true });
      })
      .catch((err) => {
        if (err instanceof TypeError && /fetch/i.test(err.message)) {
          setError(`Failed to fetch. Hãy kiểm tra backend đang chạy tại ${apiBaseUrl}.`);
        } else {
          setError(err instanceof Error ? err.message : 'Registration failed');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logo} alt="LiemResearch" className="h-40 w-auto" />
          </div>
          <h1 className="text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Register for LiemResearch</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-foreground mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2">University</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="University Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2">Student ID</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="STU123456"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-input-background"
                  placeholder="Create a strong password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            {error && (
              <p className="text-red-600 text-center text-sm">{error}</p>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
