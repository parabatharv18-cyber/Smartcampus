import React, { useState } from 'react';
import { Building2, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl mx-auto flex items-center justify-center text-white shadow-xs mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            SmartCampus Setup
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Configure your college instance. Once initialized, students can register using the campus code.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="campusName" className="block text-xs font-semibold text-slate-700 mb-1">
                College / Campus Name
              </label>
              <input
                id="campusName"
                type="text"
                required
                placeholder="e.g. City Engineering College"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="campusCode" className="block text-xs font-semibold text-slate-700 mb-1">
                Unique Campus Code
              </label>
              <input
                id="campusCode"
                type="text"
                required
                placeholder="e.g. CAMPUS2025"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs sm:text-sm font-mono uppercase tracking-wider bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Students will need this code when creating their account.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs disabled:opacity-50 transition"
            >
              {isLoading ? 'Configuring...' : 'Initialize Campus'}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400 block mb-2">
              For testing / college viva evaluation:
            </span>
            <button
              type="button"
              onClick={handleSeedDemo}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Load Demo Campus & Sample Listings</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Single-campus deployment model</span>
          </div>
        </div>
      </div>
    </div>
  );
};
