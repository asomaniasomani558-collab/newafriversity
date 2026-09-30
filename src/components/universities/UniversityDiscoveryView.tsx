import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Search,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  MapPin,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VERIFIED_UNIVERSITIES } from '../../data/universities';
import { University } from '../../types';

export const UniversityDiscoveryView: React.FC = () => {
  const {
    savedUniversityIds,
    toggleSaveUniversity,
    setSelectedUniversity,
    selectedUniversity,
    askAiAboutOpportunity
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [expandedUniId, setExpandedUniId] = useState<string | null>('uni-knust');

  const countryList = [
    { id: 'all', label: 'All African Countries' },
    { id: 'Ghana', label: 'Ghana' },
    { id: 'South Africa', label: 'South Africa' },
    { id: 'Rwanda', label: 'Rwanda' }
  ];

  const filteredUnis = useMemo(() => {
    return VERIFIED_UNIVERSITIES.filter(u => {
      if (selectedCountry !== 'all' && u.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q) || u.shortName.toLowerCase().includes(q);
        const matchesCity = u.city.toLowerCase().includes(q);
        const matchesProg = u.featuredProgrammes.some(p => p.name.toLowerCase().includes(q));
        if (!matchesName && !matchesCity && !matchesProg) return false;
      }
      return true;
    });
  }, [searchQuery, selectedCountry]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider">
          <span>Higher Education in Africa</span>
          <span>·</span>
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Portals & Curricula
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
          University Discovery
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Explore accredited African universities, official admission portals, real programmes, and affiliated scholarship programs.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search universities by name, location, or programme (e.g. KNUST, Computer Engineering, UCT)..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50/70 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-800"
          />
        </div>

        <select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
          className="text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-3 py-2 text-stone-700 dark:text-stone-200 font-medium"
        >
          {countryList.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Universities list */}
      <div className="space-y-4">
        {filteredUnis.map(uni => {
          const isSaved = savedUniversityIds.includes(uni.id);
          const isExpanded = expandedUniId === uni.id;

          return (
            <div
              key={uni.id}
              className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 overflow-hidden shadow-2xs hover:border-stone-300 dark:hover:border-stone-700 transition-all"
            >
              {/* Main Card Header */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="font-bold text-stone-900 dark:text-white">{uni.shortName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{uni.campusType} University</span>
                      <span aria-hidden="true">·</span>
                      <span>{uni.city}, {uni.country}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{uni.rankingText}</span>
                    </div>

                    <h2 className="text-xl font-bold text-stone-900 dark:text-white leading-snug">
                      {uni.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                      {uni.overview}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleSaveUniversity(uni.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
                        isSaved
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-700 dark:fill-amber-400' : ''}`} />
                      <span>{isSaved ? 'Saved in My Universities' : 'Save University'}</span>
                    </button>

                    <a
                      href={uni.admissionsPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>Official Admissions Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Quick Info bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 pt-3 border-t border-stone-100 dark:border-stone-800 font-mono">
                  <div className="flex items-center gap-4">
                    <span>Undergrad Deadline: {uni.applicationTimeline.undergradDeadline}</span>
                    <span className="text-stone-300 dark:text-stone-600">·</span>
                    <span>Postgrad Deadline: {uni.applicationTimeline.postgradDeadline}</span>
                  </div>

                  <button
                    onClick={() => setExpandedUniId(isExpanded ? null : uni.id)}
                    className="text-stone-800 dark:text-stone-200 font-sans font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Programmes & Scholarships' : `View ${uni.featuredProgrammes.length} Featured Programmes & Scholarships`}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Programmes & Scholarships */}
              {isExpanded && (
                <div className="bg-stone-50/70 dark:bg-stone-800/50 p-5 sm:p-6 border-t border-stone-200 dark:border-stone-800 space-y-6 animate-in fade-in duration-150">
                  {/* Featured Programmes */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Verified Academic Programmes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {uni.featuredProgrammes.map(prog => (
                        <div
                          key={prog.id}
                          className="bg-white dark:bg-stone-900 p-4 rounded-md border border-stone-200 dark:border-stone-700 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                            <span className="font-medium text-stone-700 dark:text-stone-300">{prog.faculty}</span>
                            <span className="font-mono text-stone-900 dark:text-amber-400 font-bold">{prog.degreeLevel} · {prog.duration}</span>
                          </div>

                          <h4 className="font-bold text-sm text-stone-900 dark:text-white">{prog.name}</h4>

                          <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1">
                            <div><strong className="text-stone-700 dark:text-stone-200">Tuition:</strong> {prog.tuitionEstimate}</div>
                            <div>
                              <strong className="text-stone-700 dark:text-stone-200">Requirements:</strong>
                              <ul className="list-disc list-inside mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                                {prog.admissionRequirements.map((req, rIdx) => (
                                  <li key={rIdx}>{req}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                            <span className="text-stone-400 dark:text-stone-500 font-mono">Deadline: {prog.applicationDeadline}</span>
                            <a
                              href={prog.officialProgrammeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-800 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                            >
                              <span>Official Course Page</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Available Scholarships */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Partner & Affiliated Scholarships</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {uni.availableScholarships.map((sch, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-xs bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 px-3 py-1 rounded-md border border-stone-200 dark:border-stone-700 font-medium"
                        >
                          {sch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
