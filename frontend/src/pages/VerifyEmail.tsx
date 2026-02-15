import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmail, resendCode, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const password = location.state?.password || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Verify the code (backend creates user in Supabase)
      await verifyEmail(email, otp);
      setSuccess('Email verified! Signing you in...');

      // Auto-login with the password
      await signIn(email, password);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');

    try {
      await resendCode(email);
      setSuccess('New verification code sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-gray-400 mb-4">No email address provided</p>
          <button
            onClick={() => navigate('/signup')}
            className="text-primary-500 hover:text-primary-400 font-medium"
          >
            Go to Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 bg-gray-900 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12 relative">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 bg-primary-500 rounded-full"></div>
            <span className="text-white font-semibold text-lg" dir="rtl">هادي</span>
          </div>

          {/* Header */}
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Almost there</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Verify your email<span className="text-primary-500">.</span>
          </h1>
          <p className="text-gray-400 mb-10">
            We've sent a 6-digit code to <span className="text-white font-medium">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-primary-500/10 border border-primary-500/30 text-primary-400 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            {/* OTP Input */}
            <div className="relative">
              <label htmlFor="otp" className="absolute left-4 top-2 text-xs text-gray-500">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                }}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pt-7 pb-3 px-4 text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
              />
            </div>

            {/* Verify Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
            >
              Didn't receive the code? <span className="text-primary-500 font-medium">Resend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-gray-900/80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80')] bg-cover bg-center opacity-60"></div>
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 800">
          <path d="M 300 100 Q 500 400 300 700" fill="none" stroke="white" strokeWidth="1" strokeDasharray="8 8" />
        </svg>
      </div>
    </div>
  );
};

export default VerifyEmail;
