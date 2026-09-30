import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ApplicationStage,
  AuditLogEvent,
  ChecklistItem,
  NotificationItem,
  Opportunity,
  StudentApplication,
  University,
  UserProfile,
  MenteeReviewItem,
  LiveInterviewRequest,
  InterviewRubricScore,
  AdminActiveTab,
  MentorTimeSlot,
  PlatformTransaction
} from '../types';
import { VERIFIED_OPPORTUNITIES } from '../data/opportunities';
import { VERIFIED_UNIVERSITIES } from '../data/universities';
import { INITIAL_AUDIT_LOGS, INITIAL_PLATFORM_USERS } from '../data/mockUsers';

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  opportunities: Opportunity[];
  addOpportunity: (opp: Opportunity) => void;
  updateOpportunity: (id: string, updated: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
  platformUsers: UserProfile[];
  addPlatformUser: (u: UserProfile) => void;
  updatePlatformUser: (id: string, updated: Partial<UserProfile>) => void;
  deletePlatformUser: (id: string) => void;
  impersonateUser: (u: UserProfile) => void;
  auditLogs: AuditLogEvent[];
  addAuditLog: (log: Omit<AuditLogEvent, 'id' | 'timestamp'>) => void;
  resetPlatformData: () => void;
  savedOpportunityIds: string[];
  toggleSaveOpportunity: (oppId: string) => void;
  applications: StudentApplication[];
  updateApplicationStage: (oppId: string, stage: ApplicationStage) => void;
  toggleChecklistItem: (oppId: string, checkItemId: string) => void;
  updateApplicationNotes: (oppId: string, notes: string) => void;
  savedUniversityIds: string[];
  toggleSaveUniversity: (uniId: string) => void;
  selectedOpportunity: Opportunity | null;
  setSelectedOpportunity: (opp: Opportunity | null) => void;
  selectedUniversity: University | null;
  setSelectedUniversity: (uni: University | null) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  aiSuggestedPrompt: string;
  setAiSuggestedPrompt: (prompt: string) => void;
  askAiAboutOpportunity: (opp: Opportunity, query?: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  logout: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  recordPortalVisit: (oppId: string) => void;
  menteeReviews: MenteeReviewItem[];
  endorseMenteeReview: (reviewId: string, feedbackNotes?: string) => void;
  requestReviewChanges: (reviewId: string, feedbackNotes: string) => void;
  adminActiveTab: AdminActiveTab;
  setAdminActiveTab: (tab: AdminActiveTab) => void;
  isMentorOnboardingOpen: boolean;
  setIsMentorOnboardingOpen: (open: boolean) => void;
  interviewRequests: LiveInterviewRequest[];
  scheduleInterview: (requestId: string, scheduledTime: string, meetingLink?: string) => void;
  completeInterview: (requestId: string, rubric: InterviewRubricScore, mentorFeedback: string) => void;
  createInterviewRequest: (req: Omit<LiveInterviewRequest, 'id' | 'status' | 'createdAt'>) => void;
  mentorTimeSlots: MentorTimeSlot[];
  addMentorTimeSlot: (slot: Omit<MentorTimeSlot, 'id' | 'status' | 'createdAt'>) => void;
  removeMentorTimeSlot: (slotId: string) => void;
  bookMentorTimeSlot: (slotId: string, bookingDetails: { studentId: string; studentName: string; studentEmail: string; targetOpportunity: string; studentNotes: string }) => void;
  transactions: PlatformTransaction[];
  recordTransaction: (txn: Omit<PlatformTransaction, 'id' | 'date'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_APPLICATIONS: StudentApplication[] = [
  {
    id: 'app-1',
    opportunityId: 'opp-google-swe-intern-africa',
    opportunity: VERIFIED_OPPORTUNITIES[1],
    stage: 'preparing',
    updatedAt: '2026-09-25T10:00:00Z',
    savedDate: '2026-09-20T14:30:00Z',
    targetSubmissionDate: '2026-10-15',
    notes: 'Need to review Google X-Y-Z formula on CV project bullets and add portfolio link before applying.',
    checklist: [
      {
        id: 'doc-opp-google-swe-intern-africa-0',
        label: 'Tailored 1-page Technical CV / Resume (PDF)',
        action: 'Tailor CV to highlight opportunity keywords',
        completed: true,
        category: 'document'
      },
      {
        id: 'doc-opp-google-swe-intern-africa-1',
        label: 'Unofficial University Academic Transcript',
        action: 'Obtain stamped official transcript from academic registrar',
        completed: true,
        category: 'document'
      },
      {
        id: 'doc-opp-google-swe-intern-africa-2',
        label: 'GitHub / Portfolio link demonstrating technical projects',
        action: 'Add pinned projects with live demo or repository link',
        completed: false,
        category: 'document'
      }
    ],
    portalVisited: false,
    officialPortalUrl: 'https://careers.google.com/jobs/results/?q=intern%20software%20engineer%20africa'
  },
  {
    id: 'app-2',
    opportunityId: 'opp-mcf-knust-2026',
    opportunity: VERIFIED_OPPORTUNITIES[0],
    stage: 'saved',
    updatedAt: '2026-09-24T09:15:00Z',
    savedDate: '2026-09-24T09:15:00Z',
    targetSubmissionDate: '2026-10-20',
    notes: 'Mastercard Foundation full scholarship. Requesting 2 recommendation letters from academic referees.',
    checklist: [
      {
        id: 'doc-opp-mcf-knust-2026-0',
        label: 'Certified WASSCE / High School Certificate results slip',
        action: 'Obtain stamped official transcript from academic registrar',
        completed: true,
        category: 'document'
      },
      {
        id: 'doc-opp-mcf-knust-2026-1',
        label: 'Personal Statement & Transformative Leadership Essay (750 words)',
        action: 'Draft personal statement using the Application Assistant',
        completed: false,
        category: 'document'
      },
      {
        id: 'doc-opp-mcf-knust-2026-2',
        label: 'Two (2) Academic and Community Reference Letters',
        action: 'Request reference letter from professors or mentors 3 weeks in advance',
        completed: false,
        category: 'document'
      }
    ],
    portalVisited: false,
    officialPortalUrl: 'https://mcf.knust.edu.gh/'
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Google SWE Africa Deadline',
    message: 'Google Africa Internship deadline is approaching on Nov 15. Complete your portfolio link.',
    type: 'deadline',
    date: 'Today',
    read: false,
    linkAction: { type: 'application', targetId: 'opp-google-swe-intern-africa' }
  },
  {
    id: 'notif-2',
    title: 'KNUST MPhil Admissions Open',
    message: 'Official postgraduate admissions opened for academic year 2026/2027.',
    type: 'university',
    date: 'Yesterday',
    read: false,
    linkAction: { type: 'university', targetId: 'uni-knust' }
  },
  {
    id: 'notif-3',
    title: 'New Matched Opportunity',
    message: 'MTN Pulse Digital Apprenticeship in Accra matches your Telecom and Python skills.',
    type: 'match',
    date: '2 days ago',
    read: true,
    linkAction: { type: 'opportunity', targetId: 'opp-mtn-pulse-tech-intern-2026' }
  }
];

const INITIAL_MENTEE_REVIEWS: MenteeReviewItem[] = [
  {
    id: 'rev-1',
    studentId: 'usr-shs-1',
    studentName: 'Victoria Mensah',
    studentEmail: 'victoria.mensah@gmail.com',
    institution: 'Wesley Girls’ High School (Kumasi)',
    programme: 'General Science · WASSCE Candidate',
    targetOpp: 'Mastercard Foundation Scholars Program at KNUST',
    opportunityId: 'opp-mcf-knust-2026',
    documentType: 'essay',
    documentTitle: 'Leadership & Community Transformation Essay (750 words)',
    status: 'pending',
    submittedDate: '2026-09-26',
    priority: 'high'
  },
  {
    id: 'rev-2',
    studentId: 'usr-student-2',
    studentName: 'Kwame Asante',
    studentEmail: 'kwame.asante@st.knust.edu.gh',
    institution: 'KNUST · BSc Computer Engineering',
    programme: 'BSc Computer Engineering (3rd Year)',
    targetOpp: 'Google Africa Software Engineering Internship 2027',
    opportunityId: 'opp-google-swe-intern-africa',
    documentType: 'cv',
    documentTitle: 'Technical CV & Project System Design Portfolio',
    status: 'pending',
    submittedDate: '2026-09-27',
    priority: 'high'
  },
  {
    id: 'rev-3',
    studentId: 'usr-student-3',
    studentName: 'Amina Bello',
    studentEmail: 'amina.bello@unilag.edu.ng',
    institution: 'University of Lagos (UNILAG)',
    programme: 'BSc Electrical & Electronics Engineering',
    targetOpp: 'The Rhodes Scholarship for West Africa (Oxford)',
    opportunityId: 'opp-rhodes-west-africa',
    documentType: 'statement',
    documentTitle: 'Academic Statement of Purpose & Leadership Vision',
    status: 'pending',
    submittedDate: '2026-09-25',
    priority: 'medium'
  },
  {
    id: 'rev-4',
    studentId: 'usr-student-4',
    studentName: 'Emmanuel Kiprono',
    studentEmail: 'e.kiprono@uonbi.ac.ke',
    institution: 'University of Nairobi',
    programme: 'BSc Agricultural Economics',
    targetOpp: 'Oxford University Africa Graduate Scholarship',
    opportunityId: 'opp-oxford-africa-scholarship',
    documentType: 'essay',
    documentTitle: 'Transformative Agro-Tech Research Statement',
    status: 'endorsed',
    submittedDate: '2026-09-20',
    endorsementDate: '2026-09-24',
    feedbackNotes: 'Exemplary clarity in research rationale and economic impact metrics. Strongly recommended.',
    priority: 'normal'
  }
];

const INITIAL_INTERVIEW_REQUESTS: LiveInterviewRequest[] = [
  {
    id: 'int-req-1',
    studentId: 'usr-student-1',
    studentName: 'Victoria Mensah',
    studentEmail: 'victoria.mensah@ashesi.edu.gh',
    studentInstitution: 'Ashesi University',
    targetOpportunity: 'Google Software Engineering Internship Africa 2026',
    opportunityId: 'opp-google-swe-intern-africa',
    interviewType: 'technical',
    requestedDurationMinutes: 45,
    preferredTime: 'Thursday 16:00 GMT',
    studentNotes: 'I would appreciate a mock session focused on data structures, algorithmic complexity, and STAR behavioral answers about my African tech projects.',
    status: 'pending',
    createdAt: '2026-09-28T14:00:00Z'
  },
  {
    id: 'int-req-2',
    studentId: 'usr-student-2',
    studentName: 'Kwame Asante',
    studentEmail: 'kwame.asante@knust.edu.gh',
    studentInstitution: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    targetOpportunity: 'MTN Pulse Digital Apprenticeship 2026',
    opportunityId: 'opp-mtn-pulse-apprenticeship',
    interviewType: 'behavioral',
    requestedDurationMinutes: 30,
    preferredTime: 'Friday 15:30 GMT',
    studentNotes: 'Please evaluate my leadership answers on community telecommunications projects and my motivation for MTN Ghana.',
    status: 'scheduled',
    scheduledTime: 'Tomorrow at 15:30 GMT',
    meetingLink: 'https://meet.afriversity.org/live/kwame-asante-mtn',
    createdAt: '2026-09-27T09:30:00Z'
  },
  {
    id: 'int-req-3',
    studentId: 'usr-student-3',
    studentName: 'Amina Bello',
    studentEmail: 'amina.bello@unilag.edu.ng',
    studentInstitution: 'University of Lagos (UNILAG)',
    targetOpportunity: 'The Rhodes Scholarship for West Africa (Oxford)',
    opportunityId: 'opp-rhodes-west-africa',
    interviewType: 'scholarship',
    requestedDurationMinutes: 45,
    preferredTime: 'Saturday 11:00 GMT',
    studentNotes: 'Need tough cross-examination on my proposed Oxford research in micro-grid deployment and pan-African policy leadership.',
    status: 'pending',
    createdAt: '2026-09-29T11:15:00Z'
  }
];

const INITIAL_TIME_SLOTS: MentorTimeSlot[] = [
  {
    id: 'slot-1',
    mentorId: 'usr-mentor-1',
    mentorName: 'Dr. Joseph Boateng',
    mentorEmail: 'j.boateng@ashesi.edu.gh',
    date: '2026-10-02',
    startTime: '16:00',
    endTime: '16:45',
    durationMinutes: 45,
    interviewType: 'technical',
    status: 'booked',
    feeUsd: 25,
    bookedByStudentId: 'usr-shs-1',
    bookedByStudentName: 'Victoria Mensah',
    bookedByStudentEmail: 'victoria.mensah@gmail.com',
    targetOpportunity: 'Google Software Engineering Internship Africa 2026',
    studentNotes: 'Focus on STAR framework for African telemedicine project and algorithmic trees.',
    meetingLink: 'https://meet.afriversity.org/live/slot-1',
    createdAt: '2026-09-28T14:30:00Z'
  },
  {
    id: 'slot-2',
    mentorId: 'usr-mentor-1',
    mentorName: 'Dr. Joseph Boateng',
    mentorEmail: 'j.boateng@ashesi.edu.gh',
    date: '2026-10-03',
    startTime: '15:30',
    endTime: '16:00',
    durationMinutes: 30,
    interviewType: 'behavioral',
    status: 'booked',
    feeUsd: 25,
    bookedByStudentId: 'usr-student-2',
    bookedByStudentName: 'Kwame Asante',
    bookedByStudentEmail: 'kwame.asante@st.knust.edu.gh',
    targetOpportunity: 'MTN Pulse Digital Apprenticeship 2026',
    studentNotes: 'Mock behavioral questions regarding rural LoRa wireless mesh rollout in Kumasi.',
    meetingLink: 'https://meet.afriversity.org/live/slot-2',
    createdAt: '2026-09-28T15:00:00Z'
  },
  {
    id: 'slot-3',
    mentorId: 'usr-mentor-1',
    mentorName: 'Dr. Joseph Boateng',
    mentorEmail: 'j.boateng@ashesi.edu.gh',
    date: '2026-10-05',
    startTime: '14:00',
    endTime: '14:45',
    durationMinutes: 45,
    interviewType: 'technical',
    status: 'available',
    feeUsd: 25,
    meetingLink: 'https://meet.afriversity.org/live/slot-3',
    createdAt: '2026-09-29T09:00:00Z'
  },
  {
    id: 'slot-4',
    mentorId: 'usr-mentor-1',
    mentorName: 'Dr. Joseph Boateng',
    mentorEmail: 'j.boateng@ashesi.edu.gh',
    date: '2026-10-06',
    startTime: '17:00',
    endTime: '17:45',
    durationMinutes: 45,
    interviewType: 'scholarship',
    status: 'available',
    feeUsd: 25,
    meetingLink: 'https://meet.afriversity.org/live/slot-4',
    createdAt: '2026-09-29T09:00:00Z'
  },
  {
    id: 'slot-5',
    mentorId: 'usr-mentor-1',
    mentorName: 'Dr. Joseph Boateng',
    mentorEmail: 'j.boateng@ashesi.edu.gh',
    date: '2026-10-07',
    startTime: '10:00',
    endTime: '10:45',
    durationMinutes: 45,
    interviewType: 'behavioral',
    status: 'available',
    feeUsd: 25,
    meetingLink: 'https://meet.afriversity.org/live/slot-5',
    createdAt: '2026-09-29T10:00:00Z'
  },
  {
    id: 'slot-6',
    mentorId: 'usr-mentor-1',
    mentorName: 'Dr. Joseph Boateng',
    mentorEmail: 'j.boateng@ashesi.edu.gh',
    date: '2026-10-08',
    startTime: '16:00',
    endTime: '16:45',
    durationMinutes: 45,
    interviewType: 'technical',
    status: 'available',
    feeUsd: 25,
    meetingLink: 'https://meet.afriversity.org/live/slot-6',
    createdAt: '2026-09-29T10:00:00Z'
  }
];

const INITIAL_TRANSACTIONS: PlatformTransaction[] = [
  {
    id: 'txn-1',
    date: '2026-09-28 14:30',
    type: 'interview_booking',
    amountUsd: 25,
    status: 'completed',
    payerName: 'Victoria Mensah',
    payerEmail: 'victoria.mensah@gmail.com',
    description: 'Live 1-on-1 Mock Interview Booking (Google SWE Intern)',
    referenceId: 'slot-1'
  },
  {
    id: 'txn-2',
    date: '2026-09-28 15:00',
    type: 'interview_booking',
    amountUsd: 25,
    status: 'completed',
    payerName: 'Kwame Asante',
    payerEmail: 'kwame.asante@st.knust.edu.gh',
    description: 'Live 1-on-1 Mock Interview Booking (MTN Pulse)',
    referenceId: 'slot-2'
  },
  {
    id: 'txn-3',
    date: '2026-09-27 11:20',
    type: 'advisory_review',
    amountUsd: 15,
    status: 'completed',
    payerName: 'Victoria Mensah',
    payerEmail: 'victoria.mensah@gmail.com',
    description: 'Statement of Purpose Faculty Endorsement Review',
    referenceId: 'rev-1'
  },
  {
    id: 'txn-4',
    date: '2026-09-24 16:45',
    type: 'advisory_review',
    amountUsd: 15,
    status: 'completed',
    payerName: 'Emmanuel Kiprono',
    payerEmail: 'e.kiprono@uonbi.ac.ke',
    description: 'Oxford Africa Scholarship Essay Endorsement',
    referenceId: 'rev-4'
  },
  {
    id: 'txn-5',
    date: '2026-09-25 09:10',
    type: 'verification_fee',
    amountUsd: 10,
    status: 'completed',
    payerName: 'Kwame Asante',
    payerEmail: 'kwame.asante@st.knust.edu.gh',
    description: 'Student Academic Identity Verification (KNUST)',
    referenceId: 'usr-student-2'
  },
  {
    id: 'txn-6',
    date: '2026-09-20 12:00',
    type: 'verification_fee',
    amountUsd: 10,
    status: 'completed',
    payerName: 'Victoria Mensah',
    payerEmail: 'victoria.mensah@gmail.com',
    description: 'WASSCE Candidate Identity Verification (Wesley Girls)',
    referenceId: 'usr-shs-1'
  },
  {
    id: 'txn-7',
    date: '2026-09-29 18:00',
    type: 'mentor_payout',
    amountUsd: -35,
    status: 'completed',
    payerName: 'Afriversity Escrow',
    payerEmail: 'finance@afriversity.org',
    description: 'Faculty Advisory Payout to Dr. Joseph Boateng (70% share)',
    referenceId: 'payout-mentor-1'
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('afriversity_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('afriversity_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Dynamic Opportunities catalog overseen by Admin
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_opportunities');
      return saved ? JSON.parse(saved) : VERIFIED_OPPORTUNITIES;
    } catch {
      return VERIFIED_OPPORTUNITIES;
    }
  });

  // Dynamic Platform Users overseen by Admin
  const [platformUsers, setPlatformUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_platform_users');
      if (saved) return JSON.parse(saved);
      // Also check if user registered via AuthPage
      const regSaved = localStorage.getItem('afriversity_registered_accounts');
      if (regSaved) {
        const parsed = JSON.parse(regSaved);
        const mapped = parsed.map((a: any) => a.profile);
        return [...mapped, ...INITIAL_PLATFORM_USERS.filter(u => !mapped.some((m: any) => m.email.toLowerCase() === u.email.toLowerCase()))];
      }
      return INITIAL_PLATFORM_USERS;
    } catch {
      return INITIAL_PLATFORM_USERS;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('afriversity_saved_opps');
    return saved ? JSON.parse(saved) : ['opp-google-swe-intern-africa', 'opp-mcf-knust-2026'];
  });

  const [applications, setApplications] = useState<StudentApplication[]>(() => {
    const saved = localStorage.getItem('afriversity_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [savedUniversityIds, setSavedUniversityIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('afriversity_saved_unis');
    return saved ? JSON.parse(saved) : ['uni-knust', 'uni-ashesi'];
  });

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiSuggestedPrompt, setAiSuggestedPrompt] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Admin Portal Sub-tab State
  const [adminActiveTab, setAdminActiveTab] = useState<AdminActiveTab>('dashboard');

  // Mentor Onboarding Modal State
  const [isMentorOnboardingOpen, setIsMentorOnboardingOpen] = useState(false);

  // Live Interview Requests State
  const [interviewRequests, setInterviewRequests] = useState<LiveInterviewRequest[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_interview_requests');
      return saved ? JSON.parse(saved) : INITIAL_INTERVIEW_REQUESTS;
    } catch {
      return INITIAL_INTERVIEW_REQUESTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('afriversity_interview_requests', JSON.stringify(interviewRequests));
    } catch (e) {}
  }, [interviewRequests]);

  const scheduleInterview = (requestId: string, scheduledTime: string, meetingLink?: string) => {
    setInterviewRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'scheduled',
              scheduledTime,
              meetingLink: meetingLink || `https://meet.afriversity.org/live/${req.id}`
            }
          : req
      )
    );
    const targetReq = interviewRequests.find(r => r.id === requestId);
    if (targetReq) {
      addAuditLog({
        category: 'user',
        action: 'Live Mock Interview Scheduled',
        actor: user?.email || 'mentor@afriversity.org',
        details: `Scheduled live mock interview session with ${targetReq.studentName} for ${scheduledTime}.`,
        severity: 'success'
      });
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Live Interview Scheduled',
        message: `Live mock interview with ${targetReq.studentName} scheduled for ${scheduledTime}.`,
        type: 'match',
        date: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const completeInterview = (requestId: string, rubric: InterviewRubricScore, mentorFeedback: string) => {
    setInterviewRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              status: 'completed',
              rubric,
              mentorFeedback
            }
          : req
      )
    );
    const targetReq = interviewRequests.find(r => r.id === requestId);
    if (targetReq) {
      addAuditLog({
        category: 'user',
        action: 'Live Mock Interview Completed',
        actor: user?.email || 'mentor@afriversity.org',
        details: `Completed live interview with ${targetReq.studentName}. Overall Score: ${rubric.overallScore}/100.`,
        severity: 'success'
      });
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Interview Evaluation Dispatched',
        message: `Official STAR mock interview evaluation and scorecard dispatched to ${targetReq.studentName}.`,
        type: 'match',
        date: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const createInterviewRequest = (req: Omit<LiveInterviewRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq: LiveInterviewRequest = {
      ...req,
      id: `int-req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setInterviewRequests(prev => [newReq, ...prev]);
    addAuditLog({
      category: 'user',
      action: 'Live Interview Requested',
      actor: user?.email || 'student@afriversity.org',
      details: `${req.studentName} requested a live 1-on-1 mock interview for ${req.targetOpportunity}.`,
      severity: 'info'
    });
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Mock Interview Request',
      message: `${req.studentName} requested a live 1-on-1 interview session for ${req.targetOpportunity}.`,
      type: 'match',
      date: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Interactive Mentor Calendar Slots
  const [mentorTimeSlots, setMentorTimeSlots] = useState<MentorTimeSlot[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_mentor_time_slots');
      return saved ? JSON.parse(saved) : INITIAL_TIME_SLOTS;
    } catch {
      return INITIAL_TIME_SLOTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('afriversity_mentor_time_slots', JSON.stringify(mentorTimeSlots));
    } catch (e) {}
  }, [mentorTimeSlots]);

  const addMentorTimeSlot = (slotData: Omit<MentorTimeSlot, 'id' | 'status' | 'createdAt'>) => {
    const newSlot: MentorTimeSlot = {
      ...slotData,
      id: `slot-${Date.now()}`,
      status: 'available',
      feeUsd: slotData.feeUsd || 25,
      createdAt: new Date().toISOString()
    };
    setMentorTimeSlots(prev => [newSlot, ...prev]);
    addAuditLog({
      category: 'user',
      action: 'Mentor Available Slot Published',
      actor: user?.email || 'mentor@afriversity.org',
      details: `${slotData.mentorName} published available slot on ${slotData.date} at ${slotData.startTime} GMT.`,
      severity: 'info'
    });
  };

  const removeMentorTimeSlot = (slotId: string) => {
    setMentorTimeSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const bookMentorTimeSlot = (
    slotId: string,
    bookingDetails: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      targetOpportunity: string;
      studentNotes: string;
    }
  ) => {
    const slot = mentorTimeSlots.find(s => s.id === slotId);
    if (!slot) return;

    const meetingLink = `https://meet.afriversity.org/live/${slot.id}`;

    setMentorTimeSlots(prev =>
      prev.map(s =>
        s.id === slotId
          ? {
              ...s,
              status: 'booked',
              bookedByStudentId: bookingDetails.studentId,
              bookedByStudentName: bookingDetails.studentName,
              bookedByStudentEmail: bookingDetails.studentEmail,
              targetOpportunity: bookingDetails.targetOpportunity,
              studentNotes: bookingDetails.studentNotes,
              meetingLink
            }
          : s
      )
    );

    // Also register an interview request with status 'scheduled'
    const newInterviewReq: LiveInterviewRequest = {
      id: `int-req-${Date.now()}`,
      studentId: bookingDetails.studentId,
      studentName: bookingDetails.studentName,
      studentEmail: bookingDetails.studentEmail,
      studentInstitution: 'Verified Institution',
      targetOpportunity: bookingDetails.targetOpportunity,
      interviewType: slot.interviewType,
      requestedDurationMinutes: slot.durationMinutes,
      preferredTime: `${slot.date} at ${slot.startTime} GMT`,
      studentNotes: bookingDetails.studentNotes,
      status: 'scheduled',
      scheduledTime: `${slot.date} at ${slot.startTime} GMT`,
      meetingLink,
      createdAt: new Date().toISOString()
    };
    setInterviewRequests(prev => [newInterviewReq, ...prev]);

    // Record real transaction for actual platform revenue
    recordTransaction({
      type: 'interview_booking',
      amountUsd: slot.feeUsd || 25,
      status: 'completed',
      payerName: bookingDetails.studentName,
      payerEmail: bookingDetails.studentEmail,
      description: `Live 1-on-1 Mock Interview Slot Booking (${bookingDetails.targetOpportunity})`,
      referenceId: slot.id
    });

    // Notify mentor and student
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Mock Interview Slot Booked',
      message: `${bookingDetails.studentName} booked your live interview slot on ${slot.date} at ${slot.startTime} GMT.`,
      type: 'match',
      date: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);

    addAuditLog({
      category: 'user',
      action: 'Mock Interview Slot Booked',
      actor: bookingDetails.studentEmail,
      details: `${bookingDetails.studentName} booked slot with ${slot.mentorName} on ${slot.date} at ${slot.startTime} GMT for $${slot.feeUsd || 25}.`,
      severity: 'success'
    });
  };

  // Real Platform Ledger Transactions
  const [transactions, setTransactions] = useState<PlatformTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('afriversity_transactions', JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  const recordTransaction = (txn: Omit<PlatformTransaction, 'id' | 'date'>) => {
    const newTxn: PlatformTransaction = {
      ...txn,
      id: `txn-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setTransactions(prev => [newTxn, ...prev]);
  };

  // Dynamic Mentee Reviews for Mentor Desk
  const [menteeReviews, setMenteeReviews] = useState<MenteeReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_mentee_reviews');
      return saved ? JSON.parse(saved) : INITIAL_MENTEE_REVIEWS;
    } catch {
      return INITIAL_MENTEE_REVIEWS;
    }
  });

  // Persistence for mentee reviews
  useEffect(() => {
    try {
      localStorage.setItem('afriversity_mentee_reviews', JSON.stringify(menteeReviews));
    } catch (e) {}
  }, [menteeReviews]);

  // Persistence for dynamic opportunities
  useEffect(() => {
    try {
      localStorage.setItem('afriversity_opportunities', JSON.stringify(opportunities));
    } catch (e) {}
  }, [opportunities]);

  // Persistence for platform users
  useEffect(() => {
    try {
      localStorage.setItem('afriversity_platform_users', JSON.stringify(platformUsers));
    } catch (e) {}
  }, [platformUsers]);

  // Persistence for audit logs
  useEffect(() => {
    try {
      localStorage.setItem('afriversity_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {}
  }, [auditLogs]);

  const addAuditLog = (log: Omit<AuditLogEvent, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEvent = {
      id: `audit-${Date.now()}`,
      timestamp: 'Just now',
      ...log
    };
    setAuditLogs(prev => [newEntry, ...prev.slice(0, 49)]);
  };

  const addOpportunity = (newOpp: Opportunity) => {
    setOpportunities(prev => [newOpp, ...prev]);
    addAuditLog({
      category: 'opportunity',
      action: 'Opportunity Created',
      actor: user?.email || 'admin@afriversity.org',
      details: `Added new verified opportunity: ${newOpp.title} (${newOpp.organization}).`,
      severity: 'success'
    });
  };

  const updateOpportunity = (id: string, updated: Partial<Opportunity>) => {
    setOpportunities(prev =>
      prev.map(opp => (opp.id === id ? { ...opp, ...updated } : opp))
    );
    addAuditLog({
      category: 'opportunity',
      action: 'Opportunity Updated',
      actor: user?.email || 'admin@afriversity.org',
      details: `Updated parameters for opportunity ID: ${id}.`,
      severity: 'info'
    });
  };

  const deleteOpportunity = (id: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== id));
    addAuditLog({
      category: 'opportunity',
      action: 'Opportunity Deleted',
      actor: user?.email || 'admin@afriversity.org',
      details: `Archived/deleted opportunity ID: ${id}.`,
      severity: 'warning'
    });
  };

  const addPlatformUser = (newUser: UserProfile) => {
    setPlatformUsers(prev => [newUser, ...prev]);
    addAuditLog({
      category: 'user',
      action: 'User Registered by Admin',
      actor: user?.email || 'admin@afriversity.org',
      details: `Provisioned account for ${newUser.fullName} (${newUser.email}) with role: ${newUser.role}.`,
      severity: 'success'
    });
  };

  const updatePlatformUser = (id: string, updated: Partial<UserProfile>) => {
    setPlatformUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updated } : u))
    );
    // If updating current active user, sync user state as well
    if (user?.id === id) {
      setUser(prev => (prev ? { ...prev, ...updated } : prev));
    }
    addAuditLog({
      category: 'user',
      action: 'User Profile Updated',
      actor: user?.email || 'admin@afriversity.org',
      details: `Updated credentials/status for user: ${id}.`,
      severity: 'info'
    });
  };

  const deletePlatformUser = (id: string) => {
    setPlatformUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog({
      category: 'user',
      action: 'User Account Removed',
      actor: user?.email || 'admin@afriversity.org',
      details: `Removed user ID: ${id} from platform registry.`,
      severity: 'warning'
    });
  };

  const impersonateUser = (targetUser: UserProfile) => {
    setUser(targetUser);
    setActiveTab('dashboard');
    addAuditLog({
      category: 'user',
      action: 'Admin Impersonation Active',
      actor: 'admin@afriversity.org',
      details: `Admin switched view context to inspect student experience as: ${targetUser.fullName} (${targetUser.email}).`,
      severity: 'info'
    });
  };

  const resetPlatformData = () => {
    setOpportunities(VERIFIED_OPPORTUNITIES);
    setPlatformUsers(INITIAL_PLATFORM_USERS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    localStorage.removeItem('afriversity_opportunities');
    localStorage.removeItem('afriversity_platform_users');
    localStorage.removeItem('afriversity_audit_logs');
    addAuditLog({
      category: 'system',
      action: 'System Reset Completed',
      actor: 'admin@afriversity.org',
      details: 'All opportunity catalogs, user registries, and verification statuses reset to initial state.',
      severity: 'info'
    });
  };

  // Sync theme with HTML document element
  useEffect(() => {
    try {
      localStorage.setItem('afriversity_theme', theme);
    } catch (e) {}
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (document.body) {
        document.body.classList.add('dark');
        document.body.setAttribute('data-theme', 'dark');
      }
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      if (document.body) {
        document.body.classList.remove('dark');
        document.body.setAttribute('data-theme', 'light');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Persistence to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('afriversity_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('afriversity_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('afriversity_saved_opps', JSON.stringify(savedOpportunityIds));
  }, [savedOpportunityIds]);

  useEffect(() => {
    localStorage.setItem('afriversity_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('afriversity_saved_unis', JSON.stringify(savedUniversityIds));
  }, [savedUniversityIds]);

  const toggleSaveOpportunity = (oppId: string) => {
    setSavedOpportunityIds(prev => {
      const exists = prev.includes(oppId);
      if (exists) {
        return prev.filter(id => id !== oppId);
      } else {
        const targetOpp = VERIFIED_OPPORTUNITIES.find(o => o.id === oppId);
        if (targetOpp && !applications.some(a => a.opportunityId === oppId)) {
          const newApp: StudentApplication = {
            id: `app-${Date.now()}`,
            opportunityId: targetOpp.id,
            opportunity: targetOpp,
            stage: 'saved',
            updatedAt: new Date().toISOString(),
            savedDate: new Date().toISOString(),
            notes: '',
            checklist: targetOpp.documents_required.map((doc, idx) => ({
              id: `doc-${targetOpp.id}-${idx}`,
              label: doc,
              action: 'Prepare required document',
              completed: false,
              category: 'document'
            })),
            portalVisited: false,
            officialPortalUrl: targetOpp.application_url
          };
          setApplications(aPrev => [newApp, ...aPrev]);
        }
        return [...prev, oppId];
      }
    });
  };

  const updateApplicationStage = (oppId: string, stage: ApplicationStage) => {
    setApplications(prev => {
      const existing = prev.find(a => a.opportunityId === oppId);
      if (existing) {
        return prev.map(a =>
          a.opportunityId === oppId
            ? { ...a, stage, updatedAt: new Date().toISOString() }
            : a
        );
      } else {
        const targetOpp = VERIFIED_OPPORTUNITIES.find(o => o.id === oppId);
        if (!targetOpp) return prev;
        const newApp: StudentApplication = {
          id: `app-${Date.now()}`,
          opportunityId: targetOpp.id,
          opportunity: targetOpp,
          stage,
          updatedAt: new Date().toISOString(),
          savedDate: new Date().toISOString(),
          notes: '',
          checklist: targetOpp.documents_required.map((doc, idx) => ({
            id: `doc-${targetOpp.id}-${idx}`,
            label: doc,
            action: 'Prepare required document',
            completed: false,
            category: 'document'
          })),
          portalVisited: false,
          officialPortalUrl: targetOpp.application_url
        };
        return [newApp, ...prev];
      }
    });
  };

  const toggleChecklistItem = (oppId: string, checkItemId: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.opportunityId === oppId) {
          const updatedChecklist = app.checklist.map(item =>
            item.id === checkItemId ? { ...item, completed: !item.completed } : item
          );
          return {
            ...app,
            checklist: updatedChecklist,
            updatedAt: new Date().toISOString()
          };
        }
        return app;
      })
    );
  };

  const updateApplicationNotes = (oppId: string, notes: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.opportunityId === oppId
          ? { ...app, notes, updatedAt: new Date().toISOString() }
          : app
      )
    );
  };

  const toggleSaveUniversity = (uniId: string) => {
    setSavedUniversityIds(prev =>
      prev.includes(uniId) ? prev.filter(id => id !== uniId) : [...prev, uniId]
    );
  };

  const askAiAboutOpportunity = (opp: Opportunity, query?: string) => {
    setSelectedOpportunity(opp);
    setAiSuggestedPrompt(query || `What am I missing for the ${opp.title} application?`);
    setIsAiDrawerOpen(true);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const logout = () => {
    localStorage.removeItem('afriversity_user');
    setUser(null);
    setActiveTab('dashboard');
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const merged = { ...prev, ...updated };
      if (updated.profileCompleteness !== undefined) {
        merged.profileCompleteness = updated.profileCompleteness;
      } else {
        let score = 40;
        if (merged.skills && merged.skills.length >= 2) score += 15;
        if (merged.projects && merged.projects.length >= 1) score += 15;
        if (merged.relevantSubjects && merged.relevantSubjects.length >= 3) score += 15;
        if (merged.readyDocuments && merged.readyDocuments.some(d => d.status === 'ready')) score += 15;
        merged.profileCompleteness = Math.min(100, score);
      }
      return merged;
    });
  };

  const recordPortalVisit = (oppId: string) => {
    setApplications(prev =>
      prev.map(app =>
        app.opportunityId === oppId
          ? { ...app, portalVisited: true, updatedAt: new Date().toISOString() }
          : app
      )
    );
  };

  const endorseMenteeReview = (reviewId: string, feedbackNotes?: string) => {
    setMenteeReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              status: 'endorsed',
              endorsementDate: new Date().toISOString().split('T')[0],
              feedbackNotes: feedbackNotes || r.feedbackNotes || 'Official mentor endorsement provided for external application submission.'
            }
          : r
      )
    );

    const targetReview = menteeReviews.find(r => r.id === reviewId);
    if (targetReview) {
      addAuditLog({
        category: 'user',
        action: 'Mentee Application Endorsed',
        actor: user?.email || 'mentor@afriversity.org',
        details: `Endorsed ${targetReview.studentName}'s ${targetReview.documentTitle} for ${targetReview.targetOpp}.`,
        severity: 'success'
      });

      // Add notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: 'Mentee Endorsement Complete',
        message: `You successfully endorsed ${targetReview.studentName} for ${targetReview.targetOpp}.`,
        type: 'match',
        date: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const requestReviewChanges = (reviewId: string, feedbackNotes: string) => {
    setMenteeReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              status: 'changes_requested',
              feedbackNotes
            }
          : r
      )
    );

    const targetReview = menteeReviews.find(r => r.id === reviewId);
    if (targetReview) {
      addAuditLog({
        category: 'user',
        action: 'Revision Requested on Mentee Draft',
        actor: user?.email || 'mentor@afriversity.org',
        details: `Requested revisions on ${targetReview.studentName}'s ${targetReview.documentTitle}: "${feedbackNotes}".`,
        severity: 'info'
      });
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        opportunities,
        addOpportunity,
        updateOpportunity,
        deleteOpportunity,
        platformUsers,
        addPlatformUser,
        updatePlatformUser,
        deletePlatformUser,
        impersonateUser,
        auditLogs,
        addAuditLog,
        resetPlatformData,
        savedOpportunityIds,
        toggleSaveOpportunity,
        applications,
        updateApplicationStage,
        toggleChecklistItem,
        updateApplicationNotes,
        savedUniversityIds,
        toggleSaveUniversity,
        selectedOpportunity,
        setSelectedOpportunity,
        selectedUniversity,
        setSelectedUniversity,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        aiSuggestedPrompt,
        setAiSuggestedPrompt,
        askAiAboutOpportunity,
        notifications,
        markNotificationRead,
        clearNotifications,
        isOnboardingOpen,
        setIsOnboardingOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        logout,
        updateProfile,
        recordPortalVisit,
        menteeReviews,
        endorseMenteeReview,
        requestReviewChanges,
        adminActiveTab,
        setAdminActiveTab,
        isMentorOnboardingOpen,
        setIsMentorOnboardingOpen,
        interviewRequests,
        scheduleInterview,
        completeInterview,
        createInterviewRequest,
        mentorTimeSlots,
        addMentorTimeSlot,
        removeMentorTimeSlot,
        bookMentorTimeSlot,
        transactions,
        recordTransaction
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
