import React, { useState } from 'react';
import { Resource } from '../types.ts';
import { formatCurrency } from '../utils.ts';
import { BookOpen, FileText, PenTool } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Books':
        return <BookOpen className="w-6 h-6 text-slate-400" />;
      case 'Notes / Study Material':
        return <FileText className="w-6 h-6 text-slate-400" />;
      case 'Stationery':
        return <PenTool className="w-6 h-6 text-slate-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-slate-400" />;
    }
  };

  const isSold = resource.status === 'Sold';

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col h-full hover:border-slate-300 transition-colors shadow-xs">
      {/* Image Container */}
      <div
        onClick={onClick}
        className="relative aspect-4/3 w-full bg-slate-100 cursor-pointer overflow-hidden"
      >
        {resource.image && !imgError ? (
          <img
            src={resource.image}
            alt={resource.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-100">
            {getCategoryIcon(resource.category)}
            <span className="mt-1 text-[11px] text-slate-500 font-medium">
              {resource.category}
            </span>
          </div>
        )}

        {/* Status Label */}
        <div className="absolute top-2 left-2">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs ${
              isSold
                ? 'bg-slate-800 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isSold ? 'Sold' : 'Available'}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Category & Condition */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium text-slate-600 truncate">{resource.category}</span>
          <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
            {resource.condition}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={onClick}
          className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-700 transition-colors"
          title={resource.title}
        >
          {resource.title}
        </h3>

        {/* Seller Info */}
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>Seller:</span>
          <span className="font-medium text-slate-700 truncate">
            {resource.seller?.name || 'Student'}
          </span>
        </div>

        {/* Price & Action Button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {formatCurrency(resource.price)}
            </span>
          </div>

          <button
            onClick={onClick}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              isSold
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isSold ? 'View Details' : 'View / Request'}
          </button>
        </div>
      </div>
    </div>
  );
};
