import React, { useState } from 'react';
import { Resource } from '../types.ts';
import { formatCurrency } from '../utils.ts';
import { BookOpen, FileText, PenTool, CheckCircle2 } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Books':
        return <BookOpen className="w-8 h-8 text-slate-400" />;
      case 'Notes / Study Material':
        return <FileText className="w-8 h-8 text-slate-400" />;
      case 'Stationery':
        return <PenTool className="w-8 h-8 text-slate-400" />;
      default:
        return <BookOpen className="w-8 h-8 text-slate-400" />;
    }
  };

  const isSold = resource.status === 'Sold';

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      {/* Image container */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {resource.image && !imgError ? (
          <img
            src={resource.image}
            alt={resource.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-100">
            {getCategoryIcon(resource.category)}
            <span className="mt-2 text-xs font-medium text-slate-500 line-clamp-1">
              {resource.category}
            </span>
          </div>
        )}

        {/* Sold Overlay banner */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-slate-900/90 text-white font-semibold text-xs tracking-wider uppercase px-3 py-1 rounded">
              Sold
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Unboxed Metadata with typographic separator */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
          <span>{resource.category}</span>
          <span aria-hidden="true">·</span>
          <span>{resource.condition}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {resource.title}
        </h3>

        {/* Description Snippet */}
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {resource.description}
        </p>

        {/* Bottom Bar: Price & Seller */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {formatCurrency(resource.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {resource.seller?.avatar ? (
              <img
                src={resource.seller.avatar}
                alt={resource.seller.name}
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-semibold">
                {resource.seller?.name ? resource.seller.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
            <span className="text-xs text-slate-600 font-medium truncate max-w-[100px]">
              {resource.seller?.name?.split(' ')[0] || 'Student'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
