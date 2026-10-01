export type OpportunityType =
  | 'scholarship'
  | 'admission'
  | 'internship'
  | 'job'
  | 'fellowship'
  | 'competition'
  | 'training'
  | 'grant';

export type VerificationStatus = 'verified' | 'partner' | 'review';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  description: string;
  type: OpportunityType;
  category: string;
  country: string;
  eligible_countries: string[];
  eligible_regions: string[];
  location: string;
  remote: boolean;
  education_level: ('secondary' | 'undergraduate' | 'postgraduate' | 'recent_graduate' | 'young_professional' | 'all')[];
  programme: string;
  field: string;
  skills: string[];
  academic_requirements: string;
  funding: 'Fully Funded' | 'Partially Funded' | 'Paid' | 'Unpaid' | 'Tuition Waiver' | 'Self-Funded';
  salary_or_stipend?: string;
  application_fee: string;
  opening_date: string;
  deadline: string;
  requirements: string[];
  documents_required: string[];
  application_url: string;
  official_source: string;
  source_url: string;
  verified_status: VerificationStatus;
  last_verified_date: string;
  overview_highlights: string[];
}

export interface UniversityProgramme {
  id: string;
  name: string;
  degreeLevel: 'Undergraduate' | 'Postgraduate' | 'Doctorate' | 'Diploma';
  faculty: string;
  duration: string;
  tuitionEstimate: string;
  admissionRequirements: string[];
  applicationDeadline: string;
  officialProgrammeUrl: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  country: string;
  city: string;
  overview: string;
  rankingText: string;
  verifiedStatus: VerificationStatus;
  officialWebsite: string;
  admissionsPortalUrl: string;
  campusType: 'Public' | 'Private';
  establishedYear: number;
  featuredProgrammes: UniversityProgramme[];
  availableScholarships: string[];
  applicationTimeline: {
    undergradDeadline: string;
    postgradDeadline: string;
    internationalDeadline: string;
  };
  image: string;
}

export type ReadinessStatus = 'READY' | 'PARTIALLY_READY' | 'NOT_YET_READY';

export interface ChecklistItem {
  id: string;
  label: string;
  action: string;
  completed: boolean;
  category: 'document' | 'profile' | 'test' | 'submission';
}

export interface OpportunityReadiness {
  opportunityId: string;
  readinessStatus: ReadinessStatus;
  readinessScore: number;
  matchScore: number;
  matchedReasons: string[];
  missingItems: ChecklistItem[];
  recommendedNextStep: string;
}

export type ApplicationStage = 'saved' | 'preparing' | 'applied' | 'interview' | 'accepted' | 'waitlisted' | 'not_selected';

export interface StudentApplication {
  id: string;
  opportunityId: string;
  opportunity: Opportunity;
  stage: ApplicationStage;
  updatedAt: string;
  savedDate: string;
  targetSubmissionDate?: string;
  notes: string;
  checklist: ChecklistItem[];
  portalVisited: boolean;
  officialPortalUrl: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  description: string;
  techStack?: string[];
  link?: string;
}

export interface EducationItem {
  institution: string;
  programme: string;
  level: 'secondary' | 'undergraduate' | 'postgraduate' | 'recent_graduate' | 'young_professional';
  graduationYear: number;
  gradeGpa: string;
  relevantSubjects: string[];
}

export interface ReadyDocumentItem {
  id: string;
  name: string;
  type: 'transcript' | 'cv' | 'sop' | 'recommendation' | 'passport' | 'test_score' | 'portfolio' | 'other';
  status: 'ready' | 'in_progress' | 'missing';
  fileName?: string;
  fileSize?: string;
  lastUpdated?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  status?: 'active' | 'pending' | 'suspended';
  isVerified?: boolean;
  onboardingCompleted?: boolean;
  phone?: string;
  country: string;
  city: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  bio?: string;
  academicLevel: 'secondary' | 'undergraduate' | 'postgraduate' | 'recent_graduate' | 'young_professional';
  institution: string;
  programme: string;
  targetDegree?: string;
  graduationYear: number;
  gradeGpa: string;
  relevantSubjects: string[];
  interests: string[];
  skills: string[];
  goals: string[];
  projects: ProjectItem[];
  readyDocuments?: ReadyDocumentItem[];
  preferences: {
    targetCountries: string[];
    fundingTypes: string[];
    remoteOnly: boolean;
    opportunityTypes: OpportunityType[];
  };
  profileCompleteness: number;
  currentPriority: string;
  cvSummary?: string;
  workExperience?: {
    company: string;
    role: string;
    period: string;
    highlights: string[];
  }[];
  notificationSettings: {
    opportunityAlerts: boolean;
    deadlineReminders: boolean;
    universityUpdates: boolean;
    weeklyDigest: boolean;
    whatsappAlerts: boolean;
  };
}

export interface VoiceAssistantPersona {
  id: string;
  name: string;
  title: string;
  institution: string;
  accent: string;
  avatar: string;
  preferredGender: 'male' | 'female';
  voicePitch: number;
  voiceRate: number;
  description: string;
  coachingStyle: string;
}

export interface DetectedFillerWord {
  word: string;
  count: number;
  examples: string[];
}

export interface CompetencyKeywordHit {
  keyword: string;
  found: boolean;
  count: number;
  category: 'star' | 'technical' | 'impact' | 'leadership';
}

export interface QuestionPerformanceMetric {
  questionId: string;
  questionText: string;
  answerText: string;
  wordCount: number;
  durationSeconds: number;
  speechPaceWpm: number;
  fillerWordCount: number;
  fillerWords: string[];
  relevanceScore: number;
  starBreakdown: {
    situation: boolean;
    task: boolean;
    action: boolean;
    result: boolean;
  };
  keywordsMatched: string[];
}

export interface MockInterviewMetrics {
  totalWords: number;
  totalDurationSeconds: number;
  averageSpeechPaceWpm: number;
  speechPaceStatus: 'optimal' | 'too_fast' | 'too_slow' | 'balanced';
  speechPaceFeedback: string;
  totalFillerCount: number;
  fillerPercentage: number;
  fillerWordRating: 'exceptional' | 'good' | 'moderate' | 'high_filler_density';
  fillerWordBreakdown: DetectedFillerWord[];
  starOverallRating: number;
  starComponentsFound: {
    situationPercentage: number;
    taskPercentage: number;
    actionPercentage: number;
    resultPercentage: number;
  };
  keywordHits: CompetencyKeywordHit[];
  clarityScore: number;
  confidenceScore: number;
  overallReadinessScore: number;
  perQuestionMetrics: QuestionPerformanceMetric[];
  coachSummary: {
    strengths: string[];
    improvements: string[];
    actionItem: string;
  };
}

export interface MockInterviewSession {
  id: string;
  opportunityId?: string;
  roleTitle: string;
  interviewType: 'technical' | 'behavioral' | 'scholarship' | 'admissions';
  personaId: string;
  date: string;
  questions: {
    id: string;
    question: string;
    expectedCompetencies: string[];
    studentAnswer?: string;
    feedback?: {
      relevanceScore: number;
      structureFeedback: string;
      starAnalysis: string;
      strengths: string[];
      improvements: string[];
    };
  }[];
  currentQuestionIndex: number;
  completed: boolean;
  metrics?: MockInterviewMetrics;
}

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  category: 'user' | 'opportunity' | 'application' | 'interview' | 'system';
  action: string;
  actor: string;
  details: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'deadline' | 'match' | 'checklist' | 'university';
  date: string;
  read: boolean;
  linkAction?: {
    type: 'opportunity' | 'application' | 'university' | 'cv';
    targetId: string;
  };
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  category: string;
  cost: string;
  duration: string;
  matchedSkill: string;
  opportunityTieIn: string;
  level: string;
}

export interface MenteeReviewItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  institution: string;
  programme: string;
  targetOpp: string;
  opportunityId: string;
  documentType: 'essay' | 'cv' | 'statement' | 'portfolio' | 'transcript';
  documentTitle: string;
  status: 'pending' | 'endorsed' | 'changes_requested';
  submittedDate: string;
  endorsementDate?: string;
  feedbackNotes?: string;
  priority: 'high' | 'medium' | 'normal';
}

export type AdminActiveTab = 'overview' | 'dashboard' | 'users' | 'opportunities' | 'analytics' | 'audit' | 'settings';

export interface InterviewRubricScore {
  situation: number;
  task: number;
  action: number;
  result: number;
  overallScore: number;
  feedbackSummary: string;
  keyStrengths: string[];
  growthAreas: string[];
}

export interface LiveInterviewRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentInstitution: string;
  targetOpportunity: string;
  opportunityId?: string;
  interviewType: 'behavioral' | 'technical' | 'scholarship' | 'leadership';
  requestedDurationMinutes: number;
  preferredTime: string;
  studentNotes: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime?: string;
  meetingLink?: string;
  mentorFeedback?: string;
  rubric?: InterviewRubricScore;
  createdAt: string;
}

export interface MentorTimeSlot {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorEmail: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number; // 30 | 45
  interviewType: 'technical' | 'behavioral' | 'scholarship' | 'leadership';
  status: 'available' | 'booked' | 'completed';
  feeUsd: number;
  feeGhs?: number; // Standard session fee: 30 GHS
  bookedByStudentId?: string;
  bookedByStudentName?: string;
  bookedByStudentEmail?: string;
  targetOpportunity?: string;
  studentNotes?: string;
  meetingLink?: string;
  createdAt: string;
}

export interface PlatformTransaction {
  id: string;
  date: string;
  type: 'interview_booking' | 'advisory_review' | 'verification_fee' | 'mentor_payout';
  amountUsd: number;
  amountGhs?: number;
  status: 'completed' | 'pending';
  payerName: string;
  payerEmail: string;
  description: string;
  referenceId: string;
}
