/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Campus, User, Resource, TransactionRequest } from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { SetupScreen } from './components/SetupScreen.tsx';
import { HomeView } from './components/HomeView.tsx';
import { BrowseView } from './components/BrowseView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ResourceDetailModal } from './components/ResourceDetailModal.tsx';
import { AddEditResourceModal } from './components/AddEditResourceModal.tsx';
import { DeleteConfirmModal } from './components/DeleteConfirmModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { ReportReviewModal } from './components/ReportReviewModal.tsx';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import { apiRequest, setStoredUserId, removeStoredUserId } from './api.ts';

export default function App() {
  const [campus, setCampus] = useState<Campus | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<'home' | 'browse' | 'profile'>('home');

  // Browse filters state from Home navigation
  const [browseCategory, setBrowseCategory] = useState<string>('');
  const [browseSearch, setBrowseSearch] = useState<string>('');

  // Modals state
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'login' | 'register';
  }>({ isOpen: false, mode: 'login' });

  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);

  const [deleteConfirmResource, setDeleteConfirmResource] = useState<Resource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [reviewRequest, setReviewRequest] = useState<TransactionRequest | null>(null);
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Initial check: Campus status and active session
  useEffect(() => {
    const initApp = async () => {
      try {
        const campusRes = await fetch('/api/campus/status');
        const campusData = await campusRes.json();

        if (campusData.configured && campusData.campus) {
          setCampus(campusData.campus);
          setIsConfigured(true);

          // Check session
          const authRes = await apiRequest('/api/auth/me');
          const authData = await authRes.json();
          if (authData.user) {
            setStoredUserId(authData.user.id);
            setCurrentUser(authData.user);
          } else {
            removeStoredUserId();
          }
        } else {
          setIsConfigured(false);
        }
      } catch (err) {
        console.error('Failed to initialize app state', err);
        setIsConfigured(false);
      }
    };

    initApp();
  }, []);

  // Quick Seed Demo helper
  const handleSeedDemo = async (): Promise<Campus> => {
    const res = await apiRequest('/api/campus/seed-demo', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to seed demo data');
    setCampus(data.campus);
    setIsConfigured(true);
    showToast('Demo campus initialized! You can log in using the demo accounts below.');
    return data.campus;
  };

  const handleSetupComplete = (newCampus: Campus) => {
    setCampus(newCampus);
    setIsConfigured(true);
    showToast(`Campus "${newCampus.name}" initialized successfully! Students can now register.`);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      removeStoredUserId();
      setCurrentUser(null);
      setCurrentTab('home');
      showToast('You have been logged out.');
    } catch (err) {
      console.error('Logout error', err);
      removeStoredUserId();
      setCurrentUser(null);
    }
  };

  // Delete listing action
  const handleConfirmDelete = async () => {
    if (!deleteConfirmResource) return;
    const id = deleteConfirmResource.id || deleteConfirmResource._id;

    setIsDeleting(true);
    try {
      const res = await apiRequest(`/api/resources/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      showToast('Listing permanently deleted.');
      setDeleteConfirmResource(null);
    } catch (err: any) {
      showToast(err.message || 'Error deleting listing');
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigation handlers
  const handleNavigateToBrowse = (category?: string, search?: string) => {
    setBrowseCategory(category || '');
    setBrowseSearch(search || '');
    setCurrentTab('browse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTab = (tab: 'home' | 'browse' | 'profile') => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // App is loading initial status
  if (isConfigured === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-pulse">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold text-slate-500">Connecting to SmartCampus...</span>
        </div>
      </div>
    );
  }

  // First-time Campus Setup Screen
  if (isConfigured === false) {
    return <SetupScreen onSetupComplete={handleSetupComplete} onSeedDemo={handleSeedDemo} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg border border-slate-700 animate-fade-in flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleSelectTab}
        currentUser={currentUser}
        campus={campus}
        onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
        onOpenAddResource={() => {
          setResourceToEdit(null);
          setIsAddEditModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomeView
            campus={campus}
            currentUser={currentUser}
            onNavigateToBrowse={handleNavigateToBrowse}
            onSelectResource={(id) => setSelectedResourceId(id)}
            onOpenAuth={(mode) => setAuthModalState({ isOpen: true, mode })}
            onOpenAddResource={() => {
              setResourceToEdit(null);
              setIsAddEditModalOpen(true);
            }}
          />
        )}

        {currentTab === 'browse' && (
          <BrowseView
            onSelectResource={(id) => setSelectedResourceId(id)}
            initialCategory={browseCategory}
            initialSearch={browseSearch}
          />
        )}

        {currentTab === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onOpenAddResource={() => {
              setResourceToEdit(null);
              setIsAddEditModalOpen(true);
            }}
            onEditResource={(res) => {
              setResourceToEdit(res);
              setIsAddEditModalOpen(true);
            }}
            onDeleteRequest={(res) => setDeleteConfirmResource(res)}
            onOpenReviewModal={(req) => setReviewRequest(req)}
            onSelectResource={(id) => setSelectedResourceId(id)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">SmartCampus</span>
            <span aria-hidden="true">·</span>
            <span>{campus?.name}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-700 font-semibold">{campus?.code}</span>
          </div>

          <div className="flex items-center gap-4">
            <span>College Project MVP</span>
            <span aria-hidden="true">·</span>
            <span>Session Auth & MongoDB</span>
            <span aria-hidden="true">·</span>
            <span>Books, Notes & Stationery</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        campus={campus}
        onClose={() => setAuthModalState({ ...authModalState, isOpen: false })}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name}!`);
        }}
      />

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resourceId={selectedResourceId}
        currentUser={currentUser}
        onClose={() => setSelectedResourceId(null)}
        onOpenAuth={() => setAuthModalState({ isOpen: true, mode: 'login' })}
        onRequestSuccess={() => {
          showToast('Request sent to seller! Check "My Requests" in your profile.');
        }}
        onReportReview={(reviewId) => setReportReviewId(reviewId)}
      />

      {/* Add / Edit Resource Modal */}
      <AddEditResourceModal
        isOpen={isAddEditModalOpen}
        resourceToEdit={resourceToEdit}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setResourceToEdit(null);
        }}
        onSuccess={(savedResource) => {
          showToast(resourceToEdit ? 'Listing updated successfully!' : 'New resource published to campus!');
          // If in browse tab or profile tab, refresh by triggering re-render
          if (currentTab === 'home') {
            setCurrentTab('browse');
          }
        }}
      />

      {/* Delete Listing Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteConfirmResource}
        resourceTitle={deleteConfirmResource?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmResource(null)}
      />

      {/* Review Modal */}
      <ReviewModal
        request={reviewRequest}
        onClose={() => setReviewRequest(null)}
        onSuccess={() => {
          showToast('Thank you! Your seller review has been published.');
        }}
      />

      {/* Report Review Modal */}
      <ReportReviewModal
        reviewId={reportReviewId}
        onClose={() => setReportReviewId(null)}
      />
    </div>
  );
}
