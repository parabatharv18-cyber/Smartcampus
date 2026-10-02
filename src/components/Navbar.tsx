import React from 'react';
import { User, Campus } from '../types.ts';
import { PlusCircle, LogIn, User as UserIcon, LogOut, GraduationCap, Building2 } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand & Campus indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  SmartCampus
                </span>
                {campus && (
                  <span className="text-[11px] font-medium text-slate-500 block leading-tight truncate max-w-[180px] sm:max-w-xs">
                    {campus.name}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('home')}
              className={`transition-colors hover:text-slate-900 ${
                currentTab === 'home' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 py-5' : 'py-5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className={`transition-colors hover:text-slate-900 ${
                currentTab === 'browse' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 py-5' : 'py-5'
              }`}
            >
              Browse Resources
            </button>
            {currentUser && (
              <button
                onClick={() => onNavigate('profile')}
                className={`transition-colors hover:text-slate-900 ${
                  currentTab === 'profile' ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600 py-5' : 'py-5'
                }`}
              >
                Profile & Dashboard
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={onOpenAddResource}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell Resource</span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <button
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title="View Profile"
                  >
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-semibold text-xs">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden md:inline-block text-xs font-medium text-slate-700 max-w-[100px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  </button>

                  <button
                    onClick={onLogout}
                    title="Log Out"
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
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
