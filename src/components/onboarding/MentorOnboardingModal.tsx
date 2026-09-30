import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Briefcase,
  Users,
  Video,
  FileCheck,
  Check,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const AFRICAN_COUNTRIES = [
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

const MENTORSHIP_DISCIPLINES = [
  'Computer Science & Software Engineering',
  'Electrical & Computer Engineering',
  'Data Science & Artificial Intelligence',
  'Economics & Development Finance',
  'Business Administration & Entrepreneurship',
  'Biomedical Science & Global Health',
  'Mechanical & Mechatronics Engineering',
  'Agricultural Sciences & Climate Tech',
  'Law & Public Policy',
  'Natural Sciences & Mathematics'
];

export const MentorOnboardingModal: React.FC = () => {
  const {
    user,
    updateProfile,
    isMentorOnboardingOpen,
    setIsMentorOnboardingOpen,
    addAuditLog
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('Senior Lecturer & Career Advisor');
  const [institution, setInstitution] = useState('University of Ghana');
  const [country, setCountry] = useState('Ghana');
  const [city, setCity] = useState('Accra');
  const [yearsExperience, setYearsExperience] = useState('8');
  const [profileUrl, setProfileUrl] = useState('');

  // Disciplines & Capacity
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([
    'Computer Science & Software Engineering',
    'Economics & Development Finance'
  ]);
  const [menteeCapacity, setMenteeCapacity] = useState('5');
  const [servicesOffered, setServicesOffered] = useState<{
    cvReview: boolean;
    statementReview: boolean;
    liveMockInterview: boolean;
    scholarshipStrategy: boolean;
  }>({
    cvReview: true,
    statementReview: true,
    liveMockInterview: true,
    scholarshipStrategy: true
  });
  const [availabilityWindow, setAvailabilityWindow] = useState('Weekdays 17:00 - 20:00 GMT & Weekend Mornings');

  // Pledge
  const [pledgeAccepted, setPledgeAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && user.role === 'mentor') {
      if (user.fullName) setFullName(user.fullName);
      if (user.country) setCountry(user.country);
      if (user.city) setCity(user.city);
      if (user.institution) setInstitution(user.institution);
      if (user.programme) setProfessionalTitle(user.programme);
      if (user.interests && user.interests.length > 0) setSelectedDisciplines(user.interests);
    }
  }, [user, isMentorOnboardingOpen]);

  if (!isMentorOnboardingOpen) return null;

  const toggleDiscipline = (disc: string) => {
    setSelectedDisciplines(prev =>
      prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc]
    );
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !professionalTitle.trim() || !institution.trim()) {
      setErrorMsg('Please complete all required affiliation fields.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDisciplines.length === 0) {
      setErrorMsg('Please select at least one advisory discipline.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pledgeAccepted) {
      setErrorMsg('You must review and accept the Faculty Zero-Fabrication Pledge.');
      return;
    }

    if (!user) return;

    const updatedProfile = {
      fullName: fullName.trim(),
      country,
      city: city.trim(),
      institution: institution.trim(),
      programme: professionalTitle.trim(),
      interests: selectedDisciplines,
      bio: `${professionalTitle} at ${institution}. Specializing in ${selectedDisciplines.slice(0, 2).join(' and ')} mentorship with ${yearsExperience}+ years experience. Available for live mock interviews and CV endorsements.`,
      skills: ['CV Review', 'Mock Interviews', 'Statement Endorsement', ...selectedDisciplines.slice(0, 3)],
      profileCompleteness: 95,
      onboardingCompleted: true,
      isVerified: true
    };

    updateProfile(updatedProfile);

    // Save completion flag in localStorage
    try {
      localStorage.setItem(`afriversity_mentor_onboarding_completed_${user.id}`, 'true');
    } catch (e) {}

    addAuditLog({
      category: 'user',
      action: 'Mentor Onboarding Completed',
      actor: user.email,
      details: `${fullName} completed faculty advisory onboarding for ${institution}. Advisory capacity set to ${menteeCapacity} mentees.`,
      severity: 'success'
    });

    setIsMentorOnboardingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  FACULTY ADVISORY DESK · ONBOARDING
                </span>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  Welcome to Afriversity Mentor Network
                </h2>
              </div>
            </div>

            <button
              onClick={() => setIsMentorOnboardingOpen(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-stone-300 mt-2 max-w-lg leading-relaxed">
            Configure your academic advisory profile, mentee review capacity, and availability for live 1-on-1 mock interviews with assigned African students.
          </p>

          {/* Stepper indicator */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-700/60 text-xs">
            <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-amber-400 font-bold' : step > 1 ? 'text-emerald-400' : 'text-stone-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${step === 1 ? 'bg-amber-500 text-stone-950 font-bold' : step > 1 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
                {step > 1 ? <Check className="w-3 h-3" /> : '1'}
              </span>
              <span>Credentials</span>
            </div>

            <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-amber-400 font-bold' : step > 2 ? 'text-emerald-400' : 'text-stone-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${step === 2 ? 'bg-amber-500 text-stone-950 font-bold' : step > 2 ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
                {step > 2 ? <Check className="w-3 h-3" /> : '2'}
              </span>
              <span>Disciplines & Live Desk</span>
            </div>

            <div className={`flex items-center gap-1.5 ${step === 3 ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${step === 3 ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-800 text-stone-400'}`}>
                3
              </span>
              <span>Verification Pledge</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Credentials & Institution */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Full Name & Title Prefix *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Joseph Boateng or Prof. Sarah Mensah"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Professional / Academic Role *
                </label>
                <input
                  type="text"
                  required
                  value={professionalTitle}
                  onChange={e => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Senior Lecturer, Staff Engineer, Admissions Advisor"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Affiliated Institution / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. Ashesi University, KNUST, ALX, MIT Africa"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Years of Professional Advisory Experience
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={yearsExperience}
                  onChange={e => setYearsExperience(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Base Country
                </label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {AFRICAN_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  City / Region
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Accra, Lagos, Nairobi, London"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                Faculty Bio / LinkedIn / Google Scholar Profile URL (Optional)
              </label>
              <input
                type="url"
                value={profileUrl}
                onChange={e => setProfileUrl(e.target.value)}
                placeholder="https://linkedin.com/in/... or university profile link"
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono text-xs"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="submit"
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Continue to Advisory Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Disciplines, Capacity & Live Interview Desk */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="p-6 space-y-5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Primary Mentorship Disciplines (Select all applicable) *
                </label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold">
                  {selectedDisciplines.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MENTORSHIP_DISCIPLINES.map(disc => {
                  const isChecked = selectedDisciplines.includes(disc);
                  return (
                    <button
                      type="button"
                      key={disc}
                      onClick={() => toggleDiscipline(disc)}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition-all ${
                        isChecked
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 text-stone-900 dark:text-white font-medium shadow-2xs'
                          : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${isChecked ? 'bg-amber-500 border-amber-600 text-stone-950' : 'border-stone-400'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{disc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-amber-500" />
                  <span className="font-bold text-stone-900 dark:text-white text-xs">
                    Mentorship Services & Live Student Interview Desk
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  Active Feature
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2 p-2 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicesOffered.cvReview}
                    onChange={e => setServicesOffered(s => ({ ...s, cvReview: e.target.checked }))}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Review & Endorse Student CVs</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicesOffered.liveMockInterview}
                    onChange={e => setServicesOffered(s => ({ ...s, liveMockInterview: e.target.checked }))}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-amber-800 dark:text-amber-300">Live 1-on-1 Mock Interviews</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicesOffered.statementReview}
                    onChange={e => setServicesOffered(s => ({ ...s, statementReview: e.target.checked }))}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Statement of Purpose Revisions</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={servicesOffered.scholarshipStrategy}
                    onChange={e => setServicesOffered(s => ({ ...s, scholarshipStrategy: e.target.checked }))}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>Scholarship Application Strategy</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                    Max Concurrent Mentees
                  </label>
                  <select
                    value={menteeCapacity}
                    onChange={e => setMenteeCapacity(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs text-stone-900 dark:text-white"
                  >
                    <option value="3">3 Mentees (Light advisory load)</option>
                    <option value="5">5 Mentees (Recommended)</option>
                    <option value="10">10 Mentees (Senior faculty advisor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1">
                    Live Interview Availability Window
                  </label>
                  <input
                    type="text"
                    value={availabilityWindow}
                    onChange={e => setAvailabilityWindow(e.target.value)}
                    placeholder="e.g. Weekdays 18:00 - 20:00 GMT"
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded text-xs text-stone-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <span>Continue to Verification Pledge</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Advisory Honor Code & Pledge */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 text-sm">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Faculty Advisory Zero-Fabrication Declaration</span>
              </div>
              <p className="text-amber-800 dark:text-amber-300 leading-relaxed text-xs">
                Afriversity is built on uncompromised integrity. As an academic advisor and verified mentor, you agree to:
              </p>
              <ul className="space-y-2 text-stone-700 dark:text-stone-300 pl-4 list-disc text-xs">
                <li>Provide constructive, evidence-based feedback on assigned students’ authentic CVs and academic writings.</li>
                <li>Conduct live mock interviews with genuine rigor reflecting the standards of international scholarship boards and tech firms.</li>
                <li>Never assist in fabricating credentials, grade records, or false letters of endorsement.</li>
                <li>Respect mentee confidentiality and foster an empowering educational environment.</li>
              </ul>
            </div>

            {/* Profile summary preview */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold">
                Advisory Desk Summary
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Mentor: <strong>{fullName}</strong></div>
                <div>Affiliation: <strong>{institution}</strong></div>
                <div>Role: <strong>{professionalTitle}</strong></div>
                <div>Capacity: <strong>{menteeCapacity} Mentees Concurrent</strong></div>
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200 dark:border-stone-700">
                Disciplines: {selectedDisciplines.join(', ')}
              </div>
            </div>

            {/* Checkbox Acceptance */}
            <label className="flex items-start gap-3 p-3 bg-stone-100 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={pledgeAccepted}
                onChange={e => {
                  setPledgeAccepted(e.target.checked);
                  setErrorMsg('');
                }}
                className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
              />
              <span className="text-xs text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                I solemnly accept the Faculty Advisory Honor Code and agree to actively support African learners with honest, verified mentorship, CV guidance, and live mock interview preparation.
              </span>
            </label>

            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={!pledgeAccepted}
                className="py-2.5 px-6 bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-bold rounded-lg transition-all flex items-center gap-2 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Complete Onboarding & Enter Advisory Desk</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
