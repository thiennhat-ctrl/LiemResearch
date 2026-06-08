import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

export default function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email passed from the Register page (if any)
  const emailFromRegister = location.state?.email || '';
  
  const [email, setEmail] = useState(emailFromRegister);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed.');
      }

      setSuccess('Verification successful! Redirecting...');
      // Save token if backend returns token after verification
      if (data.token) localStorage.setItem('token', data.token);
      
      setTimeout(() => {
        navigate('/login'); // Redirect to login page
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Account Verification
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Please enter the 6-digit OTP code sent to your email
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleVerify}>
            {!emailFromRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Your Email</label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">OTP Code (6 digits)</label>
              <div className="mt-1">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Allow numbers only
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-center tracking-widest font-bold"
                  placeholder="------"
                />
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
            {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded">{success}</div>}

            <div>
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm OTP'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
             <Link to="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-1">
                Back to login <ArrowRight className="h-4 w-4" />
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}