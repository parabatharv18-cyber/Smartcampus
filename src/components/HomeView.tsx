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
  Users,
  Repeat,
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
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Ambient background photo */}
        <div className="absolute inset-0 opacity-25">
          <img
            src="/src/assets/images/campus_exchange_hero_1790937728201.jpg"
            alt="Campus study commons"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 backdrop-blur-xs text-xs font-medium text-emerald-400 mb-4">
              <span>{campus ? campus.name : 'Exclusive Campus Exchange'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{campus?.code}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Exchange textbooks & notes directly with peers.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              SmartCampus connects students in the same college to buy and sell verified course materials, handwritten semester notes, and engineering stationery.
            </p>

            {/* Hero Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 flex gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books, lecture notes, stationery..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-lg"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg transition whitespace-nowrap"
              >
                Find Resource
              </button>
            </form>

            {/* Quick stats / trust notes */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Single-campus student isolation</span>
              </div>
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <span>Zero commission peer-to-peer</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Verified student community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Discovery Buttons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Browse by Category</h2>
          <button
            onClick={() => onNavigateToBrowse()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category 1: Books */}
          <button
            onClick={() => onNavigateToBrowse('Books')}
            className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-600/50 hover:shadow-md transition text-left flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                Books
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Semester textbooks, reference guides, and competitive exam books.
              </p>
            </div>
          </button>

          {/* Category 2: Notes / Study Material */}
          <button
            onClick={() => onNavigateToBrowse('Notes / Study Material')}
            className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-600/50 hover:shadow-md transition text-left flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                Notes / Study Material
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Handwritten lecture notes, solved question papers, and diagrams.
              </p>
            </div>
          </button>

          {/* Category 3: Stationery */}
          <button
            onClick={() => onNavigateToBrowse('Stationery')}
            className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-emerald-600/50 hover:shadow-md transition text-left flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
                Stationery
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Engineering drafters, scientific calculators, compass kits, and supplies.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Recently Listed Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Recently Listed Resources
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest items available for pickup on your campus
            </p>
          </div>
          <button
            onClick={() => onNavigateToBrowse()}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Loading recent listings...
          </div>
        ) : recentResources.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No resources listed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Be the first student to list a textbook or study material on campus!
            </p>
            {currentUser ? (
              <button
                onClick={onOpenAddResource}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 shadow-sm"
              >
                List a Resource
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('register')}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
              >
                Register to Sell
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

      {/* How it Works / Collegiate Workflow Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 block mb-1">
              Simple 3-Step Process
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              How SmartCampus Resource Exchange Works
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Designed for simple on-campus handovers without third-party fees or shipping hassles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-sm">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Browse & Request
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Find textbooks, lecture notes, or stationery. Click request to send an inquiry to the student seller.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-sm">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Seller Accepts & Meetup
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Once the seller accepts your request, their contact email is revealed. Meet up on campus to exchange the item and cash.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 font-bold flex items-center justify-center text-sm">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Complete & Review
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mark the transaction as completed and leave a 1–5 star review to help future buyers evaluate seller reliability.
              </p>
            </div>
          </div>

          {!currentUser && (
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Ready to join {campus ? campus.name : 'your campus'}?
                </h4>
                <p className="text-xs text-slate-500">
                  Register with your campus code to buy and sell resources.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
