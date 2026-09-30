import React, { useState } from 'react';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Download,
  Send,
  Sparkles,
  Award,
  ChevronRight,
  MessageSquare,
  Check,
  Building,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MenteeReviewItem } from '../../types';

interface StudentDraftData {
  id: string;
  name: string;
  email: string;
  institution: string;
  programme: string;
  gpa: string;
  targetOpportunity: string;
  targetOppId: string;
  deadline: string;
  cvHeadline: string;
  education: {
    degree: string;
    school: string;
    period: string;
    details: string;
  };
  skills: string[];
  projects: {
    title: string;
    tech: string;
    bullets: string[];
  }[];
  statementOfPurpose: string;
}

const MOCK_MENTEE_DRAFTS: StudentDraftData[] = [
  {
    id: 'usr-student-1',
    name: 'Victoria Mensah',
    email: 'victoria.mensah@ashesi.edu.gh',
    institution: 'Ashesi University',
    programme: 'BSc Computer Science',
    gpa: '3.88 / 4.0 (Dean’s List)',
    targetOpportunity: 'Google Software Engineering Internship Africa 2026',
    targetOppId: 'opp-google-swe-intern-africa',
    deadline: '2026-10-15',
    cvHeadline: 'Aspiring Software Engineer & Open Source Contributor | Python, TypeScript, Distributed Systems',
    education: {
      degree: 'Bachelor of Science in Computer Science (Honors)',
      school: 'Ashesi University, Berekuso, Ghana',
      period: '2023 – 2027 (Expected)',
      details: 'Relevant Coursework: Data Structures & Algorithms, Operating Systems, Database Systems, Computer Networks.'
    },
    skills: ['Python', 'TypeScript', 'C++', 'Go', 'React', 'Docker', 'PostgreSQL', 'Git', 'System Design'],
    projects: [
      {
        title: 'Akoma Health: Telemedicine Triage for Rural Clinics',
        tech: 'Python, FastAPI, React, PostgreSQL',
        bullets: [
          'Engineered an offline-first patient intake portal deployed across 4 rural clinics in Eastern Ghana.',
          'Reduced triage turnaround time by 42% through asynchronous SQLite synchronization during network outages.',
          'Implemented secure JWT-based clinician authorization adhering to African health data privacy guidelines.'
        ]
      },
      {
        title: 'Distributed Mobile Money Reconciliation Engine',
        tech: 'Go, Kafka, Redis',
        bullets: [
          'Architected a resilient transaction processing pipeline capable of handling 1,200 simulated transactions per second.',
          'Formulated idempotent webhook consumers that eliminated duplicate billing errors by 99.4%.'
        ]
      }
    ],
    statementOfPurpose:
      'Growing up in Takoradi, I witnessed firsthand how unreliable infrastructure limits digital economic participation. My ambition is to engineer foundational distributed systems that empower everyday Africans. Joining Google as a Software Engineering Intern represents an unprecedented opportunity to master large-scale reliability engineering and bring world-class technical practices back to the African software ecosystem.'
  },
  {
    id: 'usr-student-2',
    name: 'Kwame Asante',
    email: 'kwame.asante@knust.edu.gh',
    institution: 'Kwame Nkrumah University of Science and Technology (KNUST)',
    programme: 'BSc Telecommunication Engineering',
    gpa: 'First Class Division (CWA 79.4%)',
    targetOpportunity: 'MTN Pulse Digital Apprenticeship 2026',
    targetOppId: 'opp-mtn-pulse-apprenticeship',
    deadline: '2026-10-31',
    cvHeadline: 'Telecommunications & Cloud Networking Enthusiast | 5G Core, Python Network Automation',
    education: {
      degree: 'BSc Telecommunication Engineering',
      school: 'KNUST, Kumasi, Ghana',
      period: '2022 – 2026',
      details: 'Major Coursework: Digital Signal Processing, RF & Microwave Engineering, Fiber Optics, Cloud Networks.'
    },
    skills: ['Python', 'Linux Networking', 'Cisco Packet Tracer', 'Wireshark', 'Bash', 'AWS Cloud Practitioner'],
    projects: [
      {
        title: 'Solar-Powered LoRa Mesh Network for Agricultural Monitoring',
        tech: 'C++, ESP32, LoRaWAN',
        bullets: [
          'Designed low-cost soil moisture sensor nodes transmitting telemetry across a 6km radius in Ashanti Region.',
          'Constructed cloud dashboard integrating automated SMS alerts for smallholder cocoa farmers.'
        ]
      }
    ],
    statementOfPurpose:
      'Telecommunications is the backbone of African financial inclusion and education. Through the MTN Pulse Digital Apprenticeship, I aim to master next-generation fiber and wireless connectivity rollouts, bridging the connectivity divide for rural communities across West Africa.'
  },
  {
    id: 'usr-student-3',
    name: 'Amina Bello',
    email: 'amina.bello@unilag.edu.ng',
    institution: 'University of Lagos (UNILAG)',
    programme: 'BSc Electrical & Electronics Engineering',
    gpa: '4.91 / 5.0 (First Class)',
    targetOpportunity: 'The Rhodes Scholarship for West Africa (Oxford)',
    targetOppId: 'opp-rhodes-west-africa',
    deadline: '2026-11-15',
    cvHeadline: 'Clean Energy Researcher & Renewable Grid Advocate | Power Systems & Sustainable Transitions',
    education: {
      degree: 'BSc Electrical & Electronics Engineering',
      school: 'University of Lagos, Nigeria',
      period: '2021 – 2026',
      details: 'Top 1% of Engineering Faculty. University Scholar Award recipient for 3 consecutive academic years.'
    },
    skills: ['MATLAB/Simulink', 'Power System Analysis', 'Python (NumPy, SciPy)', 'AutoCAD Electrical', 'Renewable Microgrids'],
    projects: [
      {
        title: 'Urban Hybrid Micro-Grid Optimization in Lagos',
        tech: 'MATLAB, Genetic Algorithms',
        bullets: [
          'Simulated decentralized rooftop solar and battery storage integration for 50 commercial properties in Yaba tech district.',
          'Projected a 38% reduction in diesel generator carbon emissions while lowering levelized cost of electricity (LCOE).'
        ]
      }
    ],
    statementOfPurpose:
      'My research vision at the University of Oxford is to develop resilient, modular smart grid topologies specifically tailored to sub-Saharan African cities. The Rhodes Scholarship will equip me with the cross-disciplinary policy and engineering insight needed to drive the African renewable energy transition.'
  }
];

export const MentorCvReviewDesk: React.FC = () => {
  const {
    user,
    menteeReviews,
    endorseMenteeReview,
    requestReviewChanges,
    setActiveTab
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(MOCK_MENTEE_DRAFTS[0].id);
  const [activeTabMode, setActiveTabMode] = useState<'cv' | 'statement'>('cv');

  // Annotation notes
  const [educationNotes, setEducationNotes] = useState('Coursework is well aligned with the target technical role. Recommend adding your GPA ranking.');
  const [skillsNotes, setSkillsNotes] = useState('Strong tech stack. Ensure skills listed match those tested in the technical coding rounds.');
  const [projectNotes, setProjectNotes] = useState('Excellent use of impact metrics (% reductions). Keep the X-Y-Z formula concise.');
  const [generalFeedback, setGeneralFeedback] = useState('Outstanding CV draft. Strongly reflects authentic technical competence.');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const selectedDraft = MOCK_MENTEE_DRAFTS.find(s => s.id === selectedStudentId) || MOCK_MENTEE_DRAFTS[0];
  const matchingReview = menteeReviews.find(r => r.studentEmail === selectedDraft.email || r.studentName === selectedDraft.name);

  const handleEndorse = () => {
    if (matchingReview) {
      endorseMenteeReview(
        matchingReview.id,
        generalFeedback || 'Officially endorsed by Faculty Advisor. Verified authentic and ready for institutional submission.'
      );
    }
    setActionSuccess(`Officially endorsed ${selectedDraft.name}'s application documents!`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleRequestRevision = () => {
    if (matchingReview) {
      requestReviewChanges(
        matchingReview.id,
        generalFeedback || 'Please refine project bullet metrics and add specific technical stack details.'
      );
    }
    setActionSuccess(`Revision guidance dispatched to ${selectedDraft.name}.`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
            Faculty Advisory Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
            Mentee CV & Statement Review Desk
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Examine, annotate, and officially endorse your assigned students’ CVs and Statements of Purpose before external submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Review Copy</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Assigned Student Selector Row */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          <span>Assigned Mentees Awaiting Review</span>
          <span className="font-mono text-amber-600 dark:text-amber-400">{MOCK_MENTEE_DRAFTS.length} Assigned</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {MOCK_MENTEE_DRAFTS.map(draft => {
            const isSelected = draft.id === selectedStudentId;
            const rev = menteeReviews.find(r => r.studentEmail === draft.email);
            const isEndorsed = rev?.status === 'endorsed';
            const isRevision = rev?.status === 'changes_requested';

            return (
              <button
                type="button"
                key={draft.id}
                onClick={() => setSelectedStudentId(draft.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500 text-stone-900 dark:text-white'
                    : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                    {draft.name}
                  </span>
                  {isEndorsed ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                      Endorsed
                    </span>
                  ) : isRevision ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold">
                      Revisions
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      Pending
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 truncate">
                  {draft.institution}
                </div>

                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate mt-1">
                  Target: {draft.targetOpportunity}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Student Review Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Student Document Draft */}
        <div className="lg:col-span-2 space-y-4">
          {/* Document Header & Mode Tabs */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                  STUDENT DRAFT UNDER ADVISORY
                </span>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mt-0.5">
                  {selectedDraft.name} — {selectedDraft.programme}
                </h2>
                <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-1">
                  <span>{selectedDraft.institution}</span>
                  <span>·</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{selectedDraft.gpa}</span>
                </div>
              </div>

              {/* View Switcher: CV Draft vs Statement */}
              <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTabMode('cv')}
                  className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                    activeTabMode === 'cv'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                  }`}
                >
                  CV Draft
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabMode('statement')}
                  className={`px-3 py-1.5 font-semibold rounded-md transition-all ${
                    activeTabMode === 'statement'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-2xs font-bold'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                  }`}
                >
                  Statement of Purpose
                </button>
              </div>
            </div>

            {/* Document Content View */}
            {activeTabMode === 'cv' ? (
              <div className="space-y-6 text-xs text-stone-800 dark:text-stone-200">
                {/* CV Headline */}
                <div className="p-3.5 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-750 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">
                    Professional Headline
                  </div>
                  <p className="font-medium text-stone-900 dark:text-stone-100">{selectedDraft.cvHeadline}</p>
                </div>

                {/* Education Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-white uppercase font-mono text-[11px] tracking-wider">
                      1. Education & Coursework
                    </span>
                    <span className="text-[10px] text-stone-400">{selectedDraft.education.period}</span>
                  </div>
                  <div className="font-semibold text-stone-900 dark:text-white">
                    {selectedDraft.education.degree}
                  </div>
                  <div className="text-stone-600 dark:text-stone-400">
                    {selectedDraft.education.school}
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
                    {selectedDraft.education.details}
                  </p>

                  {/* Inline Mentor Annotation Box */}
                  <div className="mt-2 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 font-mono uppercase">
                      <Edit3 className="w-3 h-3 text-amber-600" />
                      <span>Mentor Annotation: Education</span>
                    </div>
                    <input
                      type="text"
                      value={educationNotes}
                      onChange={e => setEducationNotes(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded text-stone-900 dark:text-white"
                      placeholder="Add specific advice for this section..."
                    />
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-white uppercase font-mono text-[11px] tracking-wider">
                      2. Technical Skills & Tools
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">{selectedDraft.skills.length} Competencies</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDraft.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-[11px] font-mono text-stone-800 dark:text-stone-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Inline Mentor Annotation Box */}
                  <div className="mt-2 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 font-mono uppercase">
                      <Edit3 className="w-3 h-3 text-amber-600" />
                      <span>Mentor Annotation: Skills Alignment</span>
                    </div>
                    <input
                      type="text"
                      value={skillsNotes}
                      onChange={e => setSkillsNotes(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded text-stone-900 dark:text-white"
                      placeholder="Add specific advice for this section..."
                    />
                  </div>
                </div>

                {/* Projects Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200 dark:border-stone-700">
                    <span className="font-bold text-stone-900 dark:text-white uppercase font-mono text-[11px] tracking-wider">
                      3. Engineering & Leadership Projects
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">{selectedDraft.projects.length} Showcased</span>
                  </div>

                  {selectedDraft.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200 dark:border-stone-750 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 dark:text-white text-xs">{proj.title}</span>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">{proj.tech}</span>
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-stone-600 dark:text-stone-300 text-[11px] leading-relaxed">
                        {proj.bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* Inline Mentor Annotation Box */}
                  <div className="mt-2 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 font-mono uppercase">
                      <Edit3 className="w-3 h-3 text-amber-600" />
                      <span>Mentor Annotation: Projects & Impact Bullets</span>
                    </div>
                    <input
                      type="text"
                      value={projectNotes}
                      onChange={e => setProjectNotes(e.target.value)}
                      className="w-full text-xs p-1.5 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded text-stone-900 dark:text-white"
                      placeholder="Add specific advice for this section..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Statement of Purpose View */
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-750 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">
                      Personal Statement of Motivation & Leadership
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">
                      {selectedDraft.statementOfPurpose.split(' ').length} words
                    </span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-serif text-sm">
                    "{selectedDraft.statementOfPurpose}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Faculty Endorsement & Feedback Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xs space-y-4 sticky top-[80px]">
            <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
              <UserCheck className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-stone-900 dark:text-white text-xs sm:text-sm">
                Faculty Endorsement Panel
              </h3>
            </div>

            {/* Target Opp Details */}
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg space-y-1 text-xs">
              <span className="text-[10px] font-mono uppercase text-stone-400 font-bold">
                Evaluating Candidate For:
              </span>
              <div className="font-bold text-stone-900 dark:text-white text-xs">
                {selectedDraft.targetOpportunity}
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between pt-1">
                <span>Application Deadline:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{selectedDraft.deadline}</span>
              </div>
            </div>

            {/* Mentor Notes Form */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Official Faculty Endorsement Feedback
              </label>
              <textarea
                rows={4}
                value={generalFeedback}
                onChange={e => setGeneralFeedback(e.target.value)}
                placeholder="Write your official evaluation summary for the student..."
                className="w-full text-xs p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
              />
              <p className="text-[10px] text-stone-400">
                Your notes are recorded in the official verification log and shared with the student.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={handleEndorse}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Endorse CV with Faculty Stamp</span>
              </button>

              <button
                type="button"
                onClick={handleRequestRevision}
                className="w-full py-2 px-4 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-rose-700 dark:text-rose-400 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Request Revisions with Feedback</span>
              </button>
            </div>

            {/* Live Interview Kicker */}
            <div className="p-3 bg-gradient-to-br from-amber-500/10 to-stone-100 dark:from-amber-950/30 dark:to-stone-900 rounded-lg border border-amber-300/60 dark:border-amber-700/40 space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Live Interview Option</span>
              </span>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                Want to test {selectedDraft.name} on their CV claims? Open the Live Student Interview Studio to conduct a real-time 1-on-1 mock session.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('interview')}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Launch Live Mock Interview</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
