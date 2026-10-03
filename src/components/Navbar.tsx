import React from 'react';
import { User, Campus } from '../types.ts';
import { PlusCircle, LogIn, User as UserIcon, LogOut, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'browse' | 'profile';
  onNavigate: (tab: 'home' | 'browse' | 'profile') => void;
  currentUser: User | null;
  campus: Campus | null;
  onOpenAuth: (initialMode: 'login' | 'register') => void;
  onOpenAddResource: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  currentUser,
  campus,
  onOpenAuth,
  onOpenAddResource,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Campus Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 block leading-none">
                  SmartCampus
                </span>
                {campus && (
                  <span className="text-[11px] text-slate-500 font-medium block mt-1 leading-none truncate max-w-[160px] sm:max-w-xs">
                    {campus.name}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Simple Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                currentTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                currentTab === 'browse'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Browse Resources
            </button>
            <button
              onClick={() => {
                if (currentUser) {
                  onNavigate('profile');
                } else {
                  onOpenAuth('login');
                }
              }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                currentTab === 'profile'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Profile
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={onOpenAddResource}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Sell Resource</span>
                  <span className="sm:hidden">Sell</span>
                </button>

                <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-1.5 p-1 rounded-md hover:bg-slate-100 transition-colors"
                    title="Open Profile Dashboard"
                  >
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:inline-block text-xs font-medium text-slate-700 max-w-[90px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </button>

                  <button
                    onClick={onLogout}
                    title="Log Out"
                    className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
