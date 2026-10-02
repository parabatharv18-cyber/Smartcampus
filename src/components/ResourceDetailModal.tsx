import React, { useState, useEffect } from 'react';
import { Resource, User, Review } from '../types.ts';
import { formatCurrency, formatDate } from '../utils.ts';
import {
  X,
  Star,
  Shield,
  Clock,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
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
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 text-slate-500 hover:text-slate-800 p-2 rounded-full shadow-sm hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading resource details...
          </div>
        ) : error && !data ? (
          <div className="p-8 text-center">
            <p className="text-rose-600 text-sm font-medium mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        ) : resource ? (
          <div>
            {/* Image Banner */}
            <div className="relative w-full aspect-16/9 bg-slate-100 overflow-hidden rounded-t-2xl">
              {resource.image ? (
                <img
                  src={resource.image}
                  alt={resource.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                  <BookOpen className="w-12 h-12 stroke-[1.5]" />
                  <span className="text-xs mt-2 font-medium">{resource.category}</span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-xs ${
                    isSold
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {resource.status}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Messages */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Title & Metadata */}
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                  <span>{resource.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Condition: {resource.condition}</span>
                  <span aria-hidden="true">·</span>
                  <span>Listed {formatDate(resource.createdAt)}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {resource.title}
                </h2>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    {formatCurrency(resource.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (Campus peer-to-peer handover)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Item Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {resource.description}
                </p>
              </div>

              {/* Seller Reputation Profile Box */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {seller?.avatar ? (
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-base">
                        {seller?.name ? seller.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {seller?.name}
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          Campus Seller
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                          <span className="ml-1 text-xs font-bold text-slate-900 tabular-nums">
                            {seller?.averageRating ? seller.averageRating.toFixed(1) : 'New'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">
                          {seller?.reviewCount || 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[11px] text-slate-400 block">Verified Student</span>
                    <span className="text-xs text-slate-600 font-medium">
                      Joined {seller?.memberSince ? formatDate(seller.memberSince) : 'Recently'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Privacy protected: Seller's contact email is shared only after they accept your request.
                  </span>
                </div>

                {/* Seller Reviews Preview */}
                <div className="pt-2">
                  <h5 className="text-xs font-semibold text-slate-700 mb-2">
                    Student Reviews for this Seller ({data?.sellerReviews?.length || 0})
                  </h5>

                  {data?.sellerReviews && data.sellerReviews.length > 0 ? (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {data.sellerReviews.map((rev) => (
                        <div
                          key={rev._id}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">
                                {rev.buyer?.name || 'Fellow Student'}
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
                              <span className="text-[11px] text-slate-400">
                                {formatDate(rev.createdAt)}
                              </span>
                              <button
                                onClick={() => onReportReview(rev._id)}
                                title="Report inappropriate review"
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                              >
                                <Flag className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      No reviews yet for this seller. Be the first to transact and review!
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button Section */}
              <div className="pt-2">
                {isSold ? (
                  <div className="w-full py-3 px-4 bg-slate-100 text-slate-600 font-semibold text-sm rounded-xl text-center border border-slate-200">
                    This resource has been sold and is no longer available.
                  </div>
                ) : data?.isOwner ? (
                  <div className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-medium text-xs rounded-xl text-center border border-slate-200">
                    You listed this resource. Manage it under "My Listings" in your Profile.
                  </div>
                ) : data?.hasPendingRequest ? (
                  <div className="w-full py-3 px-4 bg-amber-50 text-amber-800 font-medium text-xs rounded-xl text-center border border-amber-200 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Your request is pending seller approval. Check "My Requests" in your profile.</span>
                  </div>
                ) : !currentUser ? (
                  <button
                    onClick={onOpenAuth}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-xs transition"
                  >
                    Log In to Request this Resource
                  </button>
                ) : (
                  <button
                    onClick={handleSendRequest}
                    disabled={isRequesting}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm disabled:opacity-50 transition"
                  >
                    {isRequesting ? 'Submitting Request...' : `Request Resource for ${formatCurrency(resource.price)}`}
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
