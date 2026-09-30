import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronDown,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OpportunityType } from '../../types';

const COUNTRIES = [
  'Ghana',
  'Nigeria',
  'Kenya',
  'Rwanda',
  'South Africa',
  'Uganda',
  'Tanzania',
  'Ethiopia',
  'Zimbabwe',
  'Egypt',
  'Morocco',
  'Cameroon',
  'Senegal',
  'Other African Nation',
  'Global Diaspora'
];

const ACADEMIC_LEVELS = [
  { id: 'secondary', label: 'Senior Secondary / High School (SHS / WASSCE)' },
  { id: 'undergraduate', label: 'Undergraduate Degree Student' },
  { id: 'postgraduate', label: 'Postgraduate (Masters / PhD)' },
  { id: 'recent_graduate', label: 'Recent Graduate (1-2 Years Post-Grad)' },
  { id: 'young_professional', label: 'Young Professional / Early Career' }
];

const OPPORTUNITY_TYPES: { id: OpportunityType; label: string }[] = [
  { id: 'scholarship', label: 'Full Scholarships' },
  { id: 'admission', label: 'University Admissions' },
  { id: 'internship', label: 'Internships & Traineeships' },
  { id: 'fellowship', label: 'Fellowships' },
  { id: 'grant', label: 'Research Grants' },
  { id: 'competition', label: 'Competitions & Hackathons' }
];

const STUDY_REGIONS = [
  'Ghana',
  'Nigeria',
  'United Kingdom',
  'USA & Canada',
  'Europe (Germany, France, Netherlands)',
  'Pan-African',
  'Global / Remote'
];

export const OnboardingModal: React.FC = () => {
  const { user, updateProfile, isOnboardingOpen, setIsOnboardingOpen, setActiveTab } = useApp();

  // Active step: 1 (Personal & Education), 2 (Institution & Programme), 3 (Goals & Interests)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [academicLevel, setAcademicLevel] = useState<string>('');
  const [institution, setInstitution] = useState('');
  const [programme, setProgramme] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Mastercard Foundation Scholars Program at KNUST']);
  const [customGoal, setCustomGoal] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<OpportunityType[]>(['scholarship', 'admission']);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['Ghana', 'United Kingdom', 'USA & Canada']);

  // Sync initial user details when modal opens
  useEffect(() => {
    if (user) {
      if (user.fullName && user.fullName !== 'Student Learner') setFullName(user.fullName);
      if (user.country) setCountry(user.country);
      if (user.academicLevel) setAcademicLevel(user.academicLevel);
      if (user.institution && user.institution !== 'Senior High School') setInstitution(user.institution);
      if (user.programme) setProgramme(user.programme);
      if (user.graduationYear) setGraduationYear(String(user.graduationYear));
      if (user.goals && user.goals.length > 0) setSelectedGoals(user.goals);
      if (user.preferences?.opportunityTypes) setSelectedTypes(user.preferences.opportunityTypes);
      if (user.preferences?.targetCountries) setSelectedRegions(user.preferences.targetCountries);
    }
  }, [user, isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const isStep1Valid = fullName.trim().length > 0 && country !== '' && academicLevel !== '';

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    setStep(2);
  };

  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isSHS = academicLevel === 'secondary';
    const finalInstitution = institution.trim() || (isSHS ? 'Wesley Girls’ High School' : 'University of Ghana');
    const finalProgramme = programme.trim() || (isSHS ? 'General Science' : 'Computer Science & Engineering');

    const goalsToSave = [...selectedGoals];
    if (customGoal.trim() && !goalsToSave.includes(customGoal.trim())) {
      goalsToSave.push(customGoal.trim());
    }

    updateProfile({
      fullName: fullName.trim(),
      country,
      academicLevel: academicLevel as any,
      institution: finalInstitution,
      programme: finalProgramme,
      graduationYear: Number(graduationYear) || 2026,
      goals: goalsToSave,
      onboardingCompleted: true,
      preferences: {
        targetCountries: selectedRegions,
        fundingTypes: user?.preferences?.fundingTypes || ['Fully Funded'],
        remoteOnly: user?.preferences?.remoteOnly || false,
        opportunityTypes: selectedTypes
      },
      profileCompleteness: Math.max(85, user?.profileCompleteness || 85)
    });

    // Mark completed in localStorage
    try {
      localStorage.setItem('afriversity_onboarding_completed', 'true');
      if (user?.id) {
        localStorage.setItem(`afriversity_onboarding_completed_${user.id}`, 'true');
      }
    } catch {}

    setIsOnboardingOpen(false);
    setActiveTab('discover');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 relative space-y-6 my-auto">
        {/* Dismiss button if user already has data */}
        <button
          onClick={() => setIsOnboardingOpen(false)}
          className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-md transition-colors"
          title="Close setup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Header with Orange Dot & Afriversity Name (Matches Image 1) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shrink-0" />
            <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-white">
              Afriversity
            </span>
          </div>

          {/* 3 Horizontal Progress Segment Bars (Matches Image 1) */}
          <div className="grid grid-cols-3 gap-2">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                step >= 1 ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-700'
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                step >= 2 ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-700'
              }`}
            />
            <div
              className={`h-1 rounded-full transition-all duration-300 ${
                step >= 3 ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-700'
              }`}
            />
          </div>
        </div>

        {/* STEP 1: PERSONAL & CORE EDUCATION LEVEL (Exact replica of Image 1) */}
        {step === 1 && (
          <form onSubmit={handleStep1Continue} className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Welcome to Afriversity
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Let’s set up your profile so we can find opportunities that fit you. This takes about a minute.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* FULL NAME */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Victoria Mensah"
                  className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium placeholder:text-stone-400"
                />
              </div>

              {/* COUNTRY */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  COUNTRY
                </label>
                <div className="relative">
                  <select
                    required
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium appearance-none pr-10 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select country
                    </option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-stone-400 pointer-events-none" />
                </div>
              </div>

              {/* ACADEMIC LEVEL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  ACADEMIC LEVEL
                </label>
                <div className="relative">
                  <select
                    required
                    value={academicLevel}
                    onChange={e => setAcademicLevel(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium appearance-none pr-10 cursor-pointer"
                  >
                    <option value="" disabled>
                      Select level
                    </option>
                    {ACADEMIC_LEVELS.map(lvl => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-3.5 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={!isStep1Valid}
                className={`py-2.5 px-6 font-bold text-xs sm:text-sm rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                  isStep1Valid
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold'
                    : 'bg-stone-400 dark:bg-stone-700 text-white cursor-not-allowed opacity-80'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sparkles Tip Card (Matches Image 1 bottom) */}
            <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                As you complete your profile, recommendations improve. You can update everything later in My Afriversity.
              </p>
            </div>
          </form>
        )}

        {/* STEP 2: INSTITUTION & PROGRAMME */}
        {step === 2 && (
          <form onSubmit={handleStep2Continue} className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Academic Background
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Enter your school details so we match admissions requirements, transcripts, and faculty eligibility.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* CURRENT INSTITUTION */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  CURRENT INSTITUTION / HIGH SCHOOL
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. Wesley Girls' High School or KNUST"
                  className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              {/* DEGREE PROGRAMME / MAJOR */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  PROGRAMME / MAJOR TRACK
                </label>
                <input
                  type="text"
                  required
                  value={programme}
                  onChange={e => setProgramme(e.target.value)}
                  placeholder="e.g. General Science (Physics, Chemistry, Math) or Computer Science"
                  className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              {/* EXPECTED GRADUATION YEAR */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  EXPECTED / GRADUATION YEAR
                </label>
                <input
                  type="number"
                  min="2024"
                  max="2035"
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  placeholder="2026"
                  className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2 px-3 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: TARGET GOALS & STUDY REGIONS */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Interests & Aspirations
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                Select your primary goals so our opportunity matching engine prioritizes verified deadlines for you.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              {/* TARGET OPPORTUNITY TYPES */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  OPPORTUNITY CATEGORIES
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {OPPORTUNITY_TYPES.map(t => {
                    const isSelected = selectedTypes.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setSelectedTypes(prev =>
                            isSelected ? prev.filter(x => x !== t.id) : [...prev, t.id]
                          );
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-stone-900 dark:text-amber-300'
                            : 'bg-stone-50 dark:bg-stone-850 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <span className="truncate">{t.label}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PRIMARY CAREER GOAL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  PRIMARY CAREER GOAL / TARGET SCHOLARSHIP
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={e => setCustomGoal(e.target.value)}
                  placeholder="e.g. Mastercard Foundation Scholars Program at KNUST"
                  className="w-full text-xs sm:text-sm p-3 bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-medium"
                />
              </div>

              {/* PREFERRED STUDY REGIONS */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                  PREFERRED STUDY DESTINATIONS
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STUDY_REGIONS.map(reg => {
                    const isSelected = selectedRegions.includes(reg);
                    return (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => {
                          setSelectedRegions(prev =>
                            isSelected ? prev.filter(r => r !== reg) : [...prev, reg]
                          );
                        }}
                        className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-400 font-bold'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        {isSelected ? `✓ ${reg}` : `+ ${reg}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Final Submission Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2 px-3 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Complete Profile & Discover</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
