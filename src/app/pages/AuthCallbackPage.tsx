import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { apiRequest, AuthUser, saveAuth } from '../lib/api';
import { useToast } from '../components/ToastProvider';
import { translateAuthMessage } from '../lib/authMessages';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function completeSignIn() {
      const error = searchParams.get('error');
      const token = searchParams.get('token');

      if (error) {
        showToast(translateAuthMessage(error), 'error');
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        showToast('Sign-in failed. Missing authentication token.', 'error');
        navigate('/login', { replace: true });
        return;
      }

      try {
        const data = await apiRequest<{ user: AuthUser }>('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;

        saveAuth(token, data.user);

        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', {
          replace: true,
          state: { loginSuccess: true },
        });
      } catch (err) {
        if (cancelled) return;

        showToast(
          translateAuthMessage(err instanceof Error ? err.message : 'Google sign-in failed.'),
          'error'
        );
        navigate('/login', { replace: true });
      }
    }

    completeSignIn();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, showToast]);

  return <LoadingSpinner fullPage label="Completing sign-in..." />;
}
