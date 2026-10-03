import React, { useState, useEffect } from 'react';
import { User, Resource, TransactionRequest, Review } from '../types.ts';
import { formatCurrency, formatDate, compressImageFile } from '../utils.ts';
import { apiRequest } from '../api.ts';
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
  LogOut,
  AlertCircle,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onOpenAddResource: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteRequest: (resource: Resource) => void;
  onOpenReviewModal: (request: TransactionRequest) => void;
  onSelectResource: (resourceId: string) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
  onOpenAddResource,
  onEditResource,
  onDeleteRequest,
  onOpenReviewModal,
  onSelectResource,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'requests' | 'reviews'>('listings');
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
        apiRequest('/api/resources/my'),
        apiRequest('/api/requests/my'),
        apiRequest('/api/requests/seller'),
        apiRequest(`/api/reviews/seller/${currentUser.id}`),
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
      const base64 = await compressImageFile(file, 300, 300, 0.8);
      const res = await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ avatar: base64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile picture');

      onUpdateUser({ ...currentUser, avatar: data.avatar });
      setActionMessage({ type: 'success', text: 'Profile picture updated successfully!' });
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
      const res = await apiRequest(`/api/requests/${requestId}/accept`, {
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
      const res = await apiRequest(`/api/requests/${requestId}/reject`, {
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
      const res = await apiRequest(`/api/requests/${requestId}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete transaction');

      setActionMessage({
        type: 'success',
        text: 'Transaction marked completed! You can now write a seller review.',
      });
      loadDashboardData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Student Account Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar & Upload */}
            <div className="relative group shrink-0">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <label
                htmlFor="avatar-upload-file"
                className="absolute inset-0 bg-slate-900/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Upload className="w-4 h-4 mb-0.5" />
                <span className="text-[9px] font-semibold">Upload</span>
              </label>
              <input
                id="avatar-upload-file"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </div>

            {/* User Details */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">{currentUser.name}</h1>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentUser.email}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>{currentUser.campusName}</span>
                <span aria-hidden="true">·</span>
                <span>Joined {formatDate(currentUser.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            {/* Seller Rating */}
            <div className="px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                <span className="text-xs font-bold text-slate-800 tabular-nums">
                  {currentUser.sellerRating ? currentUser.sellerRating.toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {currentUser.reviewCount || 0} reviews
              </span>
            </div>

            {/* Sell Resource Action */}
            <button
              onClick={onOpenAddResource}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell Resource</span>
            </button>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-slate-200 rounded-md transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Action feedback banner */}
        {actionMessage && (
          <div
            className={`mt-4 p-3 rounded-md text-xs font-medium flex items-center justify-between ${
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

      {/* Clearly Separated Sections Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'listings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Listings ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Reviews ({reviewsReceived.length})</span>
        </button>
      </div>

      {/* SECTION 1: MY LISTINGS */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Listings</h2>
              <p className="text-xs text-slate-500">
                Resources you posted for sale. You can edit or delete them before they are sold.
              </p>
            </div>
            <button
              onClick={onOpenAddResource}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Resource</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
              <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">You haven&apos;t listed any resources yet</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                Sell your old semester textbooks, handwritten study notes, or stationery.
              </p>
              <button
                onClick={onOpenAddResource}
                className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700"
              >
                List Resource
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((resource) => {
                const isSold = resource.status === 'Sold';
                const resourceId = resource.id || resource._id;
                const incomingRequests = sellerRequests.filter(
                  (r) => r.resource?._id?.toString() === resourceId?.toString()
                );

                return (
                  <div
                    key={resourceId}
                    className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => onSelectResource(resourceId!)}
                          className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0 cursor-pointer border border-slate-200"
                        >
                          {resource.image ? (
                            <img
                              src={resource.image}
                              alt={resource.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] text-center p-1">
                              {resource.category}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{resource.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{resource.condition}</span>
                            <span aria-hidden="true">·</span>
                            <span>Listed {formatDate(resource.createdAt)}</span>
                          </div>

                          <h3
                            onClick={() => onSelectResource(resourceId!)}
                            className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer mt-0.5"
                          >
                            {resource.title}
                          </h3>

                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-extrabold text-slate-900 tabular-nums">
                              {formatCurrency(resource.price)}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isSold
                                  ? 'bg-slate-800 text-white'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {resource.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Edit/Delete Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isSold ? (
                          <span className="text-xs text-slate-400 italic">
                            Sold (Read-only)
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => onEditResource(resource)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => onDeleteRequest(resource)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-md transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Incoming Requests for this item */}
                    {incomingRequests.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 text-xs">
                        <span className="font-semibold text-slate-700 block mb-2">
                          Buyer Requests ({incomingRequests.length}):
                        </span>

                        <div className="space-y-1.5">
                          {incomingRequests.map((req) => (
                            <div
                              key={req._id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-slate-50 rounded-md border border-slate-200 gap-2"
                            >
                              <div>
                                <span className="font-semibold text-slate-800">
                                  {req.buyer?.name}
                                </span>
                                <span className="text-slate-400 text-[11px] ml-2">
                                  {formatDate(req.createdAt)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
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
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleAcceptRequest(req._id)}
                                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleRejectRequest(req._id)}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-medium"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: MY REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Requests</h2>
            <p className="text-xs text-slate-500">
              Track items you requested to buy from fellow campus students.
            </p>
          </div>

          {myRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No requests sent yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Browse resources and click &ldquo;Request&rdquo; on textbooks or notes you need.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.map((req) => {
                const isAccepted = req.status === 'Accepted';
                const isCompleted = req.status === 'Completed';

                return (
                  <div
                    key={req._id}
                    className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Resource details */}
                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => req.resource?._id && onSelectResource(req.resource._id)}
                          className="w-14 h-14 bg-slate-100 rounded-md overflow-hidden shrink-0 cursor-pointer border border-slate-200"
                        >
                          {req.resource?.image ? (
                            <img
                              src={req.resource.image}
                              alt={req.resource.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] text-center p-1">
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

                          <span className="text-sm font-extrabold text-slate-900 tabular-nums mt-0.5 block">
                            {formatCurrency(req.price)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Status badge & Actions */}
                      <div className="flex flex-col sm:items-end gap-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded text-center inline-block ${
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
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition"
                          >
                            Mark Transaction Completed
                          </button>
                        )}

                        {isCompleted && !req.isReviewed && (
                          <button
                            onClick={() => onOpenReviewModal(req)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition"
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

                    {/* Revealed Seller Email on Accepted / Completed */}
                    {(isAccepted || isCompleted) && req.seller?.email && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>
                            <strong>Seller Contact:</strong> {req.seller.email}
                          </span>
                        </div>
                        <span className="text-emerald-700 text-[11px]">
                          Contact the seller to arrange on-campus meetup & payment.
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

      {/* SECTION 3: REVIEWS RECEIVED */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Seller Reviews</h2>
            <p className="text-xs text-slate-500">
              Ratings and feedback received from buyers on campus.
            </p>
          </div>

          {reviewsReceived.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-slate-200">
              <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">No reviews received yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Reviews left by students after completing transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reviewsReceived.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-xs text-xs space-y-1.5"
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
                  <p className="text-slate-700 italic">&ldquo;{rev.comment}&rdquo;</p>
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
