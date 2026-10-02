import React, { useState, useEffect } from 'react';
import { Resource, ResourceCategory, ResourceCondition } from '../types.ts';
import { ResourceCard } from './ResourceCard.tsx';
import { Search, Filter, RefreshCw, XCircle } from 'lucide-react';

interface BrowseViewProps {
  onSelectResource: (resourceId: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  onSelectResource,
  initialCategory = '',
  initialSearch = '',
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<string>(initialCategory);
  const [condition, setCondition] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category) params.append('category', category);
      if (condition) params.append('condition', condition);
      if (minPrice && !isNaN(Number(minPrice))) params.append('minPrice', minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) params.append('maxPrice', maxPrice);

      const res = await fetch(`/api/resources?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, condition]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const handlePriceFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    // Trigger immediate reload
    setTimeout(() => {
      fetch('/api/resources')
        .then((r) => r.json())
        .then((d) => setResources(d.resources || []));
    }, 10);
  };

  const categories: { label: string; value: string }[] = [
    { label: 'All Categories', value: '' },
    { label: 'Books', value: 'Books' },
    { label: 'Notes / Study Material', value: 'Notes / Study Material' },
    { label: 'Stationery', value: 'Stationery' },
  ];

  const conditions: { label: string; value: string }[] = [
    { label: 'All Conditions', value: '' },
    { label: 'New', value: 'New' },
    { label: 'Like New', value: 'Like New' },
    { label: 'Good', value: 'Good' },
    { label: 'Fair', value: 'Fair' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Browse Campus Marketplace
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Find used textbooks, lecture notes, and study gear from students in your college.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-8 shadow-xs space-y-4">
        {/* Row 1: Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, subject, textbook edition, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Search
          </button>
        </form>

        {/* Row 2: Category Segmented Filter & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {categories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  category === c.value
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Condition Dropdown & Price Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {conditions.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>

            <form onSubmit={handlePriceFilterSubmit} className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 px-2 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Apply
              </button>
            </form>

            {(search || category || condition || minPrice || maxPrice) && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition font-medium"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Resources */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          Loading campus resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-base font-semibold text-slate-800">No resources found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search keywords, price range, or category filter.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id || resource._id}
              resource={resource}
              onClick={() => onSelectResource((resource.id || resource._id)!)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
