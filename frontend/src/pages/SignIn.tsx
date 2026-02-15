import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in');
      } else if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Welcome back</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Sign in<span className="text-primary-500">.</span>
          </h1>
          <p className="text-gray-400 mb-10">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-500 hover:text-primary-400 font-medium">
              Sign Up
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <label htmlFor="email" className="absolute left-4 top-2 text-xs text-gray-500">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pt-7 pb-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="you@example.com"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="absolute left-4 top-2 text-xs text-gray-500">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pt-7 pb-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-gray-900/80"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80')] bg-cover bg-center opacity-60"></div>
        {/* Decorative dashed arc */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 600 800">
          <path d="M 300 100 Q 500 400 300 700" fill="none" stroke="white" strokeWidth="1" strokeDasharray="8 8" />
        </svg>
      </div>
    </div>
  );
};

export default SignIn;
