import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Key, CheckCircle2, Building2 } from 'lucide-react';
import { User, Campus } from '../types.ts';

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

  // Sync mode if initialMode prop changes
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

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Student Sign In' : 'Student Registration'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {campus ? `Exclusive access for ${campus.name}` : 'SmartCampus Student Portal'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
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
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="student@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {mode === 'register' && (
              <p className="mt-1 text-[11px] text-slate-500">
                Hashed securely with bcrypt before storing in MongoDB.
              </p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder={campus ? campus.code : 'Enter campus code'}
                  value={campusCode}
                  onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3.5 py-2 text-sm font-mono uppercase tracking-wider bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Must match your college's code ({campus?.code || 'Not set'}).
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-xs disabled:opacity-50 transition"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In to Campus'
              : 'Create Student Account'}
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-medium text-slate-400 block text-center mb-2">
            Demo Viva Test Accounts (Password: Password123!)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => autofillDemoStudent('rohan.sharma@campus.edu')}
              className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 truncate font-mono"
            >
              Rohan (Seller)
            </button>
            <button
              type="button"
              onClick={() => autofillDemoStudent('ananya.patel@campus.edu')}
              className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 truncate font-mono"
            >
              Ananya (Buyer)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
