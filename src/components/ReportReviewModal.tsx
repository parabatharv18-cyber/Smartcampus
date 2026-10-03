import React, { useState } from 'react';
import { X, Flag, CheckCircle } from 'lucide-react';
import { apiRequest } from '../api.ts';

interface ReportReviewModalProps {
  reviewId: string | null;
  onClose: () => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({ reviewId, onClose }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!reviewId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for reporting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl max-w-sm w-full p-5 sm:p-6 shadow-xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-600 mb-1">
          <Flag className="w-4 h-4" />
          <h3 className="text-base font-bold text-slate-900">Report Review</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Reports are stored in the MongoDB database for administrative record.
        </p>

        {submitted ? (
          <div className="py-4 text-center space-y-1.5">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-semibold text-slate-900">Report Recorded</h4>
            <p className="text-xs text-slate-500">
              Thank you for keeping our campus community safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Reporting
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Inappropriate language, spam, or false review"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Logging...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
