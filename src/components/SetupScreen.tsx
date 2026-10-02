import React, { useState } from 'react';
import { Building2, Key, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { Campus } from '../types.ts';

interface SetupScreenProps {
  onSetupComplete: (campus: Campus) => void;
  onSeedDemo: () => Promise<Campus>;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onSetupComplete,
  onSeedDemo,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Please provide both College Name and a Unique Campus Code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/campus/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), code: code.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize campus.');
      }

      onSetupComplete(data.campus);
    } catch (err: any) {
      setError(err.message || 'Error configuring campus.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const campus = await onSeedDemo();
      onSetupComplete(campus);
    } catch (err: any) {
      setError(err.message || 'Failed to seed sample campus.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Initial Campus Setup
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Welcome to <strong className="text-slate-900 font-semibold">SmartCampus</strong>. Configure your college instance. Once configured, this setup cannot be changed and students will register using this campus code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="campusName" className="block text-xs font-semibold text-slate-700">
                College / Campus Name
              </label>
              <div className="mt-1 relative">
                <input
                  id="campusName"
                  type="text"
                  required
                  placeholder="e.g. Stanford University or MIT"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Official name of your college or university campus.
              </p>
            </div>

            <div>
              <label htmlFor="campusCode" className="block text-xs font-semibold text-slate-700">
                Unique Campus Code
              </label>
              <div className="mt-1 relative">
                <input
                  id="campusCode"
                  type="text"
                  required
                  placeholder="e.g. STAN2025 or CAMPUS01"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono tracking-wider uppercase text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Students will need this exact code to register. Protects campus isolation.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
            >
              {isLoading ? 'Configuring Campus...' : 'Initialize Campus Instance'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <span className="text-xs text-slate-500 block mb-3">
                Need to quickly evaluate the project for your viva?
              </span>
              <button
                type="button"
                onClick={handleSeedDemo}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 transition"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Quick Setup with Demo Campus & Sample Listings</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Strict single-campus architecture & security enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
