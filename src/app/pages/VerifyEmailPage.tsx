import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, CheckCircle2, Loader2, MailCheck, XCircle } from 'lucide-react';
import { apiRequest } from '../lib/api';

type VerifyState = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [state, setState] = useState<VerifyState>(token ? 'loading' : 'idle');
  const [message, setMessage] = useState(
    token ? 'Verifying your email...' : 'Please check your inbox and click the verification link we sent you.'
  );
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let ignore = false;

    async function verifyEmail() {
      try {
        const data = await apiRequest<{ message: string }>('/auth/verify-email', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        if (ignore) return;
        setState('success');
        setMessage(data.message || 'Email verified successfully. You can now log in.');
        window.setTimeout(() => navigate('/login'), 1800);
      } catch (error) {
        if (ignore) return;
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Verification failed.');
      }
    }

    verifyEmail();

    return () => {
      ignore = true;
    };
  }, [navigate, token]);

  async function handleResendVerificationEmail() {
    if (!email || isResending) return;

    setIsResending(true);
    setResendMessage('');

    try {
      const data = await apiRequest<{ message: string }>('/auth/resend-verification-email', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      setResendMessage(data.message || 'Verification email has been sent. Please check your inbox.');
    } catch (error) {
      setResendMessage(error instanceof Error ? error.message : 'Could not resend verification email.');
    } finally {
      setIsResending(false);
    }
  }

  const icon = {
    idle: <MailCheck className="h-8 w-8 text-blue-600" />,
    loading: <Loader2 className="h-8 w-8 animate-spin text-blue-600" />,
    success: <CheckCircle2 className="h-8 w-8 text-emerald-600" />,
    error: <XCircle className="h-8 w-8 text-red-600" />,
  }[state];

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            {icon}
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-slate-900">Email verification</h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {message}
          </p>

          {email && state === 'idle' && (
            <p className="mt-2 text-sm font-medium text-slate-900">{email}</p>
          )}

          {email && state === 'idle' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleResendVerificationEmail}
                disabled={isResending}
                className="inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResending ? 'Sending...' : 'Resend verification email'}
              </button>
              {resendMessage && (
                <p className="mt-3 text-sm leading-6 text-slate-600">{resendMessage}</p>
              )}
            </div>
          )}

          <div className="mt-7 flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Back to login <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
