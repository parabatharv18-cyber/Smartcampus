import React, { useState, useEffect } from 'react';
import { Resource, User, Review } from '../types.ts';
import { formatCurrency, formatDate } from '../utils.ts';
import { apiRequest } from '../api.ts';
import {
  X,
  Star,
  Shield,
  Clock,
  CheckCircle,
  Flag,
  BookOpen,
} from 'lucide-react';

interface ResourceDetailModalProps {
  resourceId: string | null;
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onRequestSuccess: () => void;
  onReportReview: (reviewId: string) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resourceId,
  currentUser,
  onClose,
  onOpenAuth,
  onRequestSuccess,
  onReportReview,
}) => {
  const [data, setData] = useState<{
    resource: Resource;
    sellerReviews: Review[];
    hasPendingRequest: boolean;
    isOwner: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    fetch(`/api/resources/${resourceId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load resource details');
        return res.json();
      })
      .then((resData) => {
        if (isMounted) {
          setData(resData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [resourceId]);

  if (!resourceId) return null;

  const handleSendRequest = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsRequesting(true);
    setError(null);

    try {
      const res = await apiRequest('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ resourceId }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit request.');
      }

      setSuccessMessage('Your request has been submitted to the seller! You will see their contact info in "My Requests" once they accept.');
      if (data) {
        setData({ ...data, hasPendingRequest: true });
      }
      onRequestSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRequesting(false);
    }
  };

  const resource = data?.resource;
  const seller = resource?.seller;
  const isSold = resource?.status === 'Sold';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white text-slate-500 hover:text-slate-800 p-1.5 rounded-full border border-slate-200 shadow-xs hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            Loading details...
          </div>
        ) : error && !data ? (
          <div className="p-6 text-center">
            <p className="text-rose-600 text-sm font-medium mb-3">{error}</p>
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md"
            >
              Close
            </button>
          </div>
        ) : resource ? (
          <div>
            {/* Image Preview */}
            <div className="relative w-full aspect-16/9 bg-slate-100 overflow-hidden border-b border-slate-200">
              {resource.image ? (
                <img
                  src={resource.image}
                  alt={resource.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                  <BookOpen className="w-10 h-10" />
                  <span className="text-xs mt-1 font-medium">{resource.category}</span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-xs ${
                    isSold
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {resource.status}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Feedback banners */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Title & Price */}
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>{resource.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700">Condition: {resource.condition}</span>
                  <span aria-hidden="true">·</span>
                  <span>Listed {formatDate(resource.createdAt)}</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {resource.title}
                </h2>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(resource.price)}
                  </span>
                  <span className="text-xs text-slate-500">
                    (In-person campus handover)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-md border border-slate-200">
                  {resource.description}
                </p>
              </div>

              {/* Seller Profile & Reputation */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {seller?.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                        {seller?.name ? seller.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {seller?.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                          <span className="ml-1 font-bold text-slate-800 tabular-nums">
                            {seller?.averageRating ? seller.averageRating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-medium">
                          {seller?.reviewCount || 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Joined {seller?.memberSince ? formatDate(seller.memberSince) : 'Recently'}
                  </span>
                </div>

                {/* Privacy note */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Seller contact is revealed only after they accept your request.</span>
                </div>

                {/* Seller Reviews List */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Reviews from previous buyers ({data?.sellerReviews?.length || 0}):
                  </span>

                  {data?.sellerReviews && data.sellerReviews.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {data.sellerReviews.map((rev) => (
                        <div
                          key={rev._id}
                          className="p-2.5 bg-white rounded border border-slate-200 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">
                                {rev.buyer?.name || 'Student'}
                              </span>
                              <div className="flex items-center text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < rev.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">
                                {formatDate(rev.createdAt)}
                              </span>
                              <button
                                onClick={() => onReportReview(rev._id)}
                                title="Report review"
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-600 italic">&ldquo;{rev.comment}&rdquo;</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No reviews yet for this seller.
                    </p>
                  )}
                </div>
              </div>

              {/* Main Action Button */}
              <div>
                {isSold ? (
                  <div className="w-full py-2.5 px-4 bg-slate-100 text-slate-600 font-semibold text-xs rounded-md text-center border border-slate-200">
                    This resource is sold and no longer available.
                  </div>
                ) : data?.isOwner ? (
                  <div className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 font-medium text-xs rounded-md text-center border border-slate-200">
                    You listed this item. Manage it under &ldquo;My Listings&rdquo; in your Profile.
                  </div>
                ) : data?.hasPendingRequest ? (
                  <div className="w-full py-2.5 px-4 bg-amber-50 text-amber-800 font-medium text-xs rounded-md text-center border border-amber-200 flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Your request is pending seller approval. Check &ldquo;My Requests&rdquo;.</span>
                  </div>
                ) : !currentUser ? (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition"
                  >
                    Log In to Request this Resource
                  </button>
                ) : (
                  <button
                    onClick={handleSendRequest}
                    disabled={isRequesting}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs disabled:opacity-50 transition"
                  >
                    {isRequesting ? 'Submitting Request...' : `Request Resource (${formatCurrency(resource.price)})`}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
