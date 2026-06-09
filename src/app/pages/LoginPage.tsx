import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { apiRequest, AuthUser, saveAuth, getStoredUser, getToken } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import { translateAuthMessage } from '../lib/authMessages';

export function LoginPage() {
  const { showToast } = useToast();
  const logo = new URL('../../imports/liemresearch-logo-removebg-preview.png', import.meta.url).href;
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Redirect users who already have an active session.
  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();

    if (token && user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.registered) {
      showToast('Account created successfully. Please sign in.', 'success');
      if (location.state.email) setEmail(location.state.email as string);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, showToast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError('Please enter your email.');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    if (!password.trim()) {
      showToast('Please enter your password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiRequest<{ user: AuthUser; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      saveAuth(data.token, data.user);

      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', {
        state: { loginSuccess: true },
        replace: true,
      });
    } catch (err) {
      showToast(translateAuthMessage(err instanceof Error ? err.message : 'Login failed.'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.trim() && !isValidEmail(value)) {
      setEmailError('Invalid email format.');
    } else {
      setEmailError('');
    }
  };

  return (
    <div className="min-h-screen bg-surface-feed bg-fixed text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-5 md:h-[73px] lg:px-6">
          <button
            type="button"
            onClick={() => {
              navigate('/');
              window.scrollTo(0, 0);
            }}
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80 text-left"
          >
            <img src={logo} alt="LiemResearch" className="h-14 w-14 rounded-lg border border-[#e2e8f0] bg-white object-contain p-1 md:h-[64px] md:w-[64px] max-h-full" />
            <span className="hidden text-base font-semibold text-[#1e293b] sm:block">LiemResearch</span>
          </button>

        </div>
      </header>

      <main className="mx-auto flex max-w-7xl justify-center px-4 py-10 sm:px-5 lg:px-6">
        <div className="w-full max-w-lg">
          <div className="mb-6 text-center">
            <img src={logo} alt="LiemResearch" className="mx-auto mb-4 h-28 w-auto" />
            <h1 className="mb-2 text-2xl font-semibold text-foreground md:text-3xl">Welcome back</h1>
            <p className="text-sm leading-6 text-muted-foreground">Sign in to continue using LiemResearch.</p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-foreground mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`w-full rounded-lg border bg-[color:var(--input-background)] py-3 pl-10 pr-4 transition-colors focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:ring-ring'
                    }`}
                    placeholder="student@university.edu"
                    required
                  />
                </div>
                {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="block text-foreground mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-[color:var(--input-background)] py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* --- NÚT FORGOT PASSWORD ĐÃ ĐƯỢC CHUYỂN XUỐNG DƯỚI Ô INPUT --- */}
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm font-semibold text-primary hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
                {/* ------------------------------------------------------------- */}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 border-t border-border/70 pt-5 text-center">
              <p className="text-sm text-muted-foreground">
                Do not have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-semibold text-primary hover:underline"
                >
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}