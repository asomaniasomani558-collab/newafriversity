import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  MapPin,
  Building,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VERIFIED_OPPORTUNITIES } from '../../data/opportunities';
import { calculateOpportunityReadiness } from '../../utils/readiness';
import { OpportunityType } from '../../types';

export const OpportunityDiscoveryView: React.FC = () => {
  const {
    user,
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    setSelectedOpportunity,
    askAiAboutOpportunity,
    applications
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'deadline'>('match');

  const typeOptions = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'scholarship', label: 'Scholarships' },
    { id: 'internship', label: 'Internships' },
    { id: 'admission', label: 'Admissions' },
    { id: 'fellowship', label: 'Fellowships' },
    { id: 'grant', label: 'Grants & Seed Funding' },
    { id: 'training', label: 'Bootcamps & Training' }
  ];

  const countryOptions = [
    { id: 'all', label: 'All Regions' },
    { id: 'Ghana', label: 'Ghana' },
    { id: 'Pan-Africa', label: 'Pan-Africa' },
    { id: 'Nigeria', label: 'Nigeria' },
    { id: 'Kenya', label: 'Kenya' },
    { id: 'South Africa', label: 'South Africa' },
    { id: 'Rwanda', label: 'Rwanda' },
    { id: 'West Africa', label: 'West Africa' }
  ];

  const activeCatalog = opportunities && opportunities.length > 0 ? opportunities : VERIFIED_OPPORTUNITIES;

  const filteredOpportunities = useMemo(() => {
    return activeCatalog.filter(opp => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesOrg = opp.organization.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesField = opp.field.toLowerCase().includes(q);
        const matchesSkills = opp.skills.some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesOrg && !matchesDesc && !matchesField && !matchesSkills) {
          return false;
        }
      }

      // Type
      if (selectedType !== 'all' && opp.type !== selectedType) {
        return false;
      }

      // Country
      if (selectedCountry !== 'all') {
        const isEligible =
          opp.country.toLowerCase() === selectedCountry.toLowerCase() ||
          opp.eligible_countries.some(c => c.toLowerCase() === selectedCountry.toLowerCase()) ||
          opp.eligible_countries.some(c => c.toLowerCase().includes('all'));
        if (!isEligible) return false;
      }

      // Remote
      if (remoteOnly && !opp.remote) {
        return false;
      }

      // Level
      if (selectedLevel !== 'all') {
        if (!opp.education_level.includes('all') && !opp.education_level.includes(selectedLevel as any)) {
          return false;
        }
      }

      return true;
    }).map(opp => {
      const existingApp = applications.find(a => a.opportunityId === opp.id);
      const completedIds = existingApp
        ? existingApp.checklist.filter(c => c.completed).map(c => c.id)
        : [];
      const readiness = user
        ? calculateOpportunityReadiness(opp, user, completedIds)
        : {
            opportunityId: opp.id,
            readinessStatus: 'PARTIALLY_READY' as const,
            readinessScore: 70,
            matchScore: 80,
            matchedReasons: ['Matches standard criteria'],
            missingItems: [],
            recommendedNextStep: 'Log in to view tailored readiness.'
          };

      return {
        opp,
        readiness
      };
    }).sort((a, b) => {
      if (sortBy === 'match') {
        return b.readiness.matchScore - a.readiness.matchScore;
      } else {
        return new Date(a.opp.deadline).getTime() - new Date(b.opp.deadline).getTime();
      }
    });
  }, [searchQuery, selectedType, selectedCountry, remoteOnly, selectedLevel, sortBy, user, applications]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header and Title */}
      <div>
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
          <span>Official Opportunity Catalog</span>
          <span>·</span>
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Traceable Sources
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
          Opportunity Discovery
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Explore verified scholarships, university admissions, internships, and fellowships curated for African students.
        </p>
      </div>

      {/* Search and Main Filters */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, organization, skills (e.g. Python, KNUST, Mastercard, Machine Learning)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-800 transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-500 font-medium"
            >
              {countryOptions.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-500 font-medium"
            >
              <option value="match">Sort: Match %</option>
              <option value="deadline">Sort: Deadline</option>
            </select>
          </div>
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
          {typeOptions.map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedType === t.id
                  ? 'bg-stone-900 dark:bg-amber-500 text-stone-100 dark:text-stone-950 font-bold shadow-2xs'
                  : 'bg-stone-100/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200/70 dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
        <span>Showing {filteredOpportunities.length} verified opportunities</span>
        <span>Every opportunity connects to its official portal</span>
      </div>

      {/* Opportunities List */}
      <div className="space-y-3.5">
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3 shadow-2xs">
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">No opportunities match your filter criteria.</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">Try clearing the search text or selecting "All Opportunities".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCountry('all');
              }}
              className="px-4 py-2 text-xs font-semibold bg-stone-900 dark:bg-amber-500 dark:text-stone-950 text-white rounded-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredOpportunities.map(({ opp, readiness }) => {
            const isSaved = savedOpportunityIds.includes(opp.id);
            const pendingMissingCount = readiness.missingItems.filter(i => !i.completed).length;

            return (
              <div
                key={opp.id}
                className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs transition-all space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Unboxed Metadata row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="font-semibold text-stone-900 dark:text-white">{opp.organization}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{opp.type}</span>
                      <span aria-hidden="true">·</span>
                      <span>{opp.country}</span>
                      {opp.remote && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-700 dark:text-indigo-400 font-medium">Remote Option</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="text-stone-700 dark:text-stone-300 font-medium">{opp.funding}</span>
                    </div>

                    <h2
                      onClick={() => setSelectedOpportunity(opp)}
                      className="text-lg font-bold text-stone-900 dark:text-white hover:text-amber-800 dark:hover:text-amber-400 transition-colors cursor-pointer leading-snug"
                    >
                      {opp.title}
                    </h2>

                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  {/* Match & Readiness Badge */}
                  <div className="text-left sm:text-right shrink-0 space-y-1">
                    <div className="inline-block font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                      {readiness.matchScore}% MATCH
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Readiness: <strong className="text-stone-800 dark:text-stone-200">{readiness.readinessScore}%</strong>
                    </div>
                  </div>
                </div>

                {/* Why it matches & Missing readiness summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-stone-50 dark:bg-stone-800/60 p-3 rounded-md border border-stone-100 dark:border-stone-700/60">
                  <div>
                    <div className="font-semibold text-stone-700 dark:text-stone-300 text-[11px] uppercase tracking-wider mb-1">
                      Why this fits your profile
                    </div>
                    {readiness.matchedReasons.slice(0, 2).map((reason, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-stone-600 dark:text-stone-300">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="font-semibold text-stone-700 dark:text-stone-300 text-[11px] uppercase tracking-wider mb-1">
                      Readiness Checklist Status
                    </div>
                    {pendingMissingCount > 0 ? (
                      <div className="space-y-1 text-stone-600 dark:text-stone-300">
                        <div className="text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{pendingMissingCount} requirement{pendingMissingCount > 1 ? 's' : ''} to prepare</span>
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          Next: {readiness.recommendedNextStep}
                        </div>
                      </div>
                    ) : (
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All known requirements satisfied! Ready to submit.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions row: Source, deadline, and CTAs */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Deadline: {opp.deadline}
                    </span>
                    <span className="hidden sm:inline text-stone-400">·</span>
                    <span className="hidden sm:inline text-[11px] text-stone-500 dark:text-stone-400 font-sans">
                      Source: {opp.official_source}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSaveOpportunity(opp.id)}
                      className={`p-2 rounded text-stone-500 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700 transition-colors ${
                        isSaved ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-stone-800'
                      }`}
                      title={isSaved ? 'Saved in My Opportunities' : 'Save opportunity'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-700 dark:fill-amber-400' : ''}`} />
                    </button>

                    <button
                      onClick={() => askAiAboutOpportunity(opp)}
                      className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>Ask AI</span>
                    </button>

                    <button
                      onClick={() => setSelectedOpportunity(opp)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white rounded transition-colors shadow-2xs"
                    >
                      Check Readiness & Apply
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
