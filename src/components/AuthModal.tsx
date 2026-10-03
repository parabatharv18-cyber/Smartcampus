import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Key } from 'lucide-react';
import { User, Campus } from '../types.ts';
import { apiRequest, setStoredUserId } from '../api.ts';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  campus: Campus | null;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  campus,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campusCode, setCampusCode] = useState(campus?.code || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
    if (campus?.code && !campusCode) {
      setCampusCode(campus.code);
    }
  }, [initialMode, campus]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? { name: name.trim(), email: email.trim(), password, campusCode: campusCode.trim().toUpperCase() }
          : { email: email.trim(), password };

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user?.id) {
        setStoredUserId(data.user.id);
      }

      onAuthSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemoStudent = (emailVal: string) => {
    setEmail(emailVal);
    setPassword('Password123!');
    setMode('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'login' ? 'Student Sign In' : 'Student Registration'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {campus ? campus.name : 'SmartCampus'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border border-slate-200 rounded-md mb-4 overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="student@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Code
              </label>
              <input
                type="text"
                required
                placeholder={campus ? campus.code : 'Enter campus code'}
                value={campusCode}
                onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 text-xs sm:text-sm font-mono uppercase bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Must match your college code ({campus?.code || 'Not set'})
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs disabled:opacity-50 transition"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        {/* Demo Test Accounts Helper for Viva Evaluation */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-medium text-slate-400 block text-center mb-1.5">
            Quick Viva Demo Login (Password: Password123!)
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => autofillDemoStudent('rohan.sharma@campus.edu')}
              className="flex-1 py-1 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 truncate font-mono text-center"
            >
              Rohan (Seller)
            </button>
            <button
              type="button"
              onClick={() => autofillDemoStudent('ananya.patel@campus.edu')}
              className="flex-1 py-1 px-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 truncate font-mono text-center"
            >
              Ananya (Buyer)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
