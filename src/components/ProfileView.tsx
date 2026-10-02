import React, { useState, useEffect } from 'react';
import { User, Resource, TransactionRequest, Review } from '../types.ts';
import { formatCurrency, formatDate, compressImageFile } from '../utils.ts';
import {
  User as UserIcon,
  Package,
  ShoppingBag,
  Star,
  PlusCircle,
  Edit2,
  Trash2,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  AlertCircle,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onOpenAddResource: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteRequest: (resource: Resource) => void;
  onOpenReviewModal: (request: TransactionRequest) => void;
  onSelectResource: (resourceId: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenAddResource,
  onEditResource,
  onDeleteRequest,
  onOpenReviewModal,
  onSelectResource,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'reviews' | 'account'>('listings');
  const [myListings, setMyListings] = useState<Resource[]>([]);
  const [myRequests, setMyRequests] = useState<TransactionRequest[]>([]);
  const [sellerRequests, setSellerRequests] = useState<TransactionRequest[]>([]);
  const [reviewsReceived, setReviewsReceived] = useState<Review[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [listingsRes, requestsRes, sellerReqRes, reviewsRes] = await Promise.all([
        fetch('/api/resources/my'),
        fetch('/api/requests/my'),
        fetch('/api/requests/seller'),
        fetch(`/api/reviews/seller/${currentUser.id}`),
      ]);

      const [listingsData, requestsData, sellerReqData, reviewsData] = await Promise.all([
        listingsRes.json(),
        requestsRes.json(),
        sellerReqRes.json(),
        reviewsRes.json(),
      ]);

      if (listingsRes.ok) setMyListings(listingsData.resources || []);
      if (requestsRes.ok) setMyRequests(requestsData.requests || []);
      if (sellerReqRes.ok) setSellerRequests(sellerReqData.requests || []);
      if (reviewsRes.ok) setReviewsReceived(reviewsData.reviews || []);
    } catch (err: any) {
      setActionMessage({ type: 'error', text: 'Failed to refresh dashboard data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [currentUser.id]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setActionMessage(null);

    try {
      const base64 = await compressImageFile(file, 400, 400, 0.8);
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile picture');

      onUpdateUser({ ...currentUser, avatar: data.avatar });
      setActionMessage({ type: 'success', text: 'Profile photo updated successfully!' });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Seller: Accept Request
  const handleAcceptRequest = async (requestId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept request');

      setActionMessage({
        type: 'success',
        text: 'Request accepted! Resource is now marked Sold, and other pending requests have been rejected.',
      });
      loadDashboardData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Seller: Reject Request
  const handleRejectRequest = async (requestId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reject request');

      setActionMessage({ type: 'success', text: 'Request rejected.' });
      loadDashboardData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Buyer: Complete Transaction
  const handleCompleteTransaction = async (requestId: string) => {
    setActionMessage(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete transaction');

      setActionMessage({
        type: 'success',
        text: 'Transaction marked as completed! You can now write a review for the seller.',
      });
      loadDashboardData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Student Identity Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative group">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600/30 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-semibold">Change</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {currentUser.name}
                </h1>
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{currentUser.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-slate-500">
                <span>{currentUser.campusName}</span>
                <span aria-hidden="true">·</span>
                <span>Member since {formatDate(currentUser.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-lg font-bold text-slate-900 tabular-nums">
                {myListings.length}
              </span>
              <span className="text-[11px] font-medium text-slate-500">My Listings</span>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <span className="block text-lg font-bold text-slate-900 tabular-nums">
                {myRequests.length}
              </span>
              <span className="text-[11px] font-medium text-slate-500">My Requests</span>
            </div>
            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                <span className="text-lg font-bold text-slate-900 tabular-nums">
                  {currentUser.sellerRating ? currentUser.sellerRating.toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {currentUser.reviewCount || 0} Reviews
              </span>
            </div>
          </div>
        </div>

        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews Received ({reviewsReceived.length})</span>
        </button>
      </div>

      {/* TAB 1: MY LISTINGS (Seller View) */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Listed Resources</h2>
              <p className="text-xs text-slate-500">
                Manage your campus listings and review incoming purchase requests.
              </p>
            </div>
            <button
              onClick={onOpenAddResource}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Resource</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No resources listed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                Have books, notes, or stationery you no longer need? List them for other students on campus.
              </p>
              <button
                onClick={onOpenAddResource}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 shadow-sm transition"
              >
                List Your First Item
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myListings.map((resource) => {
                const isSold = resource.status === 'Sold';
                const resourceId = resource.id || resource._id;

                // Find incoming requests for this resource
                const incomingRequests = sellerRequests.filter(
                  (r) => r.resource?._id?.toString() === resourceId?.toString()
                );

                return (
                  <div
                    key={resourceId}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-5"
                  >
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      {/* Thumbnail */}
                      <div
                        onClick={() => onSelectResource(resourceId!)}
                        className="w-full md:w-32 h-28 bg-slate-100 rounded-lg overflow-hidden shrink-0 cursor-pointer relative group"
                      >
                        {resource.image ? (
                          <img
                            src={resource.image}
                            alt={resource.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                            {resource.category}
                          </div>
                        )}
                        {isSold && (
                          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                            <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                              Sold
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info & Action Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span>{resource.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{resource.condition}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatDate(resource.createdAt)}</span>
                          </div>

                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded ${
                              isSold
                                ? 'bg-slate-100 text-slate-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {resource.status}
                          </span>
                        </div>

                        <h3
                          onClick={() => onSelectResource(resourceId!)}
                          className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                        >
                          {resource.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {resource.description}
                        </p>

                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                          <span className="text-base font-bold text-slate-900 tabular-nums">
                            {formatCurrency(resource.price)}
                          </span>

                          <div className="flex items-center gap-2">
                            {isSold ? (
                              <span className="text-xs text-slate-400 italic">
                                Sold items are permanent & read-only
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => onEditResource(resource)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => onDeleteRequest(resource)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Incoming Buyer Requests for this Resource */}
                        {incomingRequests.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                              Buyer Requests ({incomingRequests.length})
                            </h4>

                            <div className="space-y-2">
                              {incomingRequests.map((req) => (
                                <div
                                  key={req._id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 gap-3 text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    {req.buyer?.avatar ? (
                                      <img
                                        src={req.buyer.avatar}
                                        alt={req.buyer.name}
                                        className="w-7 h-7 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                                        {req.buyer?.name?.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-semibold text-slate-900 block">
                                        {req.buyer?.name}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        Requested on {formatDate(req.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-center">
                                    <span
                                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                        req.status === 'Accepted'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : req.status === 'Completed'
                                          ? 'bg-blue-100 text-blue-800'
                                          : req.status === 'Rejected'
                                          ? 'bg-slate-200 text-slate-600'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {req.status}
                                    </span>

                                    {req.status === 'Pending' && !isSold && (
                                      <>
                                        <button
                                          onClick={() => handleAcceptRequest(req._id)}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium transition"
                                        >
                                          Accept Request
                                        </button>
                                        <button
                                          onClick={() => handleRejectRequest(req._id)}
                                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium transition"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REQUESTS (Buyer View) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Resource Requests</h2>
            <p className="text-xs text-slate-500">
              Track requests you made for books, study notes, and stationery.
            </p>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No requests submitted</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Browse resources on campus to find course books, notes, and study supplies.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const isAccepted = req.status === 'Accepted';
                const isCompleted = req.status === 'Completed';

                return (
                  <div
                    key={req._id}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Resource details */}
                      <div className="flex items-start gap-4">
                        <div
                          onClick={() => req.resource?._id && onSelectResource(req.resource._id)}
                          className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                        >
                          {req.resource?.image ? (
                            <img
                              src={req.resource.image}
                              alt={req.resource.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                              {req.resource?.category || 'Item'}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Seller: {req.seller?.name}</span>
                            <span aria-hidden="true">·</span>
                            <span>Requested {formatDate(req.createdAt)}</span>
                          </div>

                          <h3
                            onClick={() => req.resource?._id && onSelectResource(req.resource._id)}
                            className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer mt-0.5"
                          >
                            {req.resource?.title || 'Resource'}
                          </h3>

                          <span className="text-sm font-extrabold text-slate-900 tabular-nums mt-1 block">
                            {formatCurrency(req.price)}
                          </span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col sm:items-end gap-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded inline-block text-center ${
                            isCompleted
                              ? 'bg-blue-100 text-blue-800'
                              : isAccepted
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>

                        {isAccepted && (
                          <button
                            onClick={() => handleCompleteTransaction(req._id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                          >
                            Mark Transaction Completed
                          </button>
                        )}

                        {isCompleted && !req.isReviewed && (
                          <button
                            onClick={() => onOpenReviewModal(req)}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                          >
                            Leave Seller Review
                          </button>
                        )}

                        {isCompleted && req.isReviewed && (
                          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Review Submitted</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Revealed Seller Contact Info when Accepted or Completed */}
                    {(isAccepted || isCompleted) && req.seller?.email && (
                      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            <strong>Seller Contact:</strong> {req.seller.email}
                          </span>
                        </div>
                        <span className="text-emerald-700 text-[11px]">
                          Coordinate campus meetup & cash handover directly.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REVIEWS RECEIVED */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Seller Reviews & Reputation</h2>
            <p className="text-xs text-slate-500">
              Feedback from students who completed transactions with you.
            </p>
          </div>

          {reviewsReceived.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-800">No reviews received yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When buyers complete transactions for your items, their ratings and feedback will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviewsReceived.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rev.buyer?.name}</span>
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-slate-400 text-[11px]">{formatDate(rev.createdAt)}</span>
                  </div>
                  <p className="text-slate-700 italic">"{rev.comment}"</p>
                  {rev.resource?.title && (
                    <span className="text-[11px] text-slate-400 block">
                      Resource: {rev.resource.title}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
