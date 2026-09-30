import React from 'react';
import {
  X,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Sparkles,
  Bookmark,
  ArrowRight,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateOpportunityReadiness } from '../../utils/readiness';
import { Opportunity } from '../../types';

interface Props {
  opportunity: Opportunity;
  onClose: () => void;
}

export const OpportunityDetailModal: React.FC<Props> = ({ opportunity, onClose }) => {
  const {
    user,
    savedOpportunityIds,
    toggleSaveOpportunity,
    applications,
    updateApplicationStage,
    toggleChecklistItem,
    recordPortalVisit,
    askAiAboutOpportunity,
    setActiveTab
  } = useApp();

  const isSaved = savedOpportunityIds.includes(opportunity.id);
  const application = applications.find(a => a.opportunityId === opportunity.id);

  const completedIds = application
    ? application.checklist.filter(c => c.completed).map(c => c.id)
    : [];

  const readiness = user
    ? calculateOpportunityReadiness(opportunity, user, completedIds)
    : {
        opportunityId: opportunity.id,
        readinessStatus: 'PARTIALLY_READY' as const,
        readinessScore: 65,
        matchScore: 80,
        matchedReasons: ['Academic background aligns with requirements'],
        missingItems: [],
        recommendedNextStep: 'Sign in to generate full personalized checklist.'
      };

  const checklistItems = application?.checklist && application.checklist.length > 0
    ? application.checklist
    : readiness.missingItems;

  const totalChecklist = checklistItems.length;
  const completedChecklist = checklistItems.filter(i => i.completed).length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedChecklist / totalChecklist) * 100) : 0;

  const handleApplyClick = () => {
    recordPortalVisit(opportunity.id);
    updateApplicationStage(opportunity.id, 'applied');
    window.open(opportunity.application_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 w-full max-w-3xl rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between gap-4 bg-[#FAF9F5]/70 dark:bg-stone-900/90">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Unboxed metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="font-bold text-stone-900 dark:text-white">{opportunity.organization}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{opportunity.type}</span>
              <span aria-hidden="true">·</span>
              <span>{opportunity.location}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{opportunity.funding}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-snug">
              {opportunity.title}
            </h1>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200 text-xs sm:text-sm">
          {/* Match & Readiness Command Banner */}
          <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-lg p-4 sm:p-5 space-y-3 border border-stone-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  {readiness.matchScore}% MATCH
                </span>
                <span className="text-xs text-stone-300">
                  Status:{' '}
                  <strong className="text-white">
                    {readiness.readinessStatus === 'READY'
                      ? 'Ready to Apply'
                      : readiness.readinessStatus === 'PARTIALLY_READY'
                      ? 'Partially Ready (Items Missing)'
                      : 'Preparation Needed'}
                  </strong>
                </span>
              </div>

              <div className="text-xs font-mono text-stone-400">
                Checklist: {completedChecklist}/{totalChecklist} ({progressPercent}%)
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Why it matches list */}
            <div className="text-xs text-stone-300 pt-1 space-y-1">
              <div className="text-[11px] font-semibold uppercase text-stone-400 tracking-wider">
                Why this matches your student profile
              </div>
              {readiness.matchedReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-stone-200">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Application Checklist */}
          <div className="space-y-3 bg-stone-50/70 dark:bg-stone-850/60 p-4 sm:p-5 rounded-lg border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-white text-sm tracking-tight">
                  Application Readiness Checklist
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Tick off documents and tasks as you prepare them before visiting the official portal.
                </p>
              </div>

              <button
                onClick={() => {
                  askAiAboutOpportunity(opportunity);
                  onClose();
                }}
                className="text-xs font-medium text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Ask AI to review checklist</span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {checklistItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(opportunity.id, item.id)}
                  className={`p-3 rounded-md border flex items-start gap-3 transition-colors cursor-pointer ${
                    item.completed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
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

          {/* Description & Overview */}
          <div className="space-y-2">
            <h3 className="font-bold text-stone-900 dark:text-white text-sm tracking-tight">Overview</h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              {opportunity.description}
            </p>
          </div>

          {/* Key Requirements and Academic Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 bg-white dark:bg-stone-800/80 p-3.5 rounded-lg border border-stone-200 dark:border-stone-700">
              <h4 className="font-semibold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
                Eligibility Requirements
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                {opportunity.requirements.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-1.5">
                    <span className="text-stone-400 mt-0.5">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 bg-white dark:bg-stone-800/80 p-3.5 rounded-lg border border-stone-200 dark:border-stone-700">
              <h4 className="font-semibold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
                Academic & Financial Terms
              </h4>
              <div className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                <div>
                  <strong className="text-stone-900 dark:text-white">Academic Standing:</strong>{' '}
                  {opportunity.academic_requirements}
                </div>
                <div>
                  <strong className="text-stone-900 dark:text-white">Funding / Stipend:</strong>{' '}
                  {opportunity.salary_or_stipend || opportunity.funding}
                </div>
                <div>
                  <strong className="text-stone-900 dark:text-white">Application Fee:</strong>{' '}
                  {opportunity.application_fee}
                </div>
                <div>
                  <strong className="text-stone-900 dark:text-white">Eligible Countries:</strong>{' '}
                  {opportunity.eligible_countries.slice(0, 5).join(', ')}
                  {opportunity.eligible_countries.length > 5 ? ' + more' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Source Verification Banner */}
          <div className="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                Verified Source: <strong className="text-stone-900 dark:text-white">{opportunity.official_source}</strong> ({opportunity.last_verified_date})
              </span>
            </div>

            <a
              href={opportunity.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white underline flex items-center gap-1 font-medium"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Footer CTAs */}
        <div className="p-4 sm:p-5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveOpportunity(opportunity.id)}
              className={`px-3 py-2 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-700 dark:fill-amber-400' : ''}`} />
              <span>{isSaved ? 'Saved in Tracker' : 'Save for Later'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('cv-assistant');
                onClose();
              }}
              className="px-3 py-2 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              <span>Tailor CV for this Opp</span>
            </button>
          </div>

          {/* Official Apply Action */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyClick}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-md transition-colors shadow-sm flex items-center gap-2"
            >
              <span>Apply Officially on {opportunity.organization}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
