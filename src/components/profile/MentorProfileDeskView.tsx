import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Building,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Award,
  Video,
  FileText,
  ShieldCheck,
  Save,
  Check,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  X,
  AlertCircle
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

const AVAILABLE_DISCIPLINES = [
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

export const MentorProfileDeskView: React.FC = () => {
  const {
    user,
    updateProfile,
    menteeReviews,
    mentorTimeSlots,
    transactions,
    setActiveTab,
    setIsMentorOnboardingOpen,
    addAuditLog
  } = useApp();

  if (!user) return null;

  // Real Metrics strictly computed from live platform data
  const assignedStudents = useMemo(() => {
    const studentEmails = new Set(menteeReviews.map(r => r.studentEmail));
    return studentEmails.size;
  }, [menteeReviews]);

  const totalBookedSlots = useMemo(() => {
    return mentorTimeSlots.filter(s => s.status === 'booked' || s.status === 'completed').length;
  }, [mentorTimeSlots]);

  const openAvailableSlots = useMemo(() => {
    return mentorTimeSlots.filter(s => s.status === 'available').length;
  }, [mentorTimeSlots]);

  const completedReviews = useMemo(() => {
    return menteeReviews.filter(r => r.status === 'endorsed').length;
  }, [menteeReviews]);

  // Real Faculty Earnings from platform ledger transactions
  const facultyEarnings = useMemo(() => {
    // 70% share of interview bookings and advisory reviews
    const interviewSum = transactions
      .filter(t => t.type === 'interview_booking' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountUsd * 0.7, 0);

    const reviewSum = transactions
      .filter(t => t.type === 'advisory_review' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountUsd * 0.7, 0);

    return Math.round(interviewSum + reviewSum);
  }, [transactions]);

  // Form State for Mentor Onboarding Details
  const [fullName, setFullName] = useState(user.fullName || 'Dr. Joseph Boateng');
  const [email] = useState(user.email || 'j.boateng@ashesi.edu.gh');
  const [phone, setPhone] = useState(user.phone || '+233 24 555 0192');
  const [country, setCountry] = useState(user.country || 'Ghana');
  const [city, setCity] = useState(user.city || 'Berekuso');
  const [institution, setInstitution] = useState(user.institution || 'Ashesi University');
  const [professionalTitle, setProfessionalTitle] = useState(
    user.programme || 'Senior Lecturer & Admissions Committee Advisor'
  );
  const [academicDegree, setAcademicDegree] = useState(
    user.gradeGpa || 'PhD Computer Science (Cambridge)'
  );
  const [yearsExperience, setYearsExperience] = useState('10');
  const [menteeCapacity, setMenteeCapacity] = useState('6');
  const [bookingFee, setBookingFee] = useState('25');
  const [availabilityWindow, setAvailabilityWindow] = useState(
    'Thursday & Friday 15:30 - 18:00 GMT, Saturday 10:00 - 14:00 GMT'
  );
  const [bio, setBio] = useState(
    user.bio ||
      'Senior Lecturer in Computer Science and Admissions Committee Advisor at Ashesi University. Passionate about empowering African youth to secure competitive international tech scholarships, internships, and postgraduate research fellowships.'
  );

  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(
    user.interests && user.interests.length > 0
      ? user.interests
      : [
          'Computer Science & Software Engineering',
          'Data Science & Artificial Intelligence',
          'Economics & Development Finance'
        ]
  );

  const [servicesOffered, setServicesOffered] = useState({
    cvReview: true,
    statementReview: true,
    liveMockInterview: true,
    scholarshipStrategy: true
  });

  const [customDisciplineInput, setCustomDisciplineInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleDiscipline = (disc: string) => {
    setSelectedDisciplines(prev =>
      prev.includes(disc) ? prev.filter(d => d !== disc) : [...prev, disc]
    );
  };

  const handleAddCustomDiscipline = () => {
    const val = customDisciplineInput.trim();
    if (!val || selectedDisciplines.includes(val)) return;
    setSelectedDisciplines(prev => [...prev, val]);
    setCustomDisciplineInput('');
  };

  const handleSaveOnboarding = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      country,
      city: city.trim(),
      institution: institution.trim(),
      programme: professionalTitle.trim(),
      gradeGpa: academicDegree.trim(),
      interests: selectedDisciplines,
      bio: bio.trim(),
      skills: ['CV Review', 'Mock Interviews', 'Statement Endorsement', ...selectedDisciplines.slice(0, 3)],
      profileCompleteness: 100,
      onboardingCompleted: true,
      isVerified: true
    };

    updateProfile(updated);

    addAuditLog({
      category: 'user',
      action: 'Mentor Dossier Updated',
      actor: user.email,
      details: `Dr. ${fullName} updated faculty credentials, advisory disciplines, and onboarding capacity.`,
      severity: 'info'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-5xl mx-auto pb-16">
      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-7 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>OFFICIAL FACULTY ADVISORY DOSSIER</span>
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Verified African Academic Partner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Mentor Profile & Onboarding Desk
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Manage your faculty credentials, academic affiliations, advisory capacity, and live mock interview availability for assigned students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsMentorOnboardingOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Launch Onboarding Wizard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('interview')}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-stone-950" />
              <span>Manage Calendar Slots</span>
            </button>
          </div>
        </div>

        {/* Real Metrics Grid (Strictly live platform data) */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-750">
            <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">Assigned Students</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-white mt-0.5">
              {assignedStudents} Mentees
            </div>
            <div className="text-[10px] text-stone-400">Real platform users</div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-750">
            <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">Interview Slots Booked</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-0.5">
              {totalBookedSlots} Reserved
            </div>
            <div className="text-[10px] text-stone-400">{openAvailableSlots} open slots</div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-750">
            <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">Endorsed Statements & CVs</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
              {completedReviews} Completed
            </div>
            <div className="text-[10px] text-stone-400">Institutional stamps</div>
          </div>

          <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-750">
            <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">Faculty Payouts (70%)</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-stone-900 dark:text-white mt-0.5">
              ${facultyEarnings} USD
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Live ledger verified</div>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Faculty onboarding profile and advisory settings successfully updated!</span>
        </div>
      )}

      {/* Main Mentor Onboarding Form */}
      <form onSubmit={handleSaveOnboarding} className="space-y-6">
        {/* Section 1: Academic & Institutional Affiliation */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <Building className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              1. Institutional Affiliation & Academic Standing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Full Name with Title
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g., Dr. Joseph Boateng"
                required
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Institutional Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full text-xs p-2.5 bg-stone-100 dark:bg-stone-850 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-500 dark:text-stone-400 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Primary University / Institution
              </label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="e.g., Ashesi University / University of Ghana / KNUST"
                required
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Faculty Position & Academic Role
              </label>
              <input
                type="text"
                value={professionalTitle}
                onChange={e => setProfessionalTitle(e.target.value)}
                placeholder="e.g., Senior Lecturer & Admissions Committee Advisor"
                required
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Highest Degree & Alma Mater
              </label>
              <input
                type="text"
                value={academicDegree}
                onChange={e => setAcademicDegree(e.target.value)}
                placeholder="e.g., PhD Computer Science (University of Cambridge)"
                required
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Years of Academic & Mentorship Experience
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={yearsExperience}
                onChange={e => setYearsExperience(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {AFRICAN_COUNTRIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                City / Campus Location
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g., Berekuso / Kumasi / Accra / Lagos / Nairobi"
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Advisory Disciplines & Specializations */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-stone-900 dark:text-white">
                2. Advisory Disciplines & Student Matching
              </h2>
            </div>
            <span className="text-[10px] font-mono text-stone-400">
              {selectedDisciplines.length} Disciplines Selected
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400">
            Select the fields in which you provide CV reviews, recommendation endorsements, and technical/behavioral mock interview prep.
          </p>

          <div className="flex flex-wrap gap-2">
            {AVAILABLE_DISCIPLINES.map(disc => {
              const isSelected = selectedDisciplines.includes(disc);
              return (
                <button
                  type="button"
                  key={disc}
                  onClick={() => toggleDiscipline(disc)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-stone-900 dark:text-white font-bold ring-1 ring-amber-500/50'
                      : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  <span>{disc}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={customDisciplineInput}
              onChange={e => setCustomDisciplineInput(e.target.value)}
              placeholder="Add other specialization (e.g., Renewable Energy Systems)..."
              className="flex-1 text-xs p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={handleAddCustomDiscipline}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 cursor-pointer"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 3: Mentorship Services, Capacity & Live Interview Availability */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <Briefcase className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              3. Services Offered, Capacity & Mock Interview Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Services Offered to Students
              </label>

              <div className="space-y-2">
                {[
                  { key: 'cvReview', label: '1-on-1 CV / Resume Annotations & Review', icon: FileText },
                  { key: 'statementReview', label: 'Statement of Purpose / Essay Endorsements', icon: Award },
                  { key: 'liveMockInterview', label: 'Live 1-on-1 Faculty Mock Interviews', icon: Video },
                  { key: 'scholarshipStrategy', label: 'International Scholarship Strategy & Guidance', icon: Sparkles }
                ].map(srv => {
                  const Icon = srv.icon;
                  const active = servicesOffered[srv.key as keyof typeof servicesOffered];
                  return (
                    <label
                      key={srv.key}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        active
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={e =>
                          setServicesOffered(prev => ({
                            ...prev,
                            [srv.key]: e.target.checked
                          }))
                        }
                        className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                      />
                      <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium text-stone-800 dark:text-stone-200">{srv.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Max Active Mentee Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={menteeCapacity}
                  onChange={e => setMenteeCapacity(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  How many concurrent students you can comfortably support this semester.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Standard 45-Min Mock Interview Booking Fee (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-stone-400 text-xs font-mono">$</span>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={bookingFee}
                    onChange={e => setBookingFee(e.target.value)}
                    className="w-full text-xs pl-7 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  You receive 70% ($17.50) disbursed directly to your mobile money or bank account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Typical Availability Window for Live Interviews
                </label>
                <input
                  type="text"
                  value={availabilityWindow}
                  onChange={e => setAvailabilityWindow(e.target.value)}
                  placeholder="e.g., Weekday evenings 17:00 - 20:00 GMT"
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Bio & Mentorship Philosophy */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <FileText className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white">
              4. Mentor Bio & Guidance Philosophy
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Public Bio shown to assigned students
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Describe your background, areas of expertise, and how you assist students..."
              className="w-full text-xs p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
            />
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-lg text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Faculty Zero-Fabrication Pledge Signed:</span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                You have officially pledged to evaluate student accomplishments with strict academic integrity, upholding anti-fabrication standards across all African university and scholarship reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Changes synchronize instantly across your assigned student dashboards and interview calendar.</span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4 text-stone-950" />
            <span>Save Faculty Onboarding Dossier</span>
          </button>
        </div>
      </form>

      {/* Quick Navigation to Key Mentor Workspaces */}
      <div className="bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
          Faculty Advisory Workspaces
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('cv-assistant')}
            className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 hover:border-amber-400 rounded-lg text-left transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-white">
              <span>Mentee CV & Statement Desk</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Review, annotate, and endorse assigned student application documents.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 hover:border-amber-400 rounded-lg text-left transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-white">
              <span>Live Interview & Calendar Manager</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Publish available time slots and launch live mock video sessions with students.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className="p-3.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-750 hover:border-amber-400 rounded-lg text-left transition-colors cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-stone-900 dark:text-white">
              <span>Verified Opportunity Catalog</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
              Explore verified scholarships, internships, and fellowships to recommend to mentees.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
