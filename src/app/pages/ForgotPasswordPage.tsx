import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { KeyRound, Mail, ArrowLeft, Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPasswordPage() {
  const logo = new URL('../../imports/liemresearch-logo-removebg-preview.png', import.meta.url).href;
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setError(''); setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSuccess('OTP code has been sent. Please check your email.');
      setStep(2); // Move to step 2
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Confirm password does not match.');
    }

    setIsLoading(true); setError(''); setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      setSuccess('Password reset successful! Redirecting to login page...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="flex justify-center">
          <img src={logo} alt="LiemResearch" className="mx-auto mb-4 h-56 w-auto" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          Recover Password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          
          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleRequestOTP}>
              <p className="text-sm text-slate-600 text-center mb-4">
                Enter your email address and we will send you an OTP code to reset your password.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Registered Email</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

              <div>
                <button
                  type="submit" disabled={isLoading || !email}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send recovery code'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER OTP & RESET PASSWORD */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleResetPassword} autoComplete="off">
              {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded mb-4">{success}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700">OTP Code (from email)</label>
                <input
                  type="text" maxLength={6} required
                  autoComplete="one-time-code"
                  value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm tracking-widest text-center font-bold"
                  placeholder="123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                   </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'} required
                    autoComplete="new-password"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                   </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} required
                    autoComplete="new-password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}

              <div>
                <button
                  type="submit" disabled={isLoading || otp.length !== 6 || !newPassword}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}