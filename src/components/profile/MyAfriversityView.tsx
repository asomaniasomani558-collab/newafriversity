import React, { useState, useMemo } from 'react';
import { MentorProfileDeskView } from './MentorProfileDeskView';
import {
  User,
  GraduationCap,
  Target,
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Bell,
  Settings,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Upload,
  FileText,
  Globe,
  Award,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  ExternalLink,
  Check,
  AlertCircle,
  Eye,
  ArrowRight,
  School,
  RefreshCw,
  FolderCheck,
  Clock,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ProjectItem, ReadyDocumentItem, OpportunityType, UserProfile } from '../../types';

const DEFAULT_DOCUMENTS: ReadyDocumentItem[] = [
  {
    id: 'doc-wassce-transcript',
    name: 'Academic Transcript / WASSCE Results Slip',
    type: 'transcript',
    status: 'ready',
    fileName: 'Official_Transcript_Verified.pdf',
    fileSize: '1.8 MB',
    lastUpdated: '2026-09-15'
  },
  {
    id: 'doc-curriculum-vitae',
    name: 'Curriculum Vitae (CV) / Academic Resume',
    type: 'cv',
    status: 'ready',
    fileName: 'Afriversity_Tailored_CV.pdf',
    fileSize: '420 KB',
    lastUpdated: '2026-09-22'
  },
  {
    id: 'doc-statement-of-purpose',
    name: 'Statement of Purpose / Motivation Essay',
    type: 'sop',
    status: 'in_progress',
    fileName: 'Personal_Statement_Draft_v2.docx',
    fileSize: '110 KB',
    lastUpdated: '2026-09-26'
  },
  {
    id: 'doc-recommendation-letters',
    name: 'Academic & Mentorship Recommendation Letters (2x)',
    type: 'recommendation',
    status: 'in_progress',
    fileName: 'Prof_Reference_Letter_Signed.pdf',
    fileSize: '890 KB',
    lastUpdated: '2026-09-18'
  },
  {
    id: 'doc-international-passport',
    name: 'Valid International Passport / National ID',
    type: 'passport',
    status: 'ready',
    fileName: 'Passport_Bio_Page_Scan.jpg',
    fileSize: '2.4 MB',
    lastUpdated: '2026-09-10'
  },
  {
    id: 'doc-standardized-tests',
    name: 'Standardized Test Score Report (SAT / GRE / IELTS)',
    type: 'test_score',
    status: 'missing',
    fileName: undefined,
    fileSize: undefined,
    lastUpdated: undefined
  },
  {
    id: 'doc-certificates-portfolio',
    name: 'Certificates of Achievement & Project Portfolio',
    type: 'portfolio',
    status: 'ready',
    fileName: 'Honors_and_Coding_Certificates.pdf',
    fileSize: '3.1 MB',
    lastUpdated: '2026-09-20'
  }
];

const PRESET_SUBJECTS = [
  'Core Mathematics',
  'Integrated Science',
  'English Language',
  'Elective Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Economics',
  'Government',
  'Geography',
  'Financial Accounting',
  'Computer Science',
  'Literature in English',
  'Social Studies'
];

const PRESET_SKILLS = [
  'Python',
  'Data Analysis',
  'System Design',
  'Academic Writing',
  'Public Speaking',
  'Scientific Research',
  'Leadership',
  'React / Web Development',
  'Machine Learning',
  'Project Management',
  'Community Organizing',
  'Financial Modeling'
];

const PRESET_GOALS = [
  'Full Tuition Undergraduate Scholarship',
  'Mastercard Foundation Scholars Program',
  'Software Engineering Summer Internship',
  'Master of Science Abroad (UK/US/Canada)',
  'Rhodes / Chevening Fellowship',
  'African Youth Leadership Fellowship',
  'DAAD Postgraduate Study Grant'
];

const TARGET_DESTINATIONS = [
  'Ghana',
  'Nigeria',
  'United Kingdom',
  'USA & Canada',
  'Europe (Germany, France, Netherlands)',
  'Pan-African Regional',
  'Global / Remote'
];

const OPPORTUNITY_TYPE_OPTIONS: { id: OpportunityType; label: string }[] = [
  { id: 'scholarship', label: 'Scholarships' },
  { id: 'admission', label: 'University Admissions' },
  { id: 'internship', label: 'Internships' },
  { id: 'fellowship', label: 'Fellowships' },
  { id: 'grant', label: 'Research Grants' },
  { id: 'competition', label: 'Competitions & Hackathons' }
];

export const MyAfriversityView: React.FC = () => {
  const { user, updateProfile, setActiveTab } = useApp();

  if (!user) return null;
  if (user.role === 'mentor') {
    return <MentorProfileDeskView />;
  }

  // Active step: 1 (Personal), 2 (Education), 3 (Goals & Experience), 4 (Documents & Readiness)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '+233 24 000 0000',
    country: user.country || 'Ghana',
    city: user.city || 'Accra',
    dateOfBirth: user.dateOfBirth || '2005-06-15',
    avatarUrl: user.avatarUrl || '',
    bio: user.bio || (user.academicLevel === 'secondary'
      ? 'Aspiring software engineer and high school scholar dedicated to building scalable educational technology across Africa.'
      : 'Undergraduate researcher interested in artificial intelligence, agricultural automation, and African tech ecosystem growth.')
  });

  const [educationInfo, setEducationInfo] = useState({
    academicLevel: user.academicLevel || 'secondary',
    institution: user.institution || 'Prempeh College',
    programme: user.programme || 'General Science',
    targetDegree: user.targetDegree || 'BSc Computer Science & Engineering',
    graduationYear: user.graduationYear || 2026,
    gradeGpa: user.gradeGpa || 'WASSCE Aggregate 7 (Target 8 A1s)',
    relevantSubjects: user.relevantSubjects?.length ? user.relevantSubjects : ['Core Mathematics', 'Integrated Science', 'English Language', 'Elective Mathematics', 'Physics', 'Chemistry']
  });

  const [experienceInfo, setExperienceInfo] = useState<{
    interests: string[];
    skills: string[];
    goals: string[];
    projects: ProjectItem[];
    targetCountries: string[];
    opportunityTypes: OpportunityType[];
    currentPriority: string;
  }>({
    interests: user.interests?.length ? user.interests : ['Technology', 'Scholarships', 'University Admissions'],
    skills: user.skills?.length ? user.skills : ['Python', 'Problem Solving', 'Data Analysis', 'Leadership'],
    goals: user.goals?.length ? user.goals : ['Full Tuition Undergraduate Scholarship', 'Software Engineering Internship'],
    projects: user.projects?.length ? user.projects : [
      {
        id: 'proj-1',
        title: 'AgriSense Crop Health Predictor',
        role: 'Lead Developer',
        description: 'Machine learning model predicting maize crop diseases from leaf photographs with 93% accuracy.',
        techStack: ['Python', 'TensorFlow', 'FastAPI'],
        link: 'https://github.com/scholar/agrisense'
      },
      {
        id: 'proj-2',
        title: 'Afriversity Student Opportunity Matcher',
        role: 'Frontend Contributor',
        description: 'Built interactive eligibility checklist modules for West African senior high candidates.',
        techStack: ['TypeScript', 'React', 'TailwindCSS'],
        link: 'https://github.com/scholar/opp-matcher'
      }
    ],
    targetCountries: user.preferences?.targetCountries?.length ? user.preferences.targetCountries : ['Ghana', 'USA & Canada', 'United Kingdom'],
    opportunityTypes: (user.preferences?.opportunityTypes?.length ? user.preferences.opportunityTypes : ['scholarship', 'admission', 'internship']) as OpportunityType[],
    currentPriority: user.currentPriority || 'Finalize Statement of Purpose and request academic references'
  });

  const [readyDocs, setReadyDocs] = useState<ReadyDocumentItem[]>(() => {
    return user.readyDocuments?.length ? user.readyDocuments : DEFAULT_DOCUMENTS;
  });

  // UI States
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState<ProjectItem>({
    id: '',
    title: '',
    role: '',
    description: '',
    techStack: [],
    link: ''
  });
  const [newProjectTechInput, setNewProjectTechInput] = useState('');

  // Calculate dynamic completeness score across all 4 sections
  const dynamicCompleteness = useMemo(() => {
    let score = 0;
    // Step 1: Personal (25 pts)
    if (personalInfo.fullName.trim()) score += 7;
    if (personalInfo.email.trim()) score += 6;
    if (personalInfo.phone.trim()) score += 6;
    if (personalInfo.country && personalInfo.city) score += 6;

    // Step 2: Education (25 pts)
    if (educationInfo.institution.trim()) score += 8;
    if (educationInfo.programme.trim()) score += 7;
    if (educationInfo.gradeGpa.trim()) score += 5;
    if (educationInfo.relevantSubjects.length >= 3) score += 5;

    // Step 3: Goals & Projects (25 pts)
    if (experienceInfo.skills.length >= 2) score += 8;
    if (experienceInfo.goals.length >= 1) score += 8;
    if (experienceInfo.projects.length >= 1) score += 9;

    // Step 4: Documents (25 pts)
    const readyCount = readyDocs.filter(d => d.status === 'ready').length;
    score += Math.min(25, readyCount * 4);

    return Math.min(100, Math.max(10, score));
  }, [personalInfo, educationInfo, experienceInfo, readyDocs]);

  const handleSaveProfile = () => {
    const updatedData: Partial<UserProfile> = {
      fullName: personalInfo.fullName.trim(),
      email: personalInfo.email.trim(),
      phone: personalInfo.phone.trim(),
      country: personalInfo.country,
      city: personalInfo.city,
      dateOfBirth: personalInfo.dateOfBirth,
      avatarUrl: personalInfo.avatarUrl,
      bio: personalInfo.bio,

      academicLevel: educationInfo.academicLevel as any,
      institution: educationInfo.institution.trim(),
      programme: educationInfo.programme.trim(),
      targetDegree: educationInfo.targetDegree.trim(),
      graduationYear: Number(educationInfo.graduationYear),
      gradeGpa: educationInfo.gradeGpa.trim(),
      relevantSubjects: educationInfo.relevantSubjects,

      interests: experienceInfo.interests,
      skills: experienceInfo.skills,
      goals: experienceInfo.goals,
      projects: experienceInfo.projects,
      preferences: {
        targetCountries: experienceInfo.targetCountries,
        fundingTypes: user.preferences?.fundingTypes || ['Fully Funded'],
        remoteOnly: user.preferences?.remoteOnly || false,
        opportunityTypes: experienceInfo.opportunityTypes
      },
      currentPriority: experienceInfo.currentPriority,
      readyDocuments: readyDocs,
      profileCompleteness: dynamicCompleteness
    };

    updateProfile(updatedData);

    // Also persist in local registered accounts if user was registered
    try {
      const stored = localStorage.getItem('afriversity_registered_accounts');
      if (stored) {
        const accounts = JSON.parse(stored);
        const idx = accounts.findIndex((a: any) => a.email.toLowerCase() === user.email.toLowerCase());
        if (idx !== -1) {
          accounts[idx].profile = { ...accounts[idx].profile, ...updatedData };
          localStorage.setItem('afriversity_registered_accounts', JSON.stringify(accounts));
        }
      }
    } catch (e) {
      console.error(e);
    }

    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  // Helper actions for Subject Tags
  const addSubject = (subjectName: string) => {
    const clean = subjectName.trim();
    if (!clean || educationInfo.relevantSubjects.includes(clean)) return;
    setEducationInfo(prev => ({ ...prev, relevantSubjects: [...prev.relevantSubjects, clean] }));
    setCustomSubjectInput('');
  };

  const removeSubject = (subjectName: string) => {
    setEducationInfo(prev => ({
      ...prev,
      relevantSubjects: prev.relevantSubjects.filter(s => s !== subjectName)
    }));
  };

  // Helper actions for Skills
  const addSkill = (skill: string) => {
    const clean = skill.trim();
    if (!clean || experienceInfo.skills.includes(clean)) return;
    setExperienceInfo(prev => ({ ...prev, skills: [...prev.skills, clean] }));
    setCustomSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setExperienceInfo(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Helper actions for Goals
  const addGoal = (goal: string) => {
    const clean = goal.trim();
    if (!clean || experienceInfo.goals.includes(clean)) return;
    setExperienceInfo(prev => ({ ...prev, goals: [...prev.goals, clean] }));
    setCustomGoalInput('');
  };

  const removeGoal = (goal: string) => {
    setExperienceInfo(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }));
  };

  // Helper actions for Documents
  const toggleDocumentStatus = (docId: string) => {
    setReadyDocs(prev =>
      prev.map(doc => {
        if (doc.id === docId) {
          const nextStatus =
            doc.status === 'ready'
              ? 'in_progress'
              : doc.status === 'in_progress'
              ? 'missing'
              : 'ready';
          return {
            ...doc,
            status: nextStatus,
            fileName: nextStatus === 'ready' && !doc.fileName ? `${doc.name.replace(/[^a-zA-Z0-9]/g, '_')}_Upload.pdf` : doc.fileName,
            lastUpdated: nextStatus === 'ready' ? new Date().toISOString().split('T')[0] : doc.lastUpdated
          };
        }
        return doc;
      })
    );
  };

  const simulateDocUpload = (docId: string) => {
    const fakeSizes = ['1.2 MB', '840 KB', '2.1 MB', '650 KB', '3.4 MB'];
    const randomSize = fakeSizes[Math.floor(Math.random() * fakeSizes.length)];
    setReadyDocs(prev =>
      prev.map(doc => {
        if (doc.id === docId) {
          return {
            ...doc,
            status: 'ready',
            fileName: `${doc.name.split('/')[0].trim().replace(/\s+/g, '_')}_2026.pdf`,
            fileSize: randomSize,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return doc;
      })
    );
  };

  // Helper for adding project
  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.title.trim()) return;
    const projectToAdd: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newProjectForm.title.trim(),
      role: newProjectForm.role?.trim() || 'Contributor',
      description: newProjectForm.description.trim() || 'Academic or extracurricular project showcasing student competency.',
      techStack: newProjectTechInput.split(',').map(t => t.trim()).filter(Boolean),
      link: newProjectForm.link?.trim() || undefined
    };

    setExperienceInfo(prev => ({
      ...prev,
      projects: [projectToAdd, ...prev.projects]
    }));

    setNewProjectForm({ id: '', title: '', role: '', description: '', techStack: [], link: '' });
    setNewProjectTechInput('');
    setIsAddProjectModalOpen(false);
  };

  const removeProject = (index: number) => {
    setExperienceInfo(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const isSHS = educationInfo.academicLevel === 'secondary';

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 sm:p-7 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300">
                {isSHS ? 'SHS / WASSCE SCHOLAR DOSSIER' : 'TERTIARY SCHOLAR PROFILE'}
              </span>
              <span className="text-xs text-stone-400">·</span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Verified Learner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Create & Manage Your Profile
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Complete your four-part profile dossier to unlock verified scholarship matches, automated checklist generation, and tailored CV optimization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-200 dark:border-stone-700"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Dossier</span>
            </button>

            <button
              onClick={handleSaveProfile}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-stone-950" />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>

        {/* Dynamic Completeness Meter & Loop Indicator */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Overall Opportunity Readiness Completeness</span>
              </span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                {dynamicCompleteness}%
              </span>
            </div>

            <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${dynamicCompleteness}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>Personal: {personalInfo.fullName ? '✓ Done' : 'Pending'}</span>
              <span>Academics: {educationInfo.institution ? '✓ Done' : 'Pending'}</span>
              <span>Goals: {experienceInfo.skills.length >= 2 ? '✓ Done' : 'Pending'}</span>
              <span>Documents: {readyDocs.filter(d => d.status === 'ready').length} of {readyDocs.length} Ready</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex flex-col justify-center">
            <div className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">
              NEXT BEST STEP
            </div>
            <div className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 line-clamp-2">
              {experienceInfo.currentPriority}
            </div>
          </div>
        </div>

        {savedFeedback && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Profile dossier saved and synchronized across your readiness checklist!</span>
          </div>
        )}
      </div>

      {/* 4-Step Navigation Tabs Bar (Matches the 4 design images) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { stepNum: 1, label: 'Personal Information', sub: 'Bio & Contact', icon: User },
          { stepNum: 2, label: 'Education & Academics', sub: 'School & Subjects', icon: GraduationCap },
          { stepNum: 3, label: 'Goals & Experience', sub: 'Skills & Projects', icon: Target },
          { stepNum: 4, label: 'Documents & Readiness', sub: 'Transcripts & CV', icon: FolderCheck }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeStep === item.stepNum;
          return (
            <button
              key={item.stepNum}
              type="button"
              onClick={() => setActiveStep(item.stepNum as any)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                isActive
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 dark:border-amber-500/70 shadow-xs'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-stone-500 dark:text-stone-400">
                  Step {item.stepNum}
                </div>
                <div className={`text-xs font-bold truncate ${
                  isActive ? 'text-stone-950 dark:text-amber-400' : 'text-stone-800 dark:text-stone-200'
                }`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {item.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* STEP 1: PERSONAL INFORMATION (Image 1) */}
      {activeStep === 1 && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 space-y-6 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-500" />
                <span>Step 1: Personal Details & Contact</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Official student identity used on institutional applications and international visas.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              1 of 4
            </span>
          </div>

          {/* Profile Photo / Avatar Simulation */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-stone-950 font-extrabold text-xl flex items-center justify-center border-2 border-white dark:border-stone-900 shadow-sm shrink-0">
              {personalInfo.fullName
                ? personalInfo.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                : 'AF'}
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-stone-900 dark:text-white">
                Official Scholar Profile Avatar
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Generated from your full legal name. Photos must be clear and front-facing for admissions reviews.
              </p>
              <button
                type="button"
                onClick={() => alert('Profile photo upload simulated successfully.')}
                className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Change Photo / Upload Scan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  required
                  value={personalInfo.fullName}
                  onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder="e.g. Samuel Kwame Osei"
                  className="w-full text-xs pl-9 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Primary Contact Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="email"
                  required
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="e.g. samuel.osei@afriversity.org"
                  className="w-full text-xs pl-9 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Phone Number (WhatsApp Active) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+233 24 123 4567"
                  className="w-full text-xs pl-9 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={e => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  className="w-full text-xs pl-9 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Country of Residence & Citizenship
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <select
                  value={personalInfo.country}
                  onChange={e => setPersonalInfo({ ...personalInfo, country: e.target.value })}
                  className="w-full text-xs pl-9 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                >
                  <option value="Ghana">Ghana</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  value={personalInfo.city}
                  onChange={e => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  placeholder="e.g. Kumasi, Ashanti Region"
                  className="w-full text-xs pl-9 p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Personal Bio / Candidate Summary
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {personalInfo.bio.length} characters
              </span>
            </div>
            <textarea
              rows={3}
              value={personalInfo.bio}
              onChange={e => setPersonalInfo({ ...personalInfo, bio: e.target.value })}
              placeholder="Highlight your academic focus, career ambition, and personal drive..."
              className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Next: Academic background & school subjects
            </span>
            <button
              type="button"
              onClick={() => {
                handleSaveProfile();
                setActiveStep(2);
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Education</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EDUCATION DETAILS & ACADEMIC BACKGROUND (Image 2) */}
      {activeStep === 2 && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 space-y-6 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-500" />
                <span>Step 2: Education Details & Academic Standing</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Senior High School WASSCE tracks, university institutions, and core courses.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              2 of 4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Academic Level *
              </label>
              <select
                value={educationInfo.academicLevel}
                onChange={e => setEducationInfo({ ...educationInfo, academicLevel: e.target.value as any })}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              >
                <option value="secondary">Senior High School (SHS / WASSCE Candidate)</option>
                <option value="undergraduate">Undergraduate Degree Student</option>
                <option value="postgraduate">Postgraduate (Masters / PhD Candidate)</option>
                <option value="recent_graduate">Recent Graduate (1-2 Years Post-Study)</option>
                <option value="young_professional">Young Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Current Institution / School Name *
              </label>
              <input
                type="text"
                required
                value={educationInfo.institution}
                onChange={e => setEducationInfo({ ...educationInfo, institution: e.target.value })}
                placeholder="e.g. Prempeh College or University of Ghana"
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Degree Programme / Major Track *
              </label>
              <input
                type="text"
                required
                value={educationInfo.programme}
                onChange={e => setEducationInfo({ ...educationInfo, programme: e.target.value })}
                placeholder="e.g. General Science or Computer Science"
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Target Degree / Aspiring Programme
              </label>
              <input
                type="text"
                value={educationInfo.targetDegree}
                onChange={e => setEducationInfo({ ...educationInfo, targetDegree: e.target.value })}
                placeholder="e.g. BSc Computer Engineering or MSc Data Science"
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Expected / Graduation Year
              </label>
              <input
                type="number"
                value={educationInfo.graduationYear}
                onChange={e => setEducationInfo({ ...educationInfo, graduationYear: Number(e.target.value) })}
                min={2024}
                max={2035}
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                Grade / GPA / WASSCE Standing
              </label>
              <input
                type="text"
                value={educationInfo.gradeGpa}
                onChange={e => setEducationInfo({ ...educationInfo, gradeGpa: e.target.value })}
                placeholder="e.g. WASSCE Aggregate 7 or GPA 3.85 / 4.0"
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Interactive Core Subjects & Relevant Courses */}
          <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Relevant Courses & Core WASSCE Subjects
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  Click suggested subjects to add them, or type your own subject below.
                </p>
              </div>
              <span className="text-[11px] font-mono text-stone-500">
                {educationInfo.relevantSubjects.length} subjects added
              </span>
            </div>

            {/* Active Subjects Chips */}
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 min-h-[48px]">
              {educationInfo.relevantSubjects.map(sub => (
                <span
                  key={sub}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-600 shadow-2xs"
                >
                  <BookOpen className="w-3 h-3 text-amber-500" />
                  <span>{sub}</span>
                  <button
                    type="button"
                    onClick={() => removeSubject(sub)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-white ml-0.5"
                    title={`Remove ${sub}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {educationInfo.relevantSubjects.length === 0 && (
                <span className="text-xs text-stone-400 italic">No subjects added yet. Pick from the suggestions below.</span>
              )}
            </div>

            {/* Custom Subject Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customSubjectInput}
                onChange={e => setCustomSubjectInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubject(customSubjectInput);
                  }
                }}
                placeholder="Type a custom subject and press Add or Enter..."
                className="flex-1 text-xs p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => addSubject(customSubjectInput)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Subject</span>
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-stone-400 font-semibold">
                Quick-Add WASSCE & University Subjects:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SUBJECTS.map(subj => {
                  const isAdded = educationInfo.relevantSubjects.includes(subj);
                  return (
                    <button
                      key={subj}
                      type="button"
                      disabled={isAdded}
                      onClick={() => addSubject(subj)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-all ${
                        isAdded
                          ? 'bg-stone-100 dark:bg-stone-800/40 text-stone-400 border-transparent cursor-default'
                          : 'bg-stone-100 hover:bg-amber-100 dark:bg-stone-800 dark:hover:bg-amber-950/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 cursor-pointer'
                      }`}
                    >
                      {isAdded ? `✓ ${subj}` : `+ ${subj}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Personal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveProfile();
                setActiveStep(3);
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Goals & Experience</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GOALS, SKILLS & PROJECTS (Image 3) */}
      {activeStep === 3 && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 space-y-6 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>Step 3: Interests, Goals & Practical Experience</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Match your profile with international opportunities, skills benchmarks, and practical project portfolios.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              3 of 4
            </span>
          </div>

          {/* Opportunity Types Multi-Select */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Target Opportunity Categories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPPORTUNITY_TYPE_OPTIONS.map(opt => {
                const isSelected = experienceInfo.opportunityTypes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setExperienceInfo(prev => ({
                        ...prev,
                        opportunityTypes: isSelected
                          ? prev.opportunityTypes.filter(t => t !== opt.id)
                          : [...prev.opportunityTypes, opt.id]
                      }));
                    }}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-stone-900 dark:text-amber-300'
                        : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected ? <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <Plus className="w-3.5 h-3.5 text-stone-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Goals */}
          <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Primary Aspirations & Target Milestones
              </label>
              <span className="text-[11px] font-mono text-stone-500">
                {experienceInfo.goals.length} goals set
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 min-h-[48px]">
              {experienceInfo.goals.map(goal => (
                <span
                  key={goal}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-600 shadow-2xs"
                >
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>{goal}</span>
                  <button
                    type="button"
                    onClick={() => removeGoal(goal)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-white ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customGoalInput}
                onChange={e => setCustomGoalInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGoal(customGoalInput);
                  }
                }}
                placeholder="Type a specific goal (e.g. Master's in Robotics in Germany)..."
                className="flex-1 text-xs p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => addGoal(customGoalInput)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Goal</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_GOALS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addGoal(preset)}
                  disabled={experienceInfo.goals.includes(preset)}
                  className="text-[11px] px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-40"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Competencies & Skills */}
          <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Competencies, Tools & Technical Skills
              </label>
              <span className="text-[11px] font-mono text-stone-500">
                {experienceInfo.skills.length} skills listed
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 min-h-[48px]">
              {experienceInfo.skills.map(sk => (
                <span
                  key={sk}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-600 shadow-2xs"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(sk)}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-white ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customSkillInput}
                onChange={e => setCustomSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(customSkillInput);
                  }
                }}
                placeholder="Type a competency (e.g. C++, GIS Mapping, Public Policy)..."
                className="flex-1 text-xs p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => addSkill(customSkillInput)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_SKILLS.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addSkill(preset)}
                  disabled={experienceInfo.skills.includes(preset)}
                  className="text-[11px] px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-40"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Practical Projects List */}
          <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Projects & Portfolio Evidence
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  High-impact academic or personal projects showing tangible execution.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProjectModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {experienceInfo.projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-white">
                        {proj.title}
                      </h4>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold font-mono">
                        {proj.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-stone-400 hover:text-rose-500 p-1 rounded"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug line-clamp-2">
                    {proj.description}
                  </p>

                  {proj.techStack && proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack.map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-mono"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>{proj.link}</span>
                    </a>
                  )}
                </div>
              ))}
              {experienceInfo.projects.length === 0 && (
                <div className="col-span-2 p-6 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 text-center text-xs text-stone-500">
                  No projects attached yet. Click "+ Add Project" to showcase your coding, research, or leadership work.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Education</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveProfile();
                setActiveStep(4);
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Continue to Documents & Checklist</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DOCUMENTS READINESS & VERIFICATION CHECKLIST (Image 4) */}
      {activeStep === 4 && (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 space-y-6 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <FolderCheck className="w-4 h-4 text-amber-500" />
                <span>Step 4: Document Readiness & Verification Checklist</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Keep key admissions credentials uploaded and marked ready so you can apply to deadlines in minutes.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              4 of 4
            </span>
          </div>

          {/* Document Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
                {readyDocs.filter(d => d.status === 'ready').length}
              </div>
              <div className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-400">
                Documents Ready
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-center">
              <div className="text-xl font-bold font-mono text-amber-800 dark:text-amber-300">
                {readyDocs.filter(d => d.status === 'in_progress').length}
              </div>
              <div className="text-[11px] font-semibold text-amber-900 dark:text-amber-400">
                In Drafting / Review
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-center">
              <div className="text-xl font-bold font-mono text-stone-700 dark:text-stone-300">
                {readyDocs.filter(d => d.status === 'missing').length}
              </div>
              <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                Missing / Required
              </div>
            </div>
          </div>

          {/* Document Checkbox & Upload Cards */}
          <div className="space-y-3">
            {readyDocs.map(doc => {
              const isReady = doc.status === 'ready';
              const isInProgress = doc.status === 'in_progress';
              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isReady
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                      : isInProgress
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80'
                      : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDocumentStatus(doc.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        isReady
                          ? 'bg-emerald-600 text-white'
                          : isInProgress
                          ? 'bg-amber-500 text-stone-950'
                          : 'border-2 border-stone-300 dark:border-stone-600 text-transparent'
                      }`}
                      title="Click to toggle status: Ready -> In Progress -> Missing"
                    >
                      {isReady ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : isInProgress ? <Clock className="w-3.5 h-3.5" /> : null}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900 dark:text-white">
                          {doc.name}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                            isReady
                              ? 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300'
                              : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                          }`}
                        >
                          {isReady ? 'Ready' : isInProgress ? 'In Progress' : 'Missing'}
                        </span>
                      </div>

                      {doc.fileName ? (
                        <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-2 font-mono">
                          <FileText className="w-3 h-3 text-stone-400" />
                          <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                            {doc.fileName}
                          </span>
                          {doc.fileSize && (
                            <span className="text-stone-400">({doc.fileSize})</span>
                          )}
                          {doc.lastUpdated && (
                            <span className="text-stone-400">· Updated {doc.lastUpdated}</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500 italic">
                          No file attached yet. Upload scan or mark ready when prepared.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {doc.type === 'cv' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('cv-assistant')}
                        className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>AI Assistant</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => simulateDocUpload(doc.id)}
                      className="px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold border border-stone-200 dark:border-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{doc.fileName ? 'Replace File' : 'Upload File'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setActiveStep(3)}
              className="px-4 py-2 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs rounded-md transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Goals</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleSaveProfile();
                setIsPreviewModalOpen(true);
              }}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-md transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-stone-950" />
              <span>Save & View Completed Dossier</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRACTICAL PROJECT */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-500" />
                <span>Add Practical Project to Dossier</span>
              </h3>
              <button
                onClick={() => setIsAddProjectModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProjectSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectForm.title}
                  onChange={e => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                  placeholder="e.g. Automated Solar Irrigation System"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Role / Contribution
                </label>
                <input
                  type="text"
                  value={newProjectForm.role}
                  onChange={e => setNewProjectForm({ ...newProjectForm, role: e.target.value })}
                  placeholder="e.g. Lead Researcher, Software Engineer, Team Captain"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Description & Impact
                </label>
                <textarea
                  rows={3}
                  value={newProjectForm.description}
                  onChange={e => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  placeholder="Describe the challenge solved, methodologies used, and measurable results achieved..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Technologies / Tools (comma separated)
                </label>
                <input
                  type="text"
                  value={newProjectTechInput}
                  onChange={e => setNewProjectTechInput(e.target.value)}
                  placeholder="Python, Arduino, React, SolidWorks, Statistical Analysis"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase mb-1">
                  Project Link / Repository / Demo URL
                </label>
                <input
                  type="url"
                  value={newProjectForm.link}
                  onChange={e => setNewProjectForm({ ...newProjectForm, link: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-3.5 py-1.5 text-stone-600 dark:text-stone-400 hover:bg-stone-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-bold rounded"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPREHENSIVE SCHOLAR DOSSIER PREVIEW */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                  AF
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                    Official Afriversity Scholar Dossier
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    Candidate Profile & Opportunity Verification Overview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto text-xs">
              {/* Header block */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <div className="space-y-1">
                  <div className="text-lg font-extrabold text-stone-900 dark:text-white">
                    {personalInfo.fullName || 'Scholar Name'}
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 font-semibold font-mono">
                    {educationInfo.programme} · {educationInfo.institution}
                  </div>
                  <div className="text-stone-500 dark:text-stone-400 flex items-center gap-3 text-[11px] pt-1">
                    <span>{personalInfo.city}, {personalInfo.country}</span>
                    <span>·</span>
                    <span>{personalInfo.email}</span>
                    <span>·</span>
                    <span>{personalInfo.phone}</span>
                  </div>
                </div>

                <div className="text-right space-y-1 shrink-0">
                  <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                    {dynamicCompleteness}% READY
                  </span>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Class of {educationInfo.graduationYear}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">Personal Statement</span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed italic bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700">
                  "{personalInfo.bio}"
                </p>
              </div>

              {/* Academics & Subjects */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 p-3.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40">
                  <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">Academic Standing</span>
                  <div className="font-bold text-stone-900 dark:text-white text-sm">
                    {educationInfo.gradeGpa}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Track: {educationInfo.academicLevel === 'secondary' ? 'Secondary / High School WASSCE' : 'Undergraduate'}
                  </div>
                </div>

                <div className="space-y-2 p-3.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/40">
                  <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">Aspirations</span>
                  <div className="font-bold text-stone-900 dark:text-white text-sm truncate">
                    {educationInfo.targetDegree || 'Degree Track'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    Destinations: {experienceInfo.targetCountries.join(', ')}
                  </div>
                </div>
              </div>

              {/* Core Subjects */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">Verified Subjects & Courses</span>
                <div className="flex flex-wrap gap-1.5">
                  {educationInfo.relevantSubjects.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">Competencies & Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {experienceInfo.skills.map(sk => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-semibold border border-amber-200 dark:border-amber-800">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Document Readiness */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">Document Readiness Status</span>
                <div className="grid grid-cols-2 gap-2">
                  {readyDocs.map(d => (
                    <div key={d.id} className="p-2 rounded bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px]">
                      <span className="truncate">{d.name}</span>
                      <span className={`font-mono font-bold shrink-0 ${d.status === 'ready' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'}`}>
                        {d.status === 'ready' ? '✓ READY' : d.status === 'in_progress' ? 'DRAFT' : 'MISSING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Verified candidate profile ready for partner scholarship portals.
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-bold text-xs rounded-md"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
