import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  resourceTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  resourceTitle,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 text-rose-600 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-base font-bold text-slate-900">
            Delete Listing?
          </h3>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Are you sure you want to permanently delete &ldquo;
          <span className="font-semibold text-slate-800">{resourceTitle}</span>
          &rdquo;? This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs disabled:opacity-50 transition"
          >
            {isDeleting ? 'Deleting...' : 'Delete Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};
