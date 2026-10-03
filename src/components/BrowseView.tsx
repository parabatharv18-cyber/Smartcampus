import React, { useState, useEffect } from 'react';
import { Resource } from '../types.ts';
import { ResourceCard } from './ResourceCard.tsx';
import { Search, X } from 'lucide-react';

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

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setTimeout(() => {
      fetch('/api/resources')
        .then((r) => r.json())
        .then((d) => setResources(d.resources || []));
    }, 10);
  };

  const hasActiveFilters = Boolean(search || category || condition || minPrice || maxPrice);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Title & Filter Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Browse Resources
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore textbooks, notes, and stationery listed by students in your campus.
        </p>
      </div>

      {/* Simple Filter Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3">
        {/* Row 1: Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
          >
            Search
          </button>
        </form>

        {/* Row 2: Category, Condition, and Price Range */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="Books">Books</option>
                <option value="Notes / Study Material">Notes / Study Material</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>

            {/* Condition Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Condition:</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Price Filter */}
            <form onSubmit={handlePriceSubmit} className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Price:</span>
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-md text-slate-800 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md"
              >
                Apply
              </button>
            </form>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Resources Count */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong>{resources.length}</strong> resources
        </span>
      </div>

      {/* Grid of Resources */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading resources...
        </div>
      ) : resources.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-800">No matching resources found</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try modifying your search or clearing the active filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
