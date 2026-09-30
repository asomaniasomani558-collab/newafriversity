import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    setUser
  } = useApp();

  const [role, setRole] = useState<'student' | 'mentor'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Ghana');
  const [institution, setInstitution] = useState('');
  const [programme, setProgramme] = useState('');
  const [academicLevel, setAcademicLevel] = useState<'secondary' | 'undergraduate' | 'postgraduate' | 'recent_graduate' | 'young_professional'>('secondary');
  const [error, setError] = useState('');

  const isSHS = academicLevel === 'secondary';

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    if (authMode === 'register') {
      if (!fullName.trim() || !institution.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setUser({
      id: `usr-${Date.now()}`,
      fullName: fullName || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role,
      country,
      city: 'Accra',
      academicLevel: role === 'student' ? academicLevel : 'young_professional',
      institution: institution || (isSHS ? 'Senior High School' : 'Tertiary Institution'),
      programme: programme || (isSHS ? 'General Science' : 'Undergraduate Programme'),
      graduationYear: isSHS ? 2026 : 2027,
      gradeGpa: isSHS ? 'WASSCE Candidate' : '3.8 / 4.0',
      relevantSubjects: isSHS
        ? ['Core Mathematics', 'Integrated Science', 'English Language', 'Elective Mathematics']
        : ['Algorithms', 'Software Engineering'],
      interests: isSHS
        ? ['University Admissions', 'Mastercard Foundation Scholars', 'STEM']
        : ['Technology', 'Research', 'Leadership'],
      skills: ['Python', 'Problem Solving', 'Communication'],
      goals: isSHS
        ? ['University Undergraduate Admission', 'Mastercard Foundation Scholars Program']
        : ['Software Engineering Internship', 'Mastercard Foundation Scholars Program'],
      projects: [],
      preferences: {
        targetCountries: [country],
        fundingTypes: ['Fully Funded', 'Paid'],
        remoteOnly: false,
        opportunityTypes: isSHS
          ? ['scholarship', 'admission', 'training']
          : ['internship', 'scholarship']
      },
      profileCompleteness: 70,
      currentPriority: isSHS
        ? 'Review undergraduate admissions guidelines and scholarship deadlines'
        : 'Complete initial profile checklist',
      notificationSettings: {
        opportunityAlerts: true,
        deadlineReminders: true,
        universityUpdates: true,
        weeklyDigest: true,
        whatsappAlerts: false
      }
    });

    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-stone-900 dark:bg-amber-500 text-stone-100 dark:text-stone-950 flex items-center justify-center font-bold text-xs">
              AF
            </div>
            <div>
              <h2 className="font-bold text-stone-900 dark:text-white text-sm">
                {authMode === 'login' ? 'Sign In to Afriversity' : 'Create Student / Mentor Account'}
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Personalized opportunity & readiness platform
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-md text-xs text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <>
                <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-md">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 py-1 text-xs font-semibold rounded ${
                      role === 'student' ? 'bg-white dark:bg-stone-700 shadow-2xs text-stone-900 dark:text-white' : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Student (SHS & Tertiary)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('mentor')}
                    className={`flex-1 py-1 text-xs font-semibold rounded ${
                      role === 'mentor' ? 'bg-white dark:bg-stone-700 shadow-2xs text-stone-900 dark:text-white' : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Mentor / Advisor
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Victoria Mensah"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>

                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Academic Level
                      </label>
                      <select
                        value={academicLevel}
                        onChange={e => setAcademicLevel(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 font-medium"
                      >
                        <option value="secondary">Senior High School (SHS)</option>
                        <option value="undergraduate">Undergraduate Degree</option>
                        <option value="postgraduate">Postgraduate</option>
                        <option value="recent_graduate">Recent Graduate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      {isSHS && role === 'student' ? 'Senior High School' : 'Institution / University'}
                    </label>
                    <input
                      type="text"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      placeholder={isSHS && role === 'student' ? 'e.g. Presec, Achimota, Wesley Girls' : 'e.g. KNUST, UG Legon, UCT'}
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      {isSHS && role === 'student' ? 'SHS Track' : 'Programme / Major'}
                    </label>
                    <input
                      type="text"
                      value={programme}
                      onChange={e => setProgramme(e.target.value)}
                      placeholder={isSHS && role === 'student' ? 'e.g. General Science, Business' : 'e.g. Computer Science'}
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                {isSHS && authMode === 'register' ? 'Email Address' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
              />
            </div>

            <div className={authMode === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : ''}>
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-semibold text-xs sm:text-sm rounded-md transition-colors shadow-2xs mt-2"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account & Continue'}
            </button>
          </form>

          {/* Toggle mode */}
          <div className="text-center text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
            {authMode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="font-semibold text-stone-900 dark:text-amber-400 hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="font-semibold text-stone-900 dark:text-amber-400 hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
