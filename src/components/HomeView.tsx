import React, { useState, useEffect } from 'react';
import { Resource, User, Campus } from '../types.ts';
import { ResourceCard } from './ResourceCard.tsx';
import {
  Search,
  BookOpen,
  FileText,
  PenTool,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HomeViewProps {
  campus: Campus | null;
  currentUser: User | null;
  onNavigateToBrowse: (category?: string, search?: string) => void;
  onSelectResource: (resourceId: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onOpenAddResource: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  campus,
  currentUser,
  onNavigateToBrowse,
  onSelectResource,
  onOpenAuth,
  onOpenAddResource,
}) => {
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => {
        setRecentResources((data.resources || []).slice(0, 8));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load recent resources', err);
        setIsLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigateToBrowse(undefined, searchInput.trim());
    } else {
      onNavigateToBrowse();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Clean Hero Card */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          {campus && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 text-xs font-semibold text-slate-700 mb-3">
              <span>{campus.name}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-emerald-700">{campus.code}</span>
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
            Student Resource Exchange
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
            A simple platform for college students to buy and sell textbooks, lecture notes, and stationery directly with peers on campus.
          </p>

          {/* Simple Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-5 flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search textbooks, notes, stationery..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Campus-isolated: Only students with the campus code can register and view listings.</span>
          </div>
        </div>
      </section>

      {/* Category Buttons */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900">Resource Categories</h2>
          <button
            onClick={() => onNavigateToBrowse()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Books */}
          <button
            onClick={() => onNavigateToBrowse('Books')}
            className="p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 text-left transition-colors flex items-start gap-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Books</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Semester textbooks, reference guides, exam books
              </p>
            </div>
          </button>

          {/* Notes */}
          <button
            onClick={() => onNavigateToBrowse('Notes / Study Material')}
            className="p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 text-left transition-colors flex items-start gap-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notes / Study Material</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Handwritten notes, solved papers, lecture diagrams
              </p>
            </div>
          </button>

          {/* Stationery */}
          <button
            onClick={() => onNavigateToBrowse('Stationery')}
            className="p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-600 text-left transition-colors flex items-start gap-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Stationery</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Mini drafters, compass kits, calculators, tools
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Recently Listed Resources */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recently Listed Resources
            </h2>
            <p className="text-xs text-slate-500">
              Items available on campus for pickup
            </p>
          </div>

          <button
            onClick={() => onNavigateToBrowse()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading recent listings...
          </div>
        ) : recentResources.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-lg border border-slate-200 shadow-xs">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No resources listed yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-3">
              Be the first student to list a textbook or study material on campus!
            </p>
            {currentUser ? (
              <button
                onClick={onOpenAddResource}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700"
              >
                List a Resource
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800"
              >
                Register to Sell
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentResources.map((resource) => (
              <ResourceCard
                key={resource.id || resource._id}
                resource={resource}
                onClick={() => onSelectResource((resource.id || resource._id)!)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Simple 3-Step Guide */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-emerald-700 text-sm block mb-1">Step 1: Request</span>
            <p className="text-slate-600">
              Browse listings on campus and click &ldquo;Request&rdquo; on an item you need.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-emerald-700 text-sm block mb-1">Step 2: Accept & Meet</span>
            <p className="text-slate-600">
              When the seller accepts, their email is revealed. Meet up on campus for cash handover.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-bold text-emerald-700 text-sm block mb-1">Step 3: Complete & Review</span>
            <p className="text-slate-600">
              Mark the transaction completed and leave a 1-5 star review to help other students.
            </p>
          </div>
        </div>

        {!currentUser && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-600">
              Have an account on SmartCampus?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs"
              >
                Create Student Account
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
