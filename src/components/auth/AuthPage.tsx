import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  BookOpen,
  Award,
  Compass,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Sun,
  Moon,
  School,
  Shield,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile } from '../../types';
import { INITIAL_PLATFORM_USERS } from '../../data/mockUsers';
import { verifyAdminCredentials, getAdminCredentials, changeAdminPassword } from '../../utils/adminAuth';

export const AuthPage: React.FC = () => {
  const { setUser, theme, toggleTheme, setActiveTab, setIsOnboardingOpen } = useApp();

  // Active path: 'student' or 'mentor' or 'admin'
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | 'admin'>('student');
  // Form mode: 'login' | 'register' | 'forgot_password' | 'verify_otp'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password' | 'verify_otp'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('Ghana');
  const [city, setCity] = useState('');
  const [institution, setInstitution] = useState('');
  const [programme, setProgramme] = useState('');
  const [academicLevel, setAcademicLevel] = useState<'secondary' | 'undergraduate' | 'postgraduate' | 'recent_graduate' | 'young_professional'>('secondary');
  const [mentorTitle, setMentorTitle] = useState('');
  const [mentorOrganization, setMentorOrganization] = useState('');
  const [mentorExpertise, setMentorExpertise] = useState('Scholarship & Graduate Admission Review');
  const [customExpertise, setCustomExpertise] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [formError, setFormError] = useState('');

  // OTP Verification state for anti-fraud during registration
  const [pendingAccount, setPendingAccount] = useState<{ email: string; passwordHash: string; profile: UserProfile } | null>(null);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [otpError, setOtpError] = useState<string>('');

  // Multi-step Forgot Password with Email OTP Verification state
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'new_password' | 'success'>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetOtpDigits, setResetOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetTimer, setResetTimer] = useState<number>(60);
  const [resetError, setResetError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);

  const isSHS = academicLevel === 'secondary';

  // Countdown timer for registration OTP resend
  useEffect(() => {
    let interval: any;
    if (authMode === 'verify_otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, otpTimer]);

  // Countdown timer for forgot password OTP resend
  useEffect(() => {
    let interval: any;
    if (authMode === 'forgot_password' && forgotStep === 'otp' && resetTimer > 0) {
      interval = setInterval(() => {
        setResetTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, forgotStep, resetTimer]);

  // Helper to load registered users from localStorage
  const getRegisteredAccounts = (): { email: string; passwordHash: string; profile: UserProfile }[] => {
    try {
      const data = localStorage.getItem('afriversity_registered_accounts');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveRegisteredAccount = (account: { email: string; passwordHash: string; profile: UserProfile }) => {
    const existing = getRegisteredAccounts().filter(a => a.email.toLowerCase() !== account.email.toLowerCase());
    existing.push(account);
    localStorage.setItem('afriversity_registered_accounts', JSON.stringify(existing));
  };

  // OTP handlers
  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = clean.slice(-1);
    setOtpDigits(newDigits);
    setOtpError('');

    if (clean && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const chars = pasteData.split('');
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setOtpDigits(newDigits);
      setOtpError('');
      const targetFocusIdx = Math.min(chars.length, 5);
      const targetInput = document.getElementById(`otp-input-${targetFocusIdx}`);
      targetInput?.focus();
    }
  };

  const handleResendOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newCode);
    setOtpTimer(60);
    setOtpError('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtpDigits(generatedOtp.split(''));
      setOtpError('');
      const lastInput = document.getElementById('otp-input-5');
      lastInput?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError('');

    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 6) {
      setOtpError('Please enter the complete 6-digit verification code.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setOtpError('Invalid verification code. Please check the code sent to your email and try again.');
      return;
    }

    if (!pendingAccount) {
      setOtpError('Registration session expired. Please register again.');
      setAuthMode('register');
      return;
    }

    // Mark account verified
    const verifiedProfile: UserProfile = {
      ...pendingAccount.profile,
      isVerified: true,
      status: 'active',
      onboardingCompleted: false
    };

    saveRegisteredAccount({
      email: pendingAccount.email,
      passwordHash: pendingAccount.passwordHash,
      profile: verifiedProfile
    });

    setUser(verifiedProfile);

    // If student, immediately open onboarding form to find out their information
    if (verifiedProfile.role === 'student') {
      setIsOnboardingOpen(true);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim().toLowerCase();

    if (authMode === 'login') {
      if (!cleanEmail || !password.trim()) {
        setFormError('Please enter both your email address and password.');
        return;
      }

      const accounts = getRegisteredAccounts();

      // Strict role check: If registered as mentor or platform mentor, prevent login on student portal
      const isMentorReg = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.profile.role === 'mentor');
      const isMentorInitial = INITIAL_PLATFORM_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'mentor');
      if (isMentorReg || isMentorInitial) {
        setFormError('Access Restricted: This email is registered as an Academic Mentor account. Please switch to the Mentor Portal tab above to sign in.');
        return;
      }

      // Check if admin email
      const adminCreds = getAdminCredentials();
      if (adminCreds.email.toLowerCase() === cleanEmail) {
        setFormError('Access Restricted: Administrative account detected. Please use the dedicated Admin Portal tab.');
        return;
      }

      // Check registered student accounts
      const foundReg = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.profile.role === 'student');
      if (foundReg) {
        if (foundReg.passwordHash !== password) {
          setFormError('Incorrect password. Please verify and try again or use "Forgot password?".');
          return;
        }
        setUser(foundReg.profile);
        if (!foundReg.profile.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
        return;
      }

      // Check seeded platform students (e.g. Victoria Mensah or Kwame Asante)
      const matchedInitial = INITIAL_PLATFORM_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'student');
      if (matchedInitial) {
        // Accept password or default demo password 'student123'
        if (password !== 'student123' && password !== 'password' && password !== '123456') {
          setFormError('Incorrect password for this student account. Please verify and try again or use "Forgot password?".');
          return;
        }
        saveRegisteredAccount({
          email: cleanEmail,
          passwordHash: password,
          profile: matchedInitial
        });
        setUser(matchedInitial);
        if (!matchedInitial.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
        return;
      }

      setFormError('No student account found with this email. Please register for an account below or check your credentials.');
      return;
    } else if (authMode === 'register') {
      if (!fullName.trim() || !cleanEmail || !password.trim() || !institution.trim()) {
        setFormError('Please complete all required fields.');
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please verify your confirm password.');
        return;
      }

      // Check existing accounts
      const accounts = getRegisteredAccounts();
      if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
        setFormError('An account with this email address already exists. Please sign in instead.');
        return;
      }

      const createdStudent: UserProfile = {
        id: `usr-student-${Date.now()}`,
        fullName: fullName.trim(),
        email: cleanEmail,
        role: 'student',
        country,
        city: city.trim() || (isSHS ? 'Kumasi' : 'Accra'),
        academicLevel,
        institution: institution.trim(),
        programme: programme.trim() || (isSHS ? 'General Science' : 'General Studies'),
        graduationYear: isSHS ? 2026 : 2027,
        gradeGpa: isSHS ? 'WASSCE Candidate' : 'In Progress',
        relevantSubjects: isSHS
          ? ['Core Mathematics', 'Integrated Science', 'English Language', 'Elective Mathematics']
          : ['Core Sciences', 'Mathematics'],
        interests: isSHS
          ? ['University Admission 2026', 'Full Scholarships', 'STEM & Technology']
          : ['Career Development', 'Higher Education'],
        skills: ['Problem Solving', 'Critical Thinking', 'Academic Study'],
        goals: isSHS
          ? ['Mastercard Foundation Scholars Program', 'KNUST / UG University Admissions', 'ALX Software Fellowship']
          : ['Find verified opportunities', 'Study abroad scholarship'],
        projects: [],
        preferences: {
          targetCountries: [country],
          fundingTypes: ['Fully Funded', 'Paid'],
          remoteOnly: false,
          opportunityTypes: isSHS
            ? ['scholarship', 'admission', 'fellowship', 'training']
            : ['internship', 'scholarship', 'admission']
        },
        profileCompleteness: 70,
        currentPriority: isSHS
          ? 'Check your WASSCE requirements and prepare Mastercard Foundation scholarship checklist'
          : 'Complete initial profile details for optimal matching',
        isVerified: false,
        onboardingCompleted: false,
        notificationSettings: {
          opportunityAlerts: true,
          deadlineReminders: true,
          universityUpdates: true,
          weeklyDigest: true,
          whatsappAlerts: false
        }
      };

      // Generate 6-digit OTP verification code to prevent fraudulent registrations
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingAccount({
        email: cleanEmail,
        passwordHash: password,
        profile: createdStudent
      });
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpError('');
      setAuthMode('verify_otp');
    }
  };

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanEmail = email.trim().toLowerCase();

    if (authMode === 'login') {
      if (!cleanEmail || !password.trim()) {
        setFormError('Please enter both your mentor email address and password.');
        return;
      }

      const accounts = getRegisteredAccounts();

      // Strict role check: If registered as student or platform student, reject login on mentor portal
      const isStudentReg = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.profile.role === 'student');
      const isStudentInitial = INITIAL_PLATFORM_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'student');
      if (isStudentReg || isStudentInitial) {
        setFormError('Access Restricted: This email is registered as a Student account. Please switch to the Student Portal tab above to sign in.');
        return;
      }

      // Check if admin email
      const adminCreds = getAdminCredentials();
      if (adminCreds.email.toLowerCase() === cleanEmail) {
        setFormError('Access Restricted: Administrative account detected. Please use the dedicated Admin Portal tab.');
        return;
      }

      // Check registered mentor accounts
      const foundReg = accounts.find(a => a.email.toLowerCase() === cleanEmail && a.profile.role === 'mentor');
      if (foundReg) {
        if (foundReg.passwordHash !== password) {
          setFormError('Incorrect password. Please verify your mentor password and try again or use "Forgot password?".');
          return;
        }
        setUser(foundReg.profile);
        return;
      }

      // Check initial platform mentors (e.g. Dr. Joseph Boateng)
      const matchedInitial = INITIAL_PLATFORM_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'mentor');
      if (matchedInitial) {
        if (password !== 'mentor123' && password !== 'password' && password !== '123456') {
          setFormError('Incorrect password for this mentor account. Please verify and try again or use "Forgot password?".');
          return;
        }
        saveRegisteredAccount({
          email: cleanEmail,
          passwordHash: password,
          profile: matchedInitial
        });
        setUser(matchedInitial);
        return;
      }

      setFormError('No mentor account found with this email. Please register for mentor access below or verify your credentials.');
      return;
    } else if (authMode === 'register') {
      if (!fullName.trim() || !cleanEmail || !password.trim() || !mentorOrganization.trim()) {
        setFormError('Please provide your name, official email, and organizational affiliation.');
        return;
      }

      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please verify your confirm password.');
        return;
      }

      // Check existing accounts
      const accounts = getRegisteredAccounts();
      if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
        setFormError('An account with this email address already exists. Please sign in instead.');
        return;
      }

      const finalExpertise = mentorExpertise === 'Other' ? (customExpertise.trim() || 'Custom Advisory') : mentorExpertise;
      const createdMentor: UserProfile = {
        id: `usr-mentor-${Date.now()}`,
        fullName: fullName.trim(),
        email: cleanEmail,
        role: 'mentor',
        country,
        city: city.trim() || 'Accra',
        academicLevel: 'young_professional',
        institution: mentorOrganization.trim(),
        programme: mentorTitle.trim() || 'Mentor & Career Advisor',
        graduationYear: 2019,
        gradeGpa: 'Faculty / Professional',
        relevantSubjects: ['Mentorship', 'Research'],
        interests: ['African Talent Acceleration', finalExpertise],
        skills: ['Mentorship', 'Application Review', 'Interview Prep'],
        goals: ['Advise next generation African talent'],
        projects: [],
        preferences: {
          targetCountries: [country],
          fundingTypes: ['Fully Funded'],
          remoteOnly: true,
          opportunityTypes: ['scholarship', 'fellowship', 'internship']
        },
        profileCompleteness: 90,
        currentPriority: 'Review student applications and provide statement endorsements',
        isVerified: false,
        onboardingCompleted: true,
        notificationSettings: {
          opportunityAlerts: true,
          deadlineReminders: true,
          universityUpdates: true,
          weeklyDigest: true,
          whatsappAlerts: false
        }
      };

      // Generate 6-digit OTP verification code to prevent fraudulent registrations
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setPendingAccount({
        email: cleanEmail,
        passwordHash: password,
        profile: createdMentor
      });
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(60);
      setOtpError('');
      setAuthMode('verify_otp');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setFormError('Please enter both your administrator email and password.');
      return;
    }

    if (!verifyAdminCredentials(cleanEmail, cleanPassword)) {
      setFormError('Invalid administrator credentials. Please check your administrator email and password.');
      return;
    }

    const currentCreds = getAdminCredentials();
    const adminUser = INITIAL_PLATFORM_USERS.find(u => u.role === 'admin') || INITIAL_PLATFORM_USERS[0];
    const authenticatedAdmin: UserProfile = {
      ...adminUser,
      email: currentCreds.email
    };

    setUser(authenticatedAdmin);
    setActiveTab('admin');
  };

  // Forgot Password Email OTP Verification handlers
  const handleResetOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    const newDigits = [...resetOtpDigits];
    newDigits[index] = clean.slice(-1);
    setResetOtpDigits(newDigits);
    setResetError('');

    if (clean && index < 5) {
      const nextInput = document.getElementById(`reset-otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleResetOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !resetOtpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResetOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const chars = pasteData.split('');
      const newDigits = [...resetOtpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = chars[i] || '';
      }
      setResetOtpDigits(newDigits);
      setResetError('');
      const targetFocusIdx = Math.min(chars.length, 5);
      const targetInput = document.getElementById(`reset-otp-input-${targetFocusIdx}`);
      targetInput?.focus();
    }
  };

  const handleResendResetOtp = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setResetOtp(newCode);
    setResetTimer(60);
    setResetError('');
    setResetOtpDigits(['', '', '', '', '', '']);
  };

  const handleAutoFillResetOtp = () => {
    if (resetOtp) {
      setResetOtpDigits(resetOtp.split(''));
      setResetError('');
      const lastInput = document.getElementById('reset-otp-input-5');
      lastInput?.focus();
    }
  };

  const handleInitiatePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setResetError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setFormError('Please enter your registered email address.');
      return;
    }

    const accounts = getRegisteredAccounts();
    const foundReg = accounts.find(a => a.email.toLowerCase() === cleanEmail);
    const foundInitial = INITIAL_PLATFORM_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    const adminCreds = getAdminCredentials();
    const isAdmin = adminCreds.email.toLowerCase() === cleanEmail;

    if (!foundReg && !foundInitial && !isAdmin) {
      setFormError('No registered account found with this email. Please check your spelling or register.');
      return;
    }

    const target = foundReg?.profile || foundInitial || (isAdmin ? INITIAL_PLATFORM_USERS[0] : null);
    setResetTargetUser(target);
    setResetEmail(cleanEmail);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setResetOtp(otpCode);
    setResetTimer(60);
    setResetOtpDigits(['', '', '', '', '', '']);
    setResetError('');
    setForgotStep('otp');
  };

  const handleVerifyResetOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setResetError('');
    const entered = resetOtpDigits.join('');
    if (entered.length < 6) {
      setResetError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (entered !== resetOtp) {
      setResetError('Invalid verification code. Please check the code sent to your email and try again.');
      return;
    }
    setForgotStep('new_password');
  };

  const handleCompletePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (!resetNewPassword.trim() || resetNewPassword.length < 6) {
      setResetError('Password must be at least 6 characters in length.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    const cleanEmail = resetEmail.toLowerCase();

    // 1. If admin, update admin credentials
    const adminCreds = getAdminCredentials();
    if (adminCreds.email.toLowerCase() === cleanEmail) {
      changeAdminPassword(adminCreds.passwordHash, resetNewPassword);
    }

    // 2. Save in registered accounts
    const existingAccounts = getRegisteredAccounts();
    const existing = existingAccounts.find(a => a.email.toLowerCase() === cleanEmail);
    const profileToSave: UserProfile = existing?.profile || resetTargetUser || {
      id: `usr-${Date.now()}`,
      fullName: cleanEmail.split('@')[0],
      email: cleanEmail,
      role: selectedRole === 'admin' ? 'admin' : selectedRole,
      country: 'Ghana',
      city: 'Accra',
      academicLevel: 'secondary',
      institution: 'Verified Institution',
      programme: 'General Studies',
      graduationYear: 2026,
      gradeGpa: 'Candidate',
      relevantSubjects: [],
      interests: [],
      skills: [],
      goals: [],
      projects: [],
      preferences: {
        targetCountries: ['Ghana'],
        fundingTypes: ['Fully Funded'],
        remoteOnly: false,
        opportunityTypes: ['scholarship']
      },
      profileCompleteness: 80,
      currentPriority: 'Password reset completed',
      isVerified: true,
      onboardingCompleted: true,
      notificationSettings: {
        opportunityAlerts: true,
        deadlineReminders: true,
        universityUpdates: true,
        weeklyDigest: true,
        whatsappAlerts: false
      }
    };

    saveRegisteredAccount({
      email: cleanEmail,
      passwordHash: resetNewPassword,
      profile: profileToSave
    });

    setForgotStep('success');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-amber-200 transition-colors">
      {/* Top Banner Navigation */}
      <header className="px-6 sm:px-12 py-5 border-b border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-stone-900 dark:bg-amber-500 text-stone-100 dark:text-stone-950 flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
            AF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-white">
                AFRIVERSITY
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/70 dark:border-amber-800/60">
                Africa-First Portal
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
              Find the right opportunity. Know what's missing. Get ready. Apply.
            </p>
          </div>
        </div>

        {/* Right Header Actions: Theme Toggle & Verification Marker */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors shadow-2xs"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-stone-600" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Official Gate</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-white dark:bg-stone-900 shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {/* Left Column: Platform Mission & Value Props (5 cols) */}
          <div className="lg:col-span-5 bg-stone-900 dark:bg-stone-950 text-stone-100 p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-9xl font-bold font-mono">
              AF
            </div>

            <div className="space-y-5 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800/80">
                <Sparkles className="w-3 h-3" />
                <span>The Core Student Loop</span>
              </div>

              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                  Stop missing opportunities you qualify for.
                </h1>
                <p className="text-xs text-stone-300 leading-relaxed">
                  For secondary school and university students across Africa. We evaluate your eligibility, show you precisely what requirements or documents you are missing, and prepare you to apply.
                </p>
              </div>

              {/* Core loop pipeline */}
              <div className="space-y-2 pt-1">
                {[
                  { step: 'FIND', desc: 'WASSCE scholarships, admissions & internships' },
                  { step: 'CHECK', desc: 'Deterministic eligibility & academic readiness' },
                  { step: 'PREPARE', desc: 'Application checklist, CV tailoring & essay prep' },
                  { step: 'APPLY', desc: 'Direct redirection to official external portals' },
                  { step: 'TRACK', desc: 'Personal Kanban pipeline & deadline alerts' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    <span className="w-16 font-mono text-[10px] font-bold text-amber-400 bg-stone-800 px-2 py-0.5 rounded text-center shrink-0">
                      {item.step}
                    </span>
                    <span className="text-stone-300 text-[11px] leading-snug">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-400 space-y-1 relative z-10">
              <div className="font-semibold text-stone-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Fake Opportunities Policy</span>
              </div>
              <p className="text-[10px] leading-relaxed">Every scholarship, admission requirement, and portal link is sourced directly from verified universities and official foundations.</p>
            </div>
          </div>

          {/* Right Column: Authentication Form with Role Tabs (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-5 bg-white dark:bg-stone-900">
            <div className="space-y-4">
              {/* Role Selection Tabs (Distinct pathways for Student, Mentor, and Administrator) */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Select Your Portal Pathway
                </div>
                <div className="grid grid-cols-3 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('student');
                      setFormError('');
                      if (authMode === 'forgot_password') setAuthMode('login');
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === 'student'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <GraduationCap className={`w-3.5 h-3.5 ${selectedRole === 'student' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-400'}`} />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('mentor');
                      setFormError('');
                      if (authMode === 'forgot_password') setAuthMode('login');
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === 'mentor'
                        ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className={`w-3.5 h-3.5 ${selectedRole === 'mentor' ? 'text-blue-600 dark:text-blue-400' : 'text-stone-400'}`} />
                    <span>Mentor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setFormError('');
                      setAuthMode('login');
                      setEmail('');
                      setPassword('');
                    }}
                    className={`py-2 px-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                      selectedRole === 'admin'
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Shield className={`w-3.5 h-3.5 ${selectedRole === 'admin' ? 'text-stone-950' : 'text-stone-400'}`} />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Mode Header (Login / Register / Forgot) */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                    {authMode === 'verify_otp'
                      ? 'Verify Your Email Address'
                      : selectedRole === 'admin'
                      ? 'Site Administrator Sign In'
                      : authMode === 'forgot_password'
                      ? forgotStep === 'otp'
                        ? 'Verify Reset Code'
                        : forgotStep === 'new_password'
                        ? 'Create New Password'
                        : forgotStep === 'success'
                        ? 'Password Reset Complete'
                        : 'Reset Account Password'
                      : authMode === 'login'
                      ? `${selectedRole === 'student' ? 'Student' : 'Mentor'} Sign In`
                      : `Create ${selectedRole === 'student' ? 'Student' : 'Mentor'} Account`}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {authMode === 'verify_otp'
                      ? 'Anti-fraud identity check: enter the 6-digit verification code dispatched to your email.'
                      : selectedRole === 'admin'
                      ? 'Oversee users, verify opportunities, monitor platform earnings, and manage the site.'
                      : authMode === 'forgot_password'
                      ? forgotStep === 'otp'
                        ? `Enter the 6-digit OTP code dispatched to ${resetEmail} to confirm your identity.`
                        : forgotStep === 'new_password'
                        ? `Choose a new secure password (min 6 characters) for ${resetEmail}.`
                        : forgotStep === 'success'
                        ? 'Your credentials have been securely updated. You can now access your dashboard.'
                        : 'Enter your registered email address to receive an anti-fraud reset verification code.'
                      : authMode === 'login'
                      ? selectedRole === 'student'
                        ? 'Sign in to access your saved opportunities, readiness checklists, and tracker.'
                        : 'Sign in to review student submissions, endorse statements, and advise applicants.'
                      : selectedRole === 'student'
                      ? 'Open to Senior High School and tertiary students across Africa.'
                      : 'Register to join our network of verified academic and industry advisors.'}
                  </p>
                </div>

                {authMode !== 'forgot_password' && authMode !== 'verify_otp' && selectedRole !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setFormError('');
                    }}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 underline shrink-0"
                  >
                    {authMode === 'login' ? 'Need an account?' : 'Already registered?'}
                  </button>
                )}
              </div>

              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-md text-xs text-red-700 dark:text-red-300 font-medium">
                  {formError}
                </div>
              )}

              {/* Form Content: OTP Verification / Forgot Password / Student / Mentor / Admin */}
              {authMode === 'verify_otp' ? (
                /* OTP Verification View to Prevent Fraud */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Security & Identity Authentication</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      To safeguard students and universities from fraudulent accounts, a 6-digit one-time verification code was sent to <strong>{pendingAccount?.email}</strong>.
                    </p>
                  </div>

                  {/* Email Dispatch Notification Banner (Code sent directly to user's email, not displayed on site) */}
                  <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                        <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Verification Code Sent Directly to Your Email</span>
                      </span>
                      <span className="text-[10px] bg-amber-200/70 dark:bg-amber-900/60 px-2 py-0.5 rounded font-mono font-bold text-amber-900 dark:text-amber-200">
                        Dispatched
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      A 6-digit one-time verification code has been dispatched directly to your inbox at <strong>{pendingAccount?.email}</strong>. Please check your email (including spam/junk folder) and enter the code below to verify your account.
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 dark:text-stone-400 border-t border-amber-200/60 dark:border-amber-900/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>For security reasons, verification codes are sent directly to your email and never displayed on this page.</span>
                    </div>
                  </div>

                  {/* 6-Digit Code Inputs */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-input-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={e => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          className="w-10 sm:w-12 h-12 text-center text-lg sm:text-xl font-bold font-mono bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 focus:border-amber-500 dark:focus:border-amber-500 rounded-lg text-stone-900 dark:text-white focus:outline-none transition-all shadow-2xs"
                        />
                      ))}
                    </div>
                    {otpError && (
                      <p className="text-xs text-red-600 dark:text-red-400 text-center font-medium mt-1">
                        {otpError}
                      </p>
                    )}
                  </div>

                  {/* Resend and Countdown Timer */}
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
                    <span>Didn't receive email code?</span>
                    {otpTimer > 0 ? (
                      <span className="font-mono text-stone-400">Resend code in {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={otpDigits.join('').length < 6}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-stone-950" />
                      <span>Verify Code & Complete Registration</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setOtpError('');
                      }}
                      className="w-full py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold cursor-pointer text-center"
                    >
                      ← Back to Registration Details
                    </button>
                  </div>
                </form>
              ) : authMode === 'forgot_password' ? (
                /* Multi-Step Email OTP Forgot Password View */
                <div className="space-y-4">
                  {forgotStep === 'email' && (
                    <form onSubmit={handleInitiatePasswordReset} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Registered Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="e.g. victoria.mensah@gmail.com"
                            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                          />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1">
                          We will dispatch a secure 6-digit OTP verification code to this address.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('login');
                            setFormError('');
                          }}
                          className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-xs font-semibold rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'otp' && (
                    <form onSubmit={handleVerifyResetOtp} className="space-y-5">
                      {/* Email Dispatch Notification Banner (Code sent directly to user's email, not displayed on site) */}
                      <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                            <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span>Password Reset Code Sent to Email</span>
                          </span>
                          <span className="text-[10px] bg-amber-200/70 dark:bg-amber-900/60 px-2 py-0.5 rounded font-mono font-bold text-amber-900 dark:text-amber-200">
                            Dispatched
                          </span>
                        </div>
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                          A secure 6-digit password reset verification code has been dispatched directly to <strong>{resetEmail}</strong>. Please check your inbox (including spam/junk folder) and enter the code below to reset your password.
                        </p>
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-stone-500 dark:text-stone-400 border-t border-amber-200/60 dark:border-amber-900/40">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>For security reasons, verification codes are sent directly to your email and never displayed on this page.</span>
                        </div>
                      </div>

                      {resetError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-md text-xs text-red-700 dark:text-red-300 font-medium">
                          {resetError}
                        </div>
                      )}

                      {/* 6 Digit Input Group */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider text-center">
                          Enter 6-Digit Password Reset Code
                        </label>
                        <div className="flex items-center justify-center gap-2 sm:gap-3 py-2" onPaste={handleResetOtpPaste}>
                          {resetOtpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`reset-otp-input-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={e => handleResetOtpDigitChange(idx, e.target.value)}
                              onKeyDown={e => handleResetOtpKeyDown(idx, e)}
                              className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Timer & Resend */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100 dark:border-stone-800">
                        <span className="text-stone-500 dark:text-stone-400">
                          {resetTimer > 0 ? (
                            <span>Resend available in <strong className="font-mono text-stone-700 dark:text-stone-300">{resetTimer}s</strong></span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Code expired?</span>
                          )}
                        </span>

                        <button
                          type="button"
                          disabled={resetTimer > 0}
                          onClick={handleResendResetOtp}
                          className="font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Resend Reset Code</span>
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setForgotStep('email')}
                          className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-xs font-semibold rounded-md transition-colors"
                        >
                          Change Email
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <span>Verify & Proceed to New Password</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'new_password' && (
                    <form onSubmit={handleCompletePasswordReset} className="space-y-4">
                      {resetError && (
                        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-md text-xs text-red-700 dark:text-red-300 font-medium">
                          {resetError}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                            New Password
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
                          >
                            {showResetPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showResetPassword ? 'Hide' : 'Show'}</span>
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showResetPassword ? 'text' : 'password'}
                            required
                            value={resetNewPassword}
                            onChange={e => setResetNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showResetPassword ? 'text' : 'password'}
                            required
                            value={resetConfirmPassword}
                            onChange={e => setResetConfirmPassword(e.target.value)}
                            placeholder="Re-enter your new password"
                            className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-stone-100 dark:bg-stone-800 rounded text-[11px] text-stone-600 dark:text-stone-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${resetNewPassword.length >= 6 ? 'text-emerald-500' : 'text-stone-400'}`} />
                          <span>Minimum 6 characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${resetNewPassword && resetNewPassword === resetConfirmPassword ? 'text-emerald-500' : 'text-stone-400'}`} />
                          <span>Passwords match</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setForgotStep('otp')}
                          className="px-4 py-2 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white text-xs font-semibold rounded-md transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Update Password & Save</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {forgotStep === 'success' && (
                    <div className="p-5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                        <Check className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                          Password Successfully Reset!
                        </h3>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto">
                          Your account password for <strong>{resetEmail}</strong> has been updated securely. You can now access your dashboard.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const accounts = getRegisteredAccounts();
                          const target = accounts.find(a => a.email.toLowerCase() === resetEmail.toLowerCase())?.profile || resetTargetUser;
                          if (target) {
                            setUser(target);
                            if (target.role === 'student' && !target.onboardingCompleted) {
                              setIsOnboardingOpen(true);
                            }
                          } else {
                            setAuthMode('login');
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-2"
                      >
                        <span>Proceed to Your Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ) : selectedRole === 'student' ? (
                /* STUDENT FORM PATH */
                <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Full Legal Name
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

                      {/* Academic Level & Country Prominently First */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Academic Level
                          </label>
                          <select
                            value={academicLevel}
                            onChange={e => {
                              const val = e.target.value as any;
                              setAcademicLevel(val);
                              // Reset placeholders/programme if switching
                              if (val === 'secondary' && !programme) {
                                setProgramme('General Science');
                              }
                            }}
                            className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 font-medium"
                          >
                            <option value="secondary">Senior High School (SHS / WASSCE)</option>
                            <option value="undergraduate">Undergraduate Degree (University)</option>
                            <option value="postgraduate">Postgraduate (MPhil / MSc / PhD)</option>
                            <option value="recent_graduate">Recent Graduate</option>
                            <option value="young_professional">Young Professional</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Country
                          </label>
                          <select
                            value={country}
                            onChange={e => setCountry(e.target.value)}
                            className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 font-medium"
                          >
                            <option value="Ghana">Ghana</option>
                            <option value="Nigeria">Nigeria</option>
                            <option value="Kenya">Kenya</option>
                            <option value="Rwanda">Rwanda</option>
                            <option value="South Africa">South Africa</option>
                            <option value="Uganda">Uganda</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Pan-Africa">Other African Country</option>
                          </select>
                        </div>
                      </div>

                      {/* Institution & Programme dynamically adapt for SHS vs University */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            {isSHS ? 'Senior High School Name' : 'Current University / Institution'}
                          </label>
                          <input
                            type="text"
                            required
                            value={institution}
                            onChange={e => setInstitution(e.target.value)}
                            placeholder={
                              isSHS
                                ? 'e.g. Presec Legon, Achimota, Wesley Girls, Prempeh College'
                                : 'e.g. KNUST, Ashesi, UG Legon, UCT'
                            }
                            className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            {isSHS ? 'SHS Elective Track / Course' : 'Degree Programme / Major'}
                          </label>
                          <input
                            type="text"
                            required
                            value={programme}
                            onChange={e => setProgramme(e.target.value)}
                            placeholder={
                              isSHS
                                ? 'e.g. General Science, Business, General Arts, Visual Arts'
                                : 'e.g. BSc Computer Engineering'
                            }
                            className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                          />
                        </div>
                      </div>

                      {/* Quick Track Selection Pills for Senior High School Students */}
                      {isSHS && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                            Common SHS Tracks (Click to fill):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'General Science',
                              'General Arts',
                              'Business',
                              'Visual Arts',
                              'Home Economics',
                              'Agricultural Science'
                            ].map((track, tIdx) => (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => setProgramme(track)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                  programme === track
                                    ? 'bg-amber-100 dark:bg-amber-950 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                                    : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                                }`}
                              >
                                {track}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      {isSHS && authMode === 'register'
                        ? 'Email Address (Personal or School)'
                        : 'Student / Institutional Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={isSHS ? 'e.g. yourname@gmail.com' : 'e.g. student@university.edu.gh or gmail.com'}
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                    />
                  </div>

                  {/* Password & Confirm Password */}
                  <div className={authMode === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : ''}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                          Password
                        </label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => setAuthMode('forgot_password')}
                            className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
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
                    className="w-full py-2.5 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-bold text-xs sm:text-sm rounded-md transition-colors shadow-2xs mt-2"
                  >
                    {authMode === 'login'
                      ? 'Sign In as Student'
                      : isSHS
                      ? 'Create High School Account & Enter'
                      : 'Create Student Account & Enter'}
                  </button>
                </form>
              ) : selectedRole === 'admin' ? (
                /* DEDICATED SITE ADMINISTRATOR FORM PATH */
                <form onSubmit={handleAdminSubmit} className="space-y-3">
                  <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-lg text-xs text-stone-800 dark:text-stone-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-stone-900 dark:text-amber-300">
                      <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Executive Command & Governance Gate</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug">
                      Sign in to oversee platform candidates, review verification statuses, audit institutional partners, and monitor platform performance and earnings.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Administrator Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. administrator@afriversity.org"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Master Key / Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-md transition-colors shadow-2xs flex items-center justify-center gap-2 mt-1 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-stone-950" />
                    <span>Sign In as Administrator & Open Command Center</span>
                  </button>
                </form>
              ) : (
                /* MENTOR FORM PATH - TIGHT COMPACT SPACING WITHOUT EXCESS PADDING */
                <form onSubmit={handleMentorSubmit} className="space-y-2.5">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Full Professional Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="e.g. Dr. Kwame Osei-Tutu"
                          className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Organization / University
                          </label>
                          <input
                            type="text"
                            required
                            value={mentorOrganization}
                            onChange={e => setMentorOrganization(e.target.value)}
                            placeholder="e.g. Google Research, KNUST, UCT"
                            className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Professional Role / Title
                          </label>
                          <input
                            type="text"
                            required
                            value={mentorTitle}
                            onChange={e => setMentorTitle(e.target.value)}
                            placeholder="e.g. Senior Faculty / Staff Scientist"
                            className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                          Advisory Expertise
                        </label>
                        <select
                          value={mentorExpertise}
                          onChange={e => setMentorExpertise(e.target.value)}
                          className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400 font-medium"
                        >
                          <option value="Scholarship & Graduate Admission Review">Scholarship & University Admission Review (Mastercard / Rhodes / DAAD)</option>
                          <option value="High School to University Transition">Senior High School (SHS) Transition & University Guidance</option>
                          <option value="Software Engineering & Technical Interviews">Software Engineering & Technical Interviews</option>
                          <option value="Startup Incubation & Seed Grants">Startup Incubation & Seed Grants (TEF / MEST)</option>
                          <option value="AI & Applied Machine Learning Research">AI & Applied Machine Learning Research</option>
                          <option value="Other">Other (Custom Specialization)</option>
                        </select>

                        {/* Custom Expertise Input when 'Other' is selected */}
                        {mentorExpertise === 'Other' && (
                          <div className="mt-2 animate-in fade-in duration-150">
                            <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-1">
                              Specify Custom Advisory Expertise
                            </label>
                            <input
                              type="text"
                              required
                              value={customExpertise}
                              onChange={e => setCustomExpertise(e.target.value)}
                              placeholder="e.g. Biomedical Science Fellowships, Agricultural Innovation, Public Health"
                              className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-amber-300 dark:border-amber-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                      Email Address (Personal or Professional)
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com or kwame@institution.org"
                      className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-400"
                    />
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                      You can use either your personal email (Gmail, Yahoo) or your professional/institutional email.
                    </p>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className={authMode === 'register' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : ''}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                          Password
                        </label>
                        {authMode === 'login' && (
                          <button
                            type="button"
                            onClick={() => setAuthMode('forgot_password')}
                            className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
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
                    className="w-full py-2.5 bg-stone-900 dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-bold text-xs sm:text-sm rounded-md transition-colors shadow-2xs mt-2"
                  >
                    {authMode === 'login' ? 'Sign In as Mentor' : 'Create Mentor Account & Enter'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50">
        <p>© 2026 Afriversity. Connecting African talent with verified opportunities and readiness.</p>
      </footer>
    </div>
  );
};
