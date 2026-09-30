import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { OpportunityDiscoveryView } from './components/opportunities/OpportunityDiscoveryView';
import { ApplicationTrackerView } from './components/tracker/ApplicationTrackerView';
import { UniversityDiscoveryView } from './components/universities/UniversityDiscoveryView';
import { CvAssistantView } from './components/cv/CvAssistantView';
import { MockInterviewView } from './components/interview/MockInterviewView';
import { LearningHubView } from './components/learning/LearningHubView';
import { MyAfriversityView } from './components/profile/MyAfriversityView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { OpportunityDetailModal } from './components/opportunities/OpportunityDetailModal';
import { AfriversityAssistantDrawer } from './components/ai/AfriversityAssistantDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { MentorOnboardingModal } from './components/onboarding/MentorOnboardingModal';
import {
  LayoutDashboard,
  Compass,
  Kanban,
  GraduationCap,
  FileText,
  Mic,
  BookOpen,
  UserCheck,
  Shield
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedOpportunity,
    setSelectedOpportunity,
    setIsAiDrawerOpen,
    setIsOnboardingOpen,
    setIsMentorOnboardingOpen,
    user
  } = useApp();

  // Prompt onboarding form for students on login or registration if not yet completed
  useEffect(() => {
    if (user && user.role === 'student') {
      const isCompleted = user.onboardingCompleted || localStorage.getItem(`afriversity_onboarding_completed_${user.id}`) === 'true';
      if (!isCompleted) {
        setIsOnboardingOpen(true);
      }
    } else if (user && user.role === 'mentor') {
      const isCompleted = user.onboardingCompleted || localStorage.getItem(`afriversity_mentor_onboarding_completed_${user.id}`) === 'true';
      if (!isCompleted) {
        setIsMentorOnboardingOpen(true);
      }
    }
  }, [user, setIsOnboardingOpen, setIsMentorOnboardingOpen]);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsAiDrawerOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAiDrawerOpen]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors">
      <Header />

      <div className="flex-1 flex w-full">
        <Sidebar />

        <main className="flex-1 min-w-0 py-6 px-4 sm:px-6 lg:px-10 pb-20 md:pb-12 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'discover' && <OpportunityDiscoveryView />}
            {activeTab === 'tracker' && <ApplicationTrackerView />}
            {activeTab === 'universities' && <UniversityDiscoveryView />}
            {activeTab === 'cv-assistant' && <CvAssistantView />}
            {activeTab === 'interview' && <MockInterviewView />}
            {activeTab === 'learning' && <LearningHubView />}
            {activeTab === 'profile' && <MyAfriversityView />}
            {activeTab === 'admin' && (user?.role === 'admin' ? <AdminPortalView /> : <DashboardView />)}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 py-1.5 px-3 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'discover', label: 'Discover', icon: Compass },
          { id: 'interview', label: 'Interview', icon: Mic },
          { id: 'tracker', label: 'Tracker', icon: Kanban },
          { id: 'profile', label: 'Profile', icon: UserCheck }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-[10px] font-medium py-1 px-2 rounded ${
                isActive ? 'text-stone-950 dark:text-white font-bold' : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Global Modals & Drawers */}
      {selectedOpportunity && (
        <OpportunityDetailModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
        />
      )}

      <AfriversityAssistantDrawer />
      <AuthModal />
      <OnboardingModal />
      <MentorOnboardingModal />
    </div>
  );
};

const RootApp: React.FC = () => {
  const { user } = useApp();

  // Authentication page comes before everything
  if (!user) {
    return <AuthPage />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <RootApp />
    </AppProvider>
  );
}
