import { useState, useEffect, type FormEvent } from 'react';
import { X, Mail, Activity } from 'lucide-react';
import { signup, login, friendlyApiError, type User } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  planType?: 'free' | 'pro';
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({
  isOpen,
  initialMode,
  planType = 'free',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Reset modal state every time it opens (mode follows the button clicked).
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setError('');
      setSubmitted(false);
      setLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const user = mode === 'signup'
        ? await signup(email.trim(), password)
        : await login(email.trim(), password);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess(user);
        onClose();
        setSubmitted(false);
      }, 900);
    } catch (err) {
      setError(friendlyApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && password.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080D18]/80 backdrop-blur-sm font-sans">
      <div
        id="auth-modal-card"
        className="relative w-full max-w-[440px] bg-[#FFFFFF] rounded-2xl p-8 sm:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-[#E5E5E5]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B6B6B] hover:text-[#111111] bg-[#F7F7F9] hover:bg-[#E5E5E5] rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-8 mt-2">
          <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center shadow-md shadow-black/10">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-semibold text-[#111111] tracking-tight">
            {mode === 'signup' ? 'Create an account' : 'Welcome back'}
          </h3>
          <p className="text-[#6B6B6B] text-sm mt-2">
            {mode === 'signup'
              ? <>Start monitoring with the <span className="font-semibold text-[#3154FF] uppercase tracking-wider text-[10px] bg-[#3154FF]/10 px-1.5 py-0.5 rounded ml-1">{planType}</span> plan</>
              : 'Enter your credentials to access your dashboard'}
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 rounded-full bg-[#10B981] animate-pulse"></div>
            </div>
            <p className="text-sm font-medium text-[#111111]">
              Workspace ready. Connecting...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg border border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@example.com"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] text-[#111111] placeholder-[#A3A3A3] text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#111111] uppercase tracking-wide">
                  Password
                </label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-[#3154FF] hover:underline font-medium">Forgot password?</button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#3154FF] focus:ring-1 focus:ring-[#3154FF] text-[#111111] placeholder-[#A3A3A3] text-sm transition-all shadow-sm"
                />
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-[#A3A3A3]">Minimum 8 characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm mt-2 ${
                isFormValid && !loading
                  ? 'bg-[#111111] text-white hover:bg-[#000000] hover:shadow-md'
                  : 'bg-[#F7F7F9] text-[#A3A3A3] cursor-not-allowed'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Log in'}</span>
            </button>

            {/* Footer Links */}
            <div className="pt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'login' : 'signup');
                  setError('');
                }}
                className="text-[#6B6B6B] text-sm hover:text-[#111111] transition-colors"
              >
                {mode === 'signup' ? (
                  <>Already have an account? <span className="font-medium text-[#3154FF]">Log in</span></>
                ) : (
                  <>Don't have an account? <span className="font-medium text-[#3154FF]">Sign up</span></>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
