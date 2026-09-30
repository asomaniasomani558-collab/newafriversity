import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Kanban,
  GraduationCap,
  FileText,
  Mic,
  BookOpen,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  Shield,
  Sun,
  Moon,
  School,
  Sparkles,
  Users,
  Briefcase,
  BarChart3,
  KeyRound,
  Lock,
  Video
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminActiveTab } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    adminActiveTab,
    setAdminActiveTab,
    applications,
    menteeReviews,
    interviewRequests,
    platformUsers,
    opportunities,
    auditLogs,
    user,
    theme,
    toggleTheme
  } = useApp();

  const isAdmin = user?.role === 'admin';
  const isMentor = user?.role === 'mentor';
  const isSHS = user?.academicLevel === 'secondary';

  const preparingCount = applications.filter(a => a.stage === 'preparing').length;
  const pendingMentorReviewsCount = menteeReviews.filter(r => r.status === 'pending').length;
  const pendingInterviewRequestsCount = interviewRequests.filter(r => r.status === 'pending').length;
  const assignedMenteesCount = new Set(menteeReviews.map(r => r.studentEmail)).size;

  // 1. ADMIN NAVIGATION ITEMS (100% Admin Related)
  const adminNavItems = [
    {
      id: 'admin-dashboard',
      adminTabId: 'dashboard' as AdminActiveTab,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      id: 'admin-users',
      adminTabId: 'users' as AdminActiveTab,
      label: 'User Oversight',
      icon: Users,
      badge: `${platformUsers.length}`
    },
    {
      id: 'admin-opps',
      adminTabId: 'opportunities' as AdminActiveTab,
      label: 'Opportunity Governance',
      icon: Briefcase,
      badge: `${opportunities.length}`
    },
    {
      id: 'admin-analytics',
      adminTabId: 'analytics' as AdminActiveTab,
      label: 'Platform Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'admin-audit',
      adminTabId: 'audit' as AdminActiveTab,
      label: 'Audit Trail & Logs',
      icon: FileText,
      badge: `${auditLogs.length}`
    },
    {
      id: 'admin-settings',
      adminTabId: 'settings' as AdminActiveTab,
      label: 'Master Credentials & Security',
      icon: KeyRound,
      badge: 'Admin'
    }
  ];

  // 2. MENTOR NAVIGATION ITEMS (University programs & Mentorship hub removed as requested)
  const mentorNavItems = [
    {
      id: 'dashboard',
      label: 'Advisory Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'tracker',
      label: 'Mentee Review Queue',
      icon: Kanban,
      badge: pendingMentorReviewsCount > 0 ? `${pendingMentorReviewsCount} pending` : '0 pending'
    },
    {
      id: 'discover',
      label: 'Opportunity Catalog',
      icon: Compass,
      badge: 'Verified'
    },
    {
      id: 'cv-assistant',
      label: 'Mentee CV & Statements',
      icon: FileText,
      badge: 'Review'
    },
    {
      id: 'interview',
      label: 'Live Student Interviews',
      icon: Mic,
      badge: pendingInterviewRequestsCount > 0 ? `${pendingInterviewRequestsCount} req` : 'Studio'
    },
    {
      id: 'profile',
      label: 'Mentor Profile & Desk',
      icon: UserCheck,
      badge: user ? `${user.profileCompleteness}%` : null
    }
  ];

  // 3. STUDENT NAVIGATION ITEMS
  const studentNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'discover',
      label: 'Opportunity Discovery',
      icon: Compass,
      badge: 'Verified'
    },
    {
      id: 'tracker',
      label: 'My Opportunities & Tracker',
      icon: Kanban,
      badge: preparingCount > 0 ? `${preparingCount} active` : null
    },
    {
      id: 'universities',
      label: 'University Discovery',
      icon: GraduationCap,
      badge: null
    },
    {
      id: 'cv-assistant',
      label: 'CV Assistant',
      icon: FileText,
      badge: 'AI'
    },
    {
      id: 'interview',
      label: 'Mock Interview Studio',
      icon: Mic,
      badge: 'STAR'
    },
    {
      id: 'learning',
      label: 'Learning Hub',
      icon: BookOpen,
      badge: 'Gaps'
    },
    {
      id: 'profile',
      label: 'My Afriversity',
      icon: UserCheck,
      badge: user ? `${user.profileCompleteness}%` : null
    }
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 hidden md:flex flex-col justify-between bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 p-4 min-h-[calc(100vh-61px)] sticky top-[61px] self-start transition-colors">
      <div className="space-y-4">
        {/* Top Kicker Card - Contextual for Admin vs Mentor vs Student */}
        {isAdmin ? (
          <div className="p-3 bg-gradient-to-br from-amber-500/10 via-stone-100 to-amber-500/5 dark:from-amber-950/40 dark:via-stone-900 dark:to-amber-950/20 rounded-xl border border-amber-300/80 dark:border-amber-700/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-stone-900 dark:bg-amber-500 text-amber-400 dark:text-stone-950 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-stone-900 dark:text-white">
                    Admin Portal
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    Master Console
                  </div>
                </div>
              </div>
              <span className="text-[9px] bg-amber-500 text-stone-950 font-bold px-1.5 py-0.5 rounded font-mono">
                Superuser
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono border-t border-amber-300/60 dark:border-amber-800/40 text-center">
              <div className="bg-white/80 dark:bg-stone-800/80 p-1 rounded">
                <span className="text-stone-500 dark:text-stone-400 block text-[9px]">USERS</span>
                <strong className="text-stone-900 dark:text-white">{platformUsers.length}</strong>
              </div>
              <div className="bg-white/80 dark:bg-stone-800/80 p-1 rounded">
                <span className="text-stone-500 dark:text-stone-400 block text-[9px]">OPPS</span>
                <strong className="text-emerald-700 dark:text-emerald-400">{opportunities.length}</strong>
              </div>
              <div className="bg-white/80 dark:bg-stone-800/80 p-1 rounded">
                <span className="text-stone-500 dark:text-stone-400 block text-[9px]">LOGS</span>
                <strong className="text-amber-700 dark:text-amber-400">{auditLogs.length}</strong>
              </div>
            </div>

            <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between font-mono px-0.5">
              <span>AUDIT</span>
              <span>·</span>
              <span>COMPLIANCE</span>
              <span>·</span>
              <span>SECURITY</span>
            </div>
          </div>
        ) : isMentor ? (
          <div className="p-3 bg-gradient-to-br from-amber-50 to-stone-50 dark:from-amber-950/30 dark:to-stone-900 rounded-xl border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs shadow-2xs">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-extrabold text-stone-900 dark:text-white">
                    Mentor Desk
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                    Faculty Advisor
                  </div>
                </div>
              </div>
              <span className="text-[9px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded font-mono">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-mono border-t border-amber-200/60 dark:border-amber-900/40">
              <div className="bg-white/80 dark:bg-stone-800/80 px-2 py-1 rounded text-stone-600 dark:text-stone-300">
                Mentees: <strong className="text-stone-900 dark:text-white">{assignedMenteesCount}</strong>
              </div>
              <div className="bg-white/80 dark:bg-stone-800/80 px-2 py-1 rounded text-stone-600 dark:text-stone-300">
                Pending: <strong className="text-amber-700 dark:text-amber-400">{pendingMentorReviewsCount}</strong>
              </div>
            </div>

            <div className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center justify-between font-mono px-0.5">
              <span>DISCOVER</span>
              <span>→</span>
              <span>REVIEW CV</span>
              <span>→</span>
              <span>LIVE MOCK</span>
            </div>
          </div>
        ) : (
          <div className="px-2 pt-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-between">
              <span>Student Opportunity Loop</span>
              {isSHS && (
                <span className="text-[9px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded font-mono font-semibold">
                  SHS / WASSCE
                </span>
              )}
            </div>
            <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1 font-mono">
              <span>FIND</span>
              <span className="text-stone-300 dark:text-stone-700">→</span>
              <span>CHECK</span>
              <span className="text-stone-300 dark:text-stone-700">→</span>
              <span>PREPARE</span>
              <span className="text-stone-300 dark:text-stone-700">→</span>
              <span>APPLY</span>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-1">
          {isAdmin ? (
            /* Admin Nav List */
            adminNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === 'admin' && adminActiveTab === item.adminTabId;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab('admin');
                    setAdminActiveTab(item.adminTabId);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-stone-900 dark:bg-amber-500 text-stone-100 dark:text-stone-950 shadow-2xs font-bold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/90 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400 dark:text-stone-950' : 'text-stone-400 dark:text-stone-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        isActive
                          ? 'bg-stone-800 dark:bg-amber-400 text-amber-300 dark:text-stone-950 font-bold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : isMentor ? (
            /* Mentor Nav List */
            mentorNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-stone-900 dark:bg-stone-800 text-stone-100 dark:text-white shadow-2xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/90 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        isActive
                          ? 'bg-stone-800 dark:bg-stone-700 text-amber-300 font-semibold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            /* Student Nav List */
            studentNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-stone-900 dark:bg-stone-800 text-stone-100 dark:text-white shadow-2xs font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100/90 dark:hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400 dark:text-stone-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        isActive
                          ? 'bg-stone-800 dark:bg-stone-700 text-amber-300 font-semibold'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* Bottom Section: Dedicated Light/Dark Toggle & Trust Policy */}
      <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
        {/* Sidebar Light / Dark Mode Toggle Widget */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1">
            <span>Theme Mode</span>
            <span className="font-mono capitalize text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              {theme}
            </span>
          </div>

          <div className="grid grid-cols-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 gap-1">
            <button
              type="button"
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                theme === 'light'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
              aria-pressed={theme === 'light'}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              type="button"
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-md transition-all ${
                theme === 'dark'
                  ? 'bg-stone-900 text-amber-400 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white'
              }`}
              aria-pressed={theme === 'dark'}
            >
              <Moon className="w-3.5 h-3.5 text-amber-400" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Trust & Verification Footer */}
        <div className="px-1 pt-2 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold text-[11px]">
              {isAdmin
                ? 'Superuser System Clearance'
                : isMentor
                ? 'Faculty Advisory Standards'
                : 'Strict Verification Policy'}
            </span>
          </div>
          <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed">
            {isAdmin
              ? 'Administrator session active. Master mutations and role modifications are cryptographically audited.'
              : isMentor
              ? 'Zero fabricated endorsements. Mentors evaluate authentic student submissions, annotate CV drafts, and conduct live mock interviews.'
              : 'Zero fabricated links. Applications are submitted strictly through official institutional portals.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
