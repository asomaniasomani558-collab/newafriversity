import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  User as UserIcon,
  LogOut,
  Compass,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronDown,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    user,
    theme,
    toggleTheme,
    setIsAiDrawerOpen,
    setAiSuggestedPrompt,
    notifications,
    markNotificationRead,
    logout,
    setActiveTab,
    setIsOnboardingOpen
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded bg-stone-900 dark:bg-amber-500 text-stone-100 dark:text-stone-950 flex items-center justify-center font-bold text-sm tracking-wider shadow-sm group-hover:bg-amber-600 transition-colors">
              AF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-stone-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  AFRIVERSITY
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60">
                  Africa-First
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                Find · Check · Prepare · Apply · Track
              </p>
            </div>
          </button>
        </div>

        {/* Center / Ask Afriversity AI Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAiSuggestedPrompt('What should I focus on this week for my applications?');
              setIsAiDrawerOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 rounded-md border border-stone-200 dark:border-stone-700 transition-all shadow-2xs hover:shadow-xs group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline text-stone-600 dark:text-stone-300">Ask Afriversity AI</span>
            <span className="md:hidden">Ask AI</span>
            <span className="hidden lg:inline text-[10px] bg-stone-200/70 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-1.5 py-0.5 rounded text-mono font-sans">
              ⌘K
            </span>
          </button>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 px-2 py-1 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-stone-400" />
            <span>Tour</span>
          </button>
        </div>

        {/* Right Actions: Theme Toggle, Notifications & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus:outline-none border border-stone-200/80 dark:border-stone-700/80"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-xs font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600" />
                <span className="hidden sm:inline text-xs font-medium">Dark</span>
              </>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus:outline-none"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-[#FAF9F5] dark:ring-stone-900" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-stone-900 rounded-lg shadow-xl border border-stone-200 dark:border-stone-800 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Notifications & Deadlines
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded font-medium">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      notifications.forEach(n => markNotificationRead(n.id));
                    }}
                    className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-stone-400 py-6 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.linkAction?.type === 'application') setActiveTab('tracker');
                          if (n.linkAction?.type === 'opportunity') setActiveTab('discover');
                          if (n.linkAction?.type === 'university') setActiveTab('universities');
                          setIsNotifOpen(false);
                        }}
                        className={`p-2.5 rounded text-left transition-colors cursor-pointer ${
                          n.read
                            ? 'bg-stone-50/60 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                            : 'bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-50 dark:hover:bg-amber-950/50 border-l-2 border-amber-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-stone-900 dark:text-stone-100">{n.title}</span>
                          <span className="text-[10px] text-stone-400">{n.date}</span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 pl-2 pr-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
              >
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-none">{user.fullName}</div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 leading-none mt-1">
                    {user.country} · {user.role === 'admin' ? 'Administrator' : user.role === 'mentor' ? 'Mentor' : 'Learner'}
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center font-bold text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-lg shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3.5 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-semibold text-stone-900 dark:text-stone-100">{user.fullName}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Profile {user.profileCompleteness}% Complete
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>My Afriversity Command Center</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 border-t border-stone-100 dark:border-stone-800"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
