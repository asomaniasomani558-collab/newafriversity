import React, { useState } from 'react';
import {
  Kanban,
  ListFilter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Trash2,
  UserCheck,
  Award,
  MessageSquare,
  Check,
  X,
  Search,
  FileCheck,
  Send,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStage, StudentApplication, MenteeReviewItem } from '../../types';

export const ApplicationTrackerView: React.FC = () => {
  const {
    user,
    applications,
    menteeReviews,
    endorseMenteeReview,
    requestReviewChanges,
    updateApplicationStage,
    toggleChecklistItem,
    updateApplicationNotes,
    setSelectedOpportunity,
    setActiveTab,
    recordPortalVisit
  } = useApp();

  const isMentor = user?.role === 'mentor';

  // Student view state
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  // Mentor view state
  const [mentorFilter, setMentorFilter] = useState<'all' | 'pending' | 'endorsed' | 'changes_requested'>('all');
  const [mentorSearch, setMentorSearch] = useState('');
  const [activeReviewModal, setActiveReviewModal] = useState<MenteeReviewItem | null>(null);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const stages: { id: ApplicationStage; label: string; description: string }[] = [
    { id: 'saved', label: 'Saved', description: 'Reviewing requirements' },
    { id: 'preparing', label: 'Preparing', description: 'Checklist in progress' },
    { id: 'applied', label: 'Applied', description: 'Submitted on official portal' },
    { id: 'interview', label: 'Interview', description: 'Interview scheduled' },
    { id: 'accepted', label: 'Outcome', description: 'Accepted / Decision' }
  ];

  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];

  const handleApplyClick = (app: StudentApplication) => {
    recordPortalVisit(app.opportunityId);
    updateApplicationStage(app.opportunityId, 'applied');
    window.open(app.officialPortalUrl, '_blank', 'noopener,noreferrer');
  };

  // MENTOR REVIEW DESK VIEW
  if (isMentor) {
    const totalReviews = menteeReviews.length;
    const pendingReviews = menteeReviews.filter(r => r.status === 'pending');
    const endorsedReviews = menteeReviews.filter(r => r.status === 'endorsed');
    const revisionReviews = menteeReviews.filter(r => r.status === 'changes_requested');
    const assignedMentees = new Set(menteeReviews.map(r => r.studentEmail)).size;

    const filteredReviews = menteeReviews.filter(r => {
      if (mentorFilter !== 'all' && r.status !== mentorFilter) return false;
      if (mentorSearch) {
        const q = mentorSearch.toLowerCase();
        return (
          r.studentName.toLowerCase().includes(q) ||
          r.institution.toLowerCase().includes(q) ||
          r.targetOpp.toLowerCase().includes(q) ||
          r.documentTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const handleOpenReviewModal = (item: MenteeReviewItem) => {
      setActiveReviewModal(item);
      setFeedbackInput(item.feedbackNotes || '');
      setFeedbackSuccess(null);
      setModalError(null);
    };

    const handleEndorse = (item: MenteeReviewItem) => {
      setModalError(null);
      endorseMenteeReview(item.id, feedbackInput || 'Approved and officially endorsed by faculty advisor.');
      setFeedbackSuccess('Mentee application draft successfully endorsed!');
      setTimeout(() => {
        setActiveReviewModal(null);
        setFeedbackSuccess(null);
      }, 1500);
    };

    const handleRequestRevision = (item: MenteeReviewItem) => {
      if (!feedbackInput.trim()) {
        setModalError('Please specify the revision guidance for the mentee before requesting revisions.');
        return;
      }
      setModalError(null);
      requestReviewChanges(item.id, feedbackInput.trim());
      setFeedbackSuccess('Revision request dispatched to student.');
      setTimeout(() => {
        setActiveReviewModal(null);
        setFeedbackSuccess(null);
      }, 1500);
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
              Faculty & Mentor Advisory Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
              Mentee Review Queue & Endorsements
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
              Evaluate assigned African student essays, academic CVs, and statements before official institutional portal submission.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('discover')}
              className="px-3.5 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Browse Catalog Opps</span>
            </button>
          </div>
        </div>

        {/* 4 Real Metric Summary Cards reflecting user actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 shadow-2xs">
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Assigned Students
            </div>
            <div className="text-2xl font-bold text-stone-900 dark:text-white mt-1 flex items-baseline justify-between font-mono">
              <span>{assignedMentees} Mentees</span>
              <Users className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Across 4 African institutions</div>
          </div>

          <div
            onClick={() => setMentorFilter('pending')}
            className={`p-4 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
              mentorFilter === 'pending'
                ? 'bg-amber-50/60 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Awaiting Review
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1 flex items-baseline justify-between font-mono">
              <span>{pendingReviews.length} Submissions</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Ready for evaluation</div>
          </div>

          <div
            onClick={() => setMentorFilter('endorsed')}
            className={`p-4 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
              mentorFilter === 'endorsed'
                ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Signed Endorsements
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-baseline justify-between font-mono">
              <span>{endorsedReviews.length} Completed</span>
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Verified letters attached</div>
          </div>

          <div
            onClick={() => setMentorFilter('changes_requested')}
            className={`p-4 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
              mentorFilter === 'changes_requested'
                ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
            }`}
          >
            <div className="text-[11px] font-medium text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Revisions Requested
            </div>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-400 mt-1 flex items-baseline justify-between font-mono">
              <span>{revisionReviews.length} In Revision</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">Student feedback pending</div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-3.5 rounded-lg border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: `All (${totalReviews})` },
              { id: 'pending', label: `Pending (${pendingReviews.length})` },
              { id: 'endorsed', label: `Endorsed (${endorsedReviews.length})` },
              { id: 'changes_requested', label: `Revisions (${revisionReviews.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setMentorFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  mentorFilter === tab.id
                    ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={mentorSearch}
              onChange={e => setMentorSearch(e.target.value)}
              placeholder="Search student or target opp..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="bg-white dark:bg-stone-900 p-8 rounded-lg border border-stone-200 dark:border-stone-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">No submissions matching filter</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">All submissions in this category have been processed.</p>
            </div>
          ) : (
            filteredReviews.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 shadow-2xs space-y-3.5 transition-all hover:border-stone-300 dark:hover:border-stone-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                        {item.studentName}
                      </span>
                      <span className="text-stone-300 dark:text-stone-700">·</span>
                      <span className="text-xs text-stone-600 dark:text-stone-300">{item.institution}</span>
                      <span className="text-stone-300 dark:text-stone-700">·</span>
                      <span className="text-xs text-stone-500 dark:text-stone-400">{item.programme}</span>
                    </div>

                    <div className="text-xs text-stone-700 dark:text-stone-300">
                      Target Opportunity:{' '}
                      <strong className="text-amber-800 dark:text-amber-400 font-semibold">{item.targetOpp}</strong>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <FileText className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.documentTitle}</span>
                      <span className="text-stone-300 dark:text-stone-700">·</span>
                      <span>Submitted on {item.submittedDate}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {item.status === 'endorsed' ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Endorsed ({item.endorsementDate || 'Signed'})</span>
                      </span>
                    ) : item.status === 'changes_requested' ? (
                      <span className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-mono text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Revisions Requested</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Awaiting Review</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback Notes Display if available */}
                {item.feedbackNotes && (
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-md border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                    <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400">
                      Advisor Endorsement / Feedback Notes:
                    </span>
                    <p className="leading-relaxed">{item.feedbackNotes}</p>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Student Contact: <span className="font-mono text-stone-700 dark:text-stone-300">{item.studentEmail}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReviewModal(item)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                      <span>{item.status === 'endorsed' ? 'View Endorsement Notes' : 'Review & Provide Feedback'}</span>
                    </button>

                    {item.status !== 'endorsed' && (
                      <button
                        onClick={() => {
                          endorseMenteeReview(item.id, 'Official mentor review completed with strong faculty endorsement.');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Endorse Submission</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Review, Feedback & Endorsement */}
        {activeReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white dark:bg-stone-900 rounded-xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold">
                    Mentee Advisory Review Desk
                  </span>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    {activeReviewModal.studentName} — {activeReviewModal.documentTitle}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveReviewModal(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {feedbackSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{feedbackSuccess}</span>
                </div>
              )}

              {modalError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-xs text-rose-800 dark:text-rose-300 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800 rounded-lg space-y-1.5 border border-stone-200 dark:border-stone-700">
                  <div className="font-semibold text-stone-900 dark:text-white flex items-center justify-between">
                    <span>Target Opportunity</span>
                    <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">{activeReviewModal.targetOpp}</span>
                  </div>
                  <div>Student: <strong>{activeReviewModal.studentName}</strong> ({activeReviewModal.institution})</div>
                  <div>Document: <strong>{activeReviewModal.documentTitle}</strong></div>
                  <div>Submitted on {activeReviewModal.submittedDate}</div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Official Faculty Endorsement & Feedback Notes
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={e => setFeedbackInput(e.target.value)}
                    placeholder="Provide specific feedback or your signed endorsement text for this application..."
                    className="w-full text-xs p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                  />
                  <p className="text-[10px] text-stone-400">
                    Your notes are shared with the mentee and stored in the official audit verification trail.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setActiveReviewModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestRevision(activeReviewModal)}
                  className="px-4 py-2 text-xs font-semibold rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-rose-700 dark:text-rose-400 border border-stone-200 dark:border-stone-700 transition-colors"
                >
                  Request Revisions
                </button>

                <button
                  type="button"
                  onClick={() => handleEndorse(activeReviewModal)}
                  className="px-4 py-2 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Endorsement</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // STUDENT VIEW (original student application pipeline board & list)
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Student Opportunity Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
            My Opportunities & Tracker
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Track your preparation milestones, document checklists, and official external portal submissions.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Pipeline Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Detailed List
            </button>
          </div>

          <button
            onClick={() => setActiveTab('discover')}
            className="px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Opportunity</span>
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-12 text-center space-y-4 shadow-2xs">
          <Clock className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">Your opportunity pipeline is empty</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Discover verified scholarships, internships, and admissions, and save them to track your preparation checklist.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('discover')}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 dark:bg-amber-500 dark:text-stone-950 text-white rounded-md"
          >
            Explore Opportunities
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {stages.map(stage => {
            const stageApps = applications.filter(a => a.stage === stage.id);

            return (
              <div
                key={stage.id}
                className="bg-stone-50/70 dark:bg-stone-900/60 rounded-lg border border-stone-200 dark:border-stone-800 p-3 flex flex-col min-h-[460px] shadow-2xs"
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-200/80 dark:border-stone-800">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      {stage.label}
                    </h3>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500">{stage.description}</p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                    {stageApps.length}
                  </span>
                </div>

                {/* Stage Cards */}
                <div className="space-y-2.5 flex-1">
                  {stageApps.map(app => {
                    const completedCount = app.checklist.filter(c => c.completed).length;
                    const totalCount = app.checklist.length;
                    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                    return (
                      <div
                        key={app.id}
                        className="bg-white dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-800 p-3 shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs transition-all space-y-2.5"
                      >
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[120px]">
                            {app.opportunity.organization}
                          </span>
                          <span className="capitalize text-[10px] text-stone-400 dark:text-stone-500">{app.opportunity.type}</span>
                        </div>

                        <h4
                          onClick={() => setSelectedOpportunity(app.opportunity)}
                          className="font-bold text-xs text-stone-900 dark:text-white leading-snug line-clamp-2 hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          {app.opportunity.title}
                        </h4>

                        {/* Checklist progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                            <span>Checklist</span>
                            <span>{completedCount}/{totalCount} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Deadline */}
                        <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 font-mono pt-1">
                          <span>Due: {app.opportunity.deadline}</span>
                        </div>

                        {/* Stage Mover Selector */}
                        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-1">
                          <select
                            value={app.stage}
                            onChange={e => updateApplicationStage(app.opportunityId, e.target.value as any)}
                            className="text-[11px] bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-1 text-stone-700 dark:text-stone-200 w-full focus:outline-none"
                          >
                            <option value="saved">Move: Saved</option>
                            <option value="preparing">Move: Preparing</option>
                            <option value="applied">Move: Applied</option>
                            <option value="interview">Move: Interview</option>
                            <option value="accepted">Move: Outcome</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed List & Checklist Inspection View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications list on left */}
          <div className="lg:col-span-1 space-y-2.5">
            {applications.map(app => {
              const isSelected = activeApp?.id === app.id;
              const completedCount = app.checklist.filter(c => c.completed).length;

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? 'bg-white dark:bg-stone-900 border-stone-900 dark:border-amber-500 shadow-xs ring-1 ring-stone-900 dark:ring-amber-500'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{app.opportunity.organization}</span>
                    <span className="capitalize font-mono text-[10px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-700 dark:text-stone-300">
                      {app.stage}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-stone-900 dark:text-white leading-snug">
                    {app.opportunity.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <span>{completedCount} of {app.checklist.length} items ready</span>
                    <span className="font-mono text-[11px]">Due: {app.opportunity.deadline}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector on Right */}
          {activeApp && (
            <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    {activeApp.opportunity.organization} · {activeApp.opportunity.location}
                  </div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                    {activeApp.opportunity.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeApp.stage}
                    onChange={e => updateApplicationStage(activeApp.opportunityId, e.target.value as any)}
                    className="text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-1.5 text-stone-800 dark:text-stone-200 font-semibold"
                  >
                    <option value="saved">Stage: Saved</option>
                    <option value="preparing">Stage: Preparing</option>
                    <option value="applied">Stage: Applied</option>
                    <option value="interview">Stage: Interview</option>
                    <option value="accepted">Stage: Accepted / Decision</option>
                  </select>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    Application Checklist & Document Preparation
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    {activeApp.checklist.filter(c => c.completed).length} / {activeApp.checklist.length} Complete
                  </span>
                </div>

                <div className="space-y-2">
                  {activeApp.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(activeApp.opportunityId, item.id)}
                      className={`p-3 rounded-md border flex items-start gap-3 transition-colors cursor-pointer ${
                        item.completed
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                          : 'bg-stone-50/50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs text-stone-900 dark:text-white flex items-center justify-between">
                          <span className={item.completed ? 'line-through text-stone-500 dark:text-stone-400' : ''}>
                            {item.label}
                          </span>
                          {item.completed && (
                            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">READY</span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{item.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Application Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                  Personal Application Notes & Referee Tracking
                </label>
                <textarea
                  value={activeApp.notes}
                  onChange={e => updateApplicationNotes(activeApp.opportunityId, e.target.value)}
                  placeholder="Record referee contact dates, essay draft links, or questions for interview..."
                  rows={3}
                  className="w-full text-xs p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-500"
                />
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedOpportunity(activeApp.opportunity)}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline font-medium"
                >
                  View Full Opportunity Details
                </button>

                <button
                  onClick={() => handleApplyClick(activeApp)}
                  className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
