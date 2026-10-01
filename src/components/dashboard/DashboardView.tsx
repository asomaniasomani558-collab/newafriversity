import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Users,
  Award,
  FileCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VERIFIED_OPPORTUNITIES } from '../../data/opportunities';
import { calculateOpportunityReadiness } from '../../utils/readiness';
import { Opportunity } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    user,
    setActiveTab,
    applications,
    menteeReviews,
    endorseMenteeReview,
    savedOpportunityIds,
    toggleSaveOpportunity,
    setSelectedOpportunity,
    askAiAboutOpportunity,
    setIsAiDrawerOpen,
    setAiSuggestedPrompt,
    mentorTimeSlots,
    interviewRequests
  } = useApp();

  const isMentor = user?.role === 'mentor';
  const [endorsedId, setEndorsedId] = useState<string | null>(null);

  // Compute real mentor metrics reflecting user actions
  const assignedMenteesCount = useMemo(() => {
    return new Set(menteeReviews.map(r => r.studentEmail)).size;
  }, [menteeReviews]);

  const pendingReviewsCount = useMemo(() => {
    return menteeReviews.filter(r => r.status === 'pending').length;
  }, [menteeReviews]);

  const endorsedCount = useMemo(() => {
    return menteeReviews.filter(r => r.status === 'endorsed').length;
  }, [menteeReviews]);

  const mentorCompletionRate = useMemo(() => {
    return menteeReviews.length > 0 ? Math.round((endorsedCount / menteeReviews.length) * 100) : 0;
  }, [endorsedCount, menteeReviews]);

  // Compute recommendations and match scores
  const recommendations = useMemo(() => {
    if (!user) return [];

    return VERIFIED_OPPORTUNITIES.map(opp => {
      const existingApp = applications.find(a => a.opportunityId === opp.id);
      const completedIds = existingApp
        ? existingApp.checklist.filter(c => c.completed).map(c => c.id)
        : [];
      const readiness = calculateOpportunityReadiness(opp, user, completedIds);
      return {
        opportunity: opp,
        readiness
      };
    })
      .sort((a, b) => b.readiness.matchScore - a.readiness.matchScore)
      .slice(0, 4);
  }, [user, applications]);

  // Compute high priority Next Step reflecting real actions
  const nextStepInfo = useMemo(() => {
    if (isMentor) {
      const topPending = menteeReviews.find(r => r.status === 'pending');
      if (topPending) {
        return {
          title: `Review ${topPending.studentName}'s ${topPending.documentTitle}`,
          subtitle: `Required for ${topPending.targetOpp}. Student submitted from ${topPending.institution}.`,
          cta: "Review & Endorse Mentee",
          action: () => {
            setActiveTab('tracker');
          },
          badge: "MENTEE ENDORSEMENT REQUEST"
        };
      }
      return {
        title: "All Mentee Reviews Completed",
        subtitle: `You have successfully evaluated all ${menteeReviews.length} assigned student applications. Outstanding work!`,
        cta: "Open Live Interview Desk",
        action: () => setActiveTab('interview'),
        badge: "QUEUE UP TO DATE"
      };
    }

    // Find active application in 'preparing' or top recommendation
    const activePrep = applications.find(a => a.stage === 'preparing');
    if (activePrep) {
      const pendingItems = activePrep.checklist.filter(c => !c.completed);
      if (pendingItems.length > 0) {
        return {
          title: `Complete ${pendingItems[0].label}`,
          subtitle: `Required for ${activePrep.opportunity.title}. Deadline is approaching on ${activePrep.opportunity.deadline}.`,
          cta: 'Open Application Checklist',
          action: () => {
            setSelectedOpportunity(activePrep.opportunity);
          },
          badge: 'ACTIVE PREPARATION'
        };
      }
    }

    if (recommendations.length > 0) {
      const top = recommendations[0];
      return {
        title: top.readiness.recommendedNextStep,
        subtitle: `For ${top.opportunity.title} (${top.readiness.matchScore}% Match).`,
        cta: 'Check Application Readiness',
        action: () => {
          setSelectedOpportunity(top.opportunity);
        },
        badge: 'TOP MATCHED PRIORITY'
      };
    }

    return {
      title: 'Update your technical projects and portfolio',
      subtitle: 'Adding 1 more verified project increases your readiness score across all engineering internships.',
      cta: 'Update Profile',
      action: () => setActiveTab('profile'),
      badge: 'PROFILE OPTIMIZATION'
    };
  }, [isMentor, applications, recommendations, setSelectedOpportunity, setActiveTab, setAiSuggestedPrompt, setIsAiDrawerOpen]);

  // Upcoming deadlines from saved or active applications
  const upcomingDeadlines = useMemo(() => {
    const list: { title: string; organization: string; deadline: string; daysLeft: number; opp: Opportunity }[] = [];
    const now = new Date('2026-09-27T12:00:00Z');

    VERIFIED_OPPORTUNITIES.forEach(opp => {
      const isSaved = savedOpportunityIds.includes(opp.id);
      const isApplied = applications.some(a => a.opportunityId === opp.id);
      if (isSaved || isApplied || isMentor) {
        const deadDate = new Date(opp.deadline);
        const diffTime = deadDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        list.push({
          title: opp.title,
          organization: opp.organization,
          deadline: opp.deadline,
          daysLeft,
          opp
        });
      }
    });

    return list.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3);
  }, [savedOpportunityIds, applications, isMentor]);

  const firstName = user ? user.fullName.split(' ')[0] : 'Student';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Focused Greeting */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-800 dark:text-amber-400 font-semibold mb-1">
          <span>{isMentor ? 'Mentor Advisory Command Center' : 'Student Opportunity Command Center'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
          Good morning, {firstName}.
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          {isMentor
            ? 'Here are your active mentee submissions, document reviews, and live mock interview sessions.'
            : 'Here is what matters today across your readiness pipeline.'}
        </p>
      </div>

      {/* 2. Focused Next Step Card (Prominent & Clear) */}
      <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-xl p-6 sm:p-7 shadow-sm border border-stone-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-9xl font-bold font-mono">
          AF
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              {nextStepInfo.badge}
            </span>
            <span className="text-xs text-stone-400">· Next priority action</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {nextStepInfo.title}
          </h2>

          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {nextStepInfo.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={nextStepInfo.action}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs sm:text-sm rounded-md transition-colors shadow-sm"
            >
              <span>{nextStepInfo.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setAiSuggestedPrompt(
                  isMentor
                    ? "Suggest key feedback points for student scholarship personal statements"
                    : `How can I best prepare: ${nextStepInfo.title}?`
                );
                setIsAiDrawerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs rounded-md border border-stone-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Ask AI for Guidance</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Pipeline Metrics Bar */}
      {isMentor ? (
        /* Mentor Specific Metric Cards - Real Actual Data Reflecting User Actions */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Assigned Mentees
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1 flex items-baseline justify-between">
              <span>{assignedMenteesCount} Mentees</span>
              <Users className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">KNUST, UG, WASSCE & Ashesi</div>
          </div>

          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Pending Reviews
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-baseline justify-between">
              <span>{pendingReviewsCount} Drafts</span>
              <Clock className="w-4 h-4 text-amber-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Essays & Statements</div>
          </div>

          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Endorsed Letters
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-baseline justify-between">
              <span>{endorsedCount} Endorsed</span>
              <FileCheck className="w-4 h-4 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Verified Recommendations</div>
          </div>

          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Advisory Rate
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1 flex items-baseline justify-between">
              <span>{mentorCompletionRate}%</span>
              <Award className="w-4 h-4 text-amber-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Review completion rate</div>
          </div>
        </div>
      ) : (
        /* Student Specific Metric Cards */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Saved Opportunities
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1 flex items-baseline justify-between">
              <span>{savedOpportunityIds.length}</span>
              <Bookmark className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Reviewing requirements</div>
          </div>

          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Active Preparing
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-baseline justify-between">
              <span>{applications.filter(a => a.stage === 'preparing').length}</span>
              <Clock className="w-4 h-4 text-amber-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Checklists in progress</div>
          </div>

          <div
            onClick={() => setActiveTab('tracker')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Official Submissions
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-baseline justify-between">
              <span>{applications.filter(a => a.stage === 'applied' || a.stage === 'interview').length}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:text-emerald-500 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Tracked via official portal</div>
          </div>

          <div
            onClick={() => setActiveTab('profile')}
            className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Profile Readiness
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1 flex items-baseline justify-between">
              <span>{user?.profileCompleteness || 75}%</span>
              <TrendingUp className="w-4 h-4 text-stone-300 group-hover:text-amber-600 transition-colors" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Completeness score</div>
          </div>
        </div>
      )}

      {/* Mentor Specific: Mentee Review Queue with Real Reflection of User Actions */}
      {isMentor && (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">Active Mentee Submissions Awaiting Endorsement</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">Provide structured guidance before official portal submission.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {pendingReviewsCount} Pending
              </span>
              <button
                onClick={() => setActiveTab('tracker')}
                className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold"
              >
                View Full Queue →
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {menteeReviews.map(mentee => (
              <div
                key={mentee.id}
                className="p-3.5 bg-stone-50/70 dark:bg-stone-800/60 rounded-md border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <strong className="text-stone-900 dark:text-white font-bold">{mentee.studentName}</strong>
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-600 dark:text-stone-300">{mentee.institution}</span>
                    {mentee.status === 'endorsed' && (
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded font-mono">
                        ✓ Endorsed
                      </span>
                    )}
                    {mentee.status === 'changes_requested' && (
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-1.5 py-0.2 rounded font-mono">
                        Revisions Requested
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-800 dark:text-stone-200 font-medium">
                    Target: <span className="text-amber-800 dark:text-amber-400 font-semibold">{mentee.targetOpp}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Document: {mentee.documentTitle} ({mentee.status === 'endorsed' ? `Endorsed ${mentee.endorsementDate || 'recently'}` : 'Draft Submitted for Review'})
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  {mentee.status === 'endorsed' ? (
                    <span className="px-3 py-1.5 text-xs font-bold rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Endorsement Signed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        endorseMenteeReview(mentee.id, 'Official mentor review completed with strong faculty endorsement.');
                        setEndorsedId(mentee.id);
                        setTimeout(() => setEndorsedId(null), 3000);
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white shadow-2xs"
                    >
                      <span>Review & Endorse</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Highly Relevant Section: Live Interview Studio for Mentors, Opportunities for Students */}
      {isMentor ? (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white tracking-tight">
                Live 1-on-1 Student Mock Interviews & Calendar
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Active student interview requests and scheduled slots (Standard Session Fee: ₵30 GHS).
              </p>
            </div>
            <button
              onClick={() => setActiveTab('interview')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Calendar & Studio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mentorTimeSlots.slice(0, 4).map(slot => (
              <div
                key={slot.id}
                className="p-4 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                      {slot.interviewType} Interview
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      ₵{slot.feeGhs || 30} GHS
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                    {slot.date} at {slot.startTime} GMT ({slot.durationMinutes} mins)
                  </h4>
                  {slot.bookedByStudentName ? (
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      Booked by: <strong className="text-stone-900 dark:text-white">{slot.bookedByStudentName}</strong>
                      <div className="text-[11px] text-stone-400 truncate">Target: {slot.targetOpportunity}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                      ✓ Published and open for student booking
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-stone-400">
                    Status: <strong className="capitalize text-stone-700 dark:text-stone-300">{slot.status}</strong>
                  </span>
                  <button
                    onClick={() => setActiveTab('interview')}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{slot.status === 'booked' ? 'Launch Live Studio' : 'Edit Slot'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white tracking-tight">
                Recommended for your profile
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Ranked by academic match, eligibility verification, and current readiness.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('discover')}
              className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View all opportunities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(({ opportunity: opp, readiness }) => {
              const isSaved = savedOpportunityIds.includes(opp.id);
              const pendingMissingCount = readiness.missingItems.filter(i => !i.completed).length;

              return (
                <div
                  key={opp.id}
                  className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200/90 dark:border-stone-800 p-5 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-3">
                    {/* Clean unboxed metadata header */}
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="text-stone-900 dark:text-white font-semibold">{opp.organization}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{opp.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{opp.country}</span>
                      </div>

                      <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                        {readiness.matchScore}% MATCH
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setSelectedOpportunity(opp)}
                      className="font-bold text-stone-900 dark:text-white text-base leading-snug hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      {opp.title}
                    </h3>

                    {/* Explainable Why it matches */}
                    <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 bg-stone-50 dark:bg-stone-800/60 p-2.5 rounded border border-stone-100 dark:border-stone-700/60">
                      <div className="font-semibold text-stone-700 dark:text-stone-300 text-[11px] uppercase tracking-wider">
                        Why it matches target students
                      </div>
                      {readiness.matchedReasons.slice(0, 2).map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-200">
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">✓</span>
                          <span className="leading-tight">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Readiness Status breakdown */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500 dark:text-stone-400">Readiness:</span>
                        <span
                          className={`font-semibold text-xs ${
                            readiness.readinessStatus === 'READY'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : readiness.readinessStatus === 'PARTIALLY_READY'
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {readiness.readinessStatus === 'READY'
                            ? 'Ready to Apply'
                            : readiness.readinessStatus === 'PARTIALLY_READY'
                            ? `Partially Ready (${readiness.readinessScore}%)`
                            : `Preparation Needed (${readiness.readinessScore}%)`}
                        </span>
                      </div>

                      {pendingMissingCount > 0 ? (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          {pendingMissingCount} item{pendingMissingCount > 1 ? 's' : ''} missing
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">All items ready</span>
                      )}
                    </div>
                  </div>

                  {/* Footer CTAs */}
                  <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>Deadline: {opp.deadline}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveOpportunity(opp.id)}
                        className={`p-1.5 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors ${
                          isSaved ? 'text-amber-600 dark:text-amber-400' : ''
                        }`}
                        title={isSaved ? 'Saved in My Opportunities' : 'Save opportunity'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={() => setSelectedOpportunity(opp)}
                        className="px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white rounded transition-colors shadow-2xs"
                      >
                        Check Readiness
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Two-column bottom section: Workspaces / Deadlines (for students only) */}
      {!isMentor && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deadlines list */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200/90 dark:border-stone-800 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Upcoming Opportunity Deadlines</span>
              </h3>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">Tracked items</span>
            </div>

            <div className="space-y-2.5 pt-1">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-stone-400 dark:text-stone-500 py-3 text-center">
                  Save opportunities to track critical deadlines.
                </p>
              ) : (
                upcomingDeadlines.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedOpportunity(item.opp)}
                    className="p-3 rounded-md bg-stone-50/70 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">{item.organization}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {item.daysLeft > 0 ? `${item.daysLeft} days left` : 'Due today'}
                      </div>
                      <div className="text-[10px] text-stone-400 dark:text-stone-500">{item.deadline}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Official Source Transparency Note */}
          <div className="bg-stone-50 dark:bg-stone-900/60 rounded-lg border border-stone-200/80 dark:border-stone-800 p-5 flex flex-col justify-between space-y-3 shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-900 dark:text-white font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Traceable Data & Official Portals</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Afriversity operates with strict zero-hallucination verification. Every scholarship, university admission, and internship connects directly to its official external application portal.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/60 dark:border-stone-800">
              <span>Official university & company links</span>
              <button
                onClick={() => setActiveTab('universities')}
                className="text-stone-800 dark:text-stone-200 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Explore Universities</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
