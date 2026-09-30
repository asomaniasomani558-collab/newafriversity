import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Calendar,
  Send,
  Star,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Check,
  Building,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LiveInterviewRequest, InterviewRubricScore } from '../../types';
import { MentorCalendarView } from './MentorCalendarView';

export const MentorLiveInterviewDesk: React.FC = () => {
  const {
    user,
    interviewRequests,
    scheduleInterview,
    completeInterview,
    mentorTimeSlots
  } = useApp();

  // Active Desk Sub-tab ('calendar' vs 'requests')
  const [deskTab, setDeskTab] = useState<'calendar' | 'requests'>('calendar');

  // Active Session state
  const [activeSessionRequest, setActiveSessionRequest] = useState<LiveInterviewRequest | null>(null);

  // Live Call Controls
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Question bank state for active session
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Rubric Scores (1-5 scale)
  const [rubricScores, setRubricScores] = useState({
    situation: 4,
    task: 5,
    action: 4,
    result: 4,
    delivery: 5
  });

  const [mentorNotes, setMentorNotes] = useState('');
  const [feedbackSummary, setFeedbackSummary] = useState('');
  const [schedulingModalReq, setSchedulingModalReq] = useState<LiveInterviewRequest | null>(null);
  const [scheduleTimeInput, setScheduleTimeInput] = useState('Tomorrow at 16:00 GMT');
  const [completedSuccessMsg, setCompletedSuccessMsg] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSessionSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getQuestionBank = (req: LiveInterviewRequest) => {
    if (req.interviewType === 'technical') {
      return [
        {
          q: 'Walk me through a software system or algorithm you designed that handled real-world constraints in an African context.',
          hint: 'Listen for: Clear architecture, data structure choices, latency management, and trade-off justification.'
        },
        {
          q: 'Tell me about a difficult debugging challenge you encountered. How did you isolate the root cause?',
          hint: 'Listen for: Systematic troubleshooting, logging, unit testing, and post-mortem reflection.'
        },
        {
          q: 'Why are you targeting Google’s engineering teams in Africa, and what technical problem are you most excited to solve?',
          hint: 'Listen for: Mission alignment, knowledge of scalable systems, and personal growth goals.'
        }
      ];
    } else if (req.interviewType === 'scholarship') {
      return [
        {
          q: 'How will your proposed research at Oxford address systemic economic or technological challenges in West Africa?',
          hint: 'Listen for: Scholarly depth, clarity of research methodology, and transformational vision.'
        },
        {
          q: 'Describe a significant leadership dilemma where you had to mobilize peers against difficult odds.',
          hint: 'Listen for: Moral courage, empathy, stakeholder management, and verifiable outcomes.'
        },
        {
          q: 'What is your long-term commitment to the African continent after completing your postgraduate studies?',
          hint: 'Listen for: Reinvestment plan, local capacity building, and authentic Pan-African ethos.'
        }
      ];
    } else {
      return [
        {
          q: 'Describe a challenging project where your initial approach failed. How did you adapt using the STAR framework?',
          hint: 'Listen for: Accountability, resilience, data-driven course correction, and measurable impact.'
        },
        {
          q: 'How do your experiences at your university prepare you for this specific opportunity?',
          hint: 'Listen for: Concrete course projects, leadership roles, and proactive self-learning.'
        },
        {
          q: 'Do you have any technical or strategic questions for me as your faculty mentor regarding this application?',
          hint: 'Listen for: Curiosity, diligence, and thorough preparation.'
        }
      ];
    }
  };

  const handleLaunchSession = (req: LiveInterviewRequest) => {
    setActiveSessionRequest(req);
    setSessionSeconds(0);
    setIsTimerRunning(true);
    setCurrentQuestionIdx(0);
    setMentorNotes('');
    setFeedbackSummary(
      `Candidate exhibited strong composure and depth of preparation for ${req.targetOpportunity}. Clear articulation of technical and personal leadership.`
    );
  };

  const handleEndSession = () => {
    if (!activeSessionRequest) return;

    // Calculate score out of 100
    const totalStars =
      rubricScores.situation +
      rubricScores.task +
      rubricScores.action +
      rubricScores.result +
      rubricScores.delivery;
    const overallScore = Math.round((totalStars / 25) * 100);

    const rubric: InterviewRubricScore = {
      situation: rubricScores.situation,
      task: rubricScores.task,
      action: rubricScores.action,
      result: rubricScores.result,
      overallScore,
      feedbackSummary: feedbackSummary.trim() || 'Official faculty mock interview evaluation submitted.',
      keyStrengths: [
        'Structured STAR framework delivery',
        'Strong technical communication and clarity',
        'Clear alignment with opportunity requirements'
      ],
      growthAreas: [
        'Further quantify business or community impact metrics',
        'Deepen technical architecture explanations under time pressure'
      ]
    };

    completeInterview(activeSessionRequest.id, rubric, mentorNotes || feedbackSummary);
    setIsTimerRunning(false);
    setCompletedSuccessMsg(
      `Live mock interview with ${activeSessionRequest.studentName} completed! Evaluation scorecard (${overallScore}/100) dispatched.`
    );
    setActiveSessionRequest(null);
    setTimeout(() => setCompletedSuccessMsg(null), 5000);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingModalReq || !scheduleTimeInput.trim()) return;
    scheduleInterview(schedulingModalReq.id, scheduleTimeInput.trim());
    setSchedulingModalReq(null);
  };

  const pendingRequests = interviewRequests.filter(r => r.status === 'pending');
  const scheduledRequests = interviewRequests.filter(r => r.status === 'scheduled');
  const completedRequests = interviewRequests.filter(r => r.status === 'completed');

  const handleLaunchFromCalendar = (
    studentName: string,
    targetOpportunity: string,
    type: 'technical' | 'behavioral' | 'scholarship' | 'leadership'
  ) => {
    const syntheticReq: LiveInterviewRequest = {
      id: `int-req-cal-${Date.now()}`,
      studentId: 'student-session',
      studentName,
      studentEmail: 'student@afriversity.org',
      studentInstitution: 'Verified African Institution',
      targetOpportunity,
      interviewType: type,
      requestedDurationMinutes: 45,
      preferredTime: 'Now',
      studentNotes: `Live mock interview session initiated from Mentor Calendar for ${targetOpportunity}.`,
      status: 'in_progress',
      createdAt: new Date().toISOString()
    };
    handleLaunchSession(syntheticReq);
  };

  // LIVE INTERVIEW ACTIVE STUDIO VIEW
  if (activeSessionRequest) {
    const questionList = getQuestionBank(activeSessionRequest);
    const currQ = questionList[currentQuestionIdx] || questionList[0];

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Studio Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900 text-white p-4 rounded-xl border border-stone-800 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                LIVE 1-ON-1 MOCK INTERVIEW SESSION
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {activeSessionRequest.studentName} — {activeSessionRequest.targetOpportunity}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timer */}
            <div className="flex items-center gap-2 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white text-sm">{formatTime(sessionSeconds)}</span>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="text-stone-400 hover:text-white ml-1 cursor-pointer"
                title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            <button
              type="button"
              onClick={handleEndSession}
              className="py-1.5 px-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>Conclude Session & Score</span>
            </button>
          </div>
        </div>

        {/* Video Feeds Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Mentee (Student) Video Box */}
          <div className="relative bg-stone-950 rounded-2xl border border-stone-800 h-64 sm:h-72 flex flex-col justify-between p-4 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between z-10">
              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5 border border-emerald-900/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Student Stream
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {activeSessionRequest.studentInstitution}
              </span>
            </div>

            {/* Simulated Candidate Video Center */}
            <div className="flex flex-col items-center justify-center space-y-2 z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-xl border-2 border-amber-300">
                {activeSessionRequest.studentName.charAt(0)}
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-sm">{activeSessionRequest.studentName}</div>
                <div className="text-[11px] text-stone-400">Audio active · 48ms Latency</div>
              </div>
              {/* Simulated Audio Waveform */}
              <div className="flex items-center gap-1 h-4 pt-1">
                <div className="w-1 bg-amber-400 h-2 animate-pulse rounded-full" />
                <div className="w-1 bg-amber-400 h-4 animate-pulse rounded-full" />
                <div className="w-1 bg-amber-400 h-3 animate-pulse rounded-full" />
                <div className="w-1 bg-amber-400 h-5 animate-pulse rounded-full" />
                <div className="w-1 bg-amber-400 h-2 animate-pulse rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between z-10 text-[11px] text-stone-400 bg-black/50 p-2 rounded-lg">
              <span>Goal: {activeSessionRequest.targetOpportunity}</span>
              <span className="text-amber-400 font-mono">STAR Mode</span>
            </div>
          </div>

          {/* Mentor (You) Video Box */}
          <div className="relative bg-stone-900 rounded-2xl border border-stone-800 h-64 sm:h-72 flex flex-col justify-between p-4 overflow-hidden shadow-inner">
            <div className="flex items-center justify-between z-10">
              <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1.5 border border-amber-900/60">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Mentor Cam (Active)
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                {user?.institution || 'Faculty Advisor'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 z-10">
              <div className="w-20 h-20 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-2xl shadow-xl border-2 border-stone-600">
                {user?.fullName?.charAt(0) || 'M'}
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-sm">{user?.fullName || 'Faculty Mentor'}</div>
                <div className="text-[11px] text-stone-400">Host / Lead Evaluator</div>
              </div>
            </div>

            {/* Media Controls */}
            <div className="flex items-center justify-center gap-3 z-10">
              <button
                type="button"
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isMicMuted ? 'bg-rose-900/80 text-rose-300' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
              >
                {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isMicMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isVideoOff ? 'bg-rose-900/80 text-rose-300' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                }`}
              >
                {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isVideoOff ? 'Turn Video On' : 'Video Active'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Studio Lower Grid: Question Prompter & Live STAR Rubric */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Question Prompter & Candidate Notes */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-stone-900 dark:text-white text-xs uppercase font-mono tracking-wider">
                  Target Opportunity Question Bank
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                Question {currentQuestionIdx + 1} of {questionList.length}
              </span>
            </div>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
              <span className="text-[10px] font-mono uppercase text-amber-700 dark:text-amber-400 font-bold">
                Prompt for Mentee
              </span>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                "{currQ.q}"
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-1 border-t border-amber-200/60 dark:border-amber-900/40">
                💡 {currQ.hint}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(i => Math.max(0, i - 1))}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-100 dark:bg-stone-800 rounded text-stone-700 dark:text-stone-300 disabled:opacity-40 cursor-pointer"
              >
                Previous Question
              </button>
              <button
                type="button"
                disabled={currentQuestionIdx === questionList.length - 1}
                onClick={() => setCurrentQuestionIdx(i => Math.min(questionList.length - 1, i + 1))}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded disabled:opacity-40 cursor-pointer font-bold"
              >
                Next Question
              </button>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Live Advisor Notes
              </label>
              <textarea
                rows={3}
                value={mentorNotes}
                onChange={e => setMentorNotes(e.target.value)}
                placeholder="Jot down candidate strong points, pauses, or specific suggestions as they speak..."
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
              />
            </div>
          </div>

          {/* Live STAR Rubric Evaluation Panel */}
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-stone-900 dark:text-white text-xs uppercase font-mono tracking-wider">
                  Live STAR Rubric Scoring (1 - 5)
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Score: {Math.round(((rubricScores.situation + rubricScores.task + rubricScores.action + rubricScores.result + rubricScores.delivery) / 25) * 100)}/100
              </div>
            </div>

            {/* Rubric Criteria Sliders/Rating */}
            <div className="space-y-3 text-xs">
              {[
                { key: 'situation', label: 'Situation (Context & Relevance)', val: rubricScores.situation },
                { key: 'task', label: 'Task (Ownership & Role Clarity)', val: rubricScores.task },
                { key: 'action', label: 'Action (Engineering & Execution Details)', val: rubricScores.action },
                { key: 'result', label: 'Result (Quantifiable Impact & Metrics)', val: rubricScores.result },
                { key: 'delivery', label: 'Delivery & Professional Confidence', val: rubricScores.delivery }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
                  <span className="font-medium text-stone-800 dark:text-stone-200">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(score => (
                      <button
                        type="button"
                        key={score}
                        onClick={() => setRubricScores(prev => ({ ...prev, [item.key]: score }))}
                        className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                          score <= item.val
                            ? 'bg-amber-500 text-stone-950 font-mono'
                            : 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Official Feedback Scorecard Summary
              </label>
              <textarea
                rows={3}
                value={feedbackSummary}
                onChange={e => setFeedbackSummary(e.target.value)}
                placeholder="Summary to appear on the student's official Afriversity Mock Evaluation report..."
                className="w-full text-xs p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed font-sans"
              />
            </div>

            <button
              type="button"
              onClick={handleEndSession}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Submit Evaluation & Dispatch to Student</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW: REQUESTS LIST & BOOKING DESK
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
            Faculty Advisory Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
            Live Student Mock Interview Studio
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Manage incoming live mock interview requests from assigned mentees, schedule slots, and conduct interactive 1-on-1 sessions.
          </p>
        </div>
      </div>

      {completedSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{completedSuccessMsg}</span>
        </div>
      )}

      {/* Sub-Tab Navigation Bar */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2">
        <button
          type="button"
          onClick={() => setDeskTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            deskTab === 'calendar'
              ? 'border-amber-500 text-stone-900 dark:text-white font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          <span>Interactive Calendar & Slot Availability</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold">
            {mentorTimeSlots.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setDeskTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            deskTab === 'requests'
              ? 'border-amber-500 text-stone-900 dark:text-white font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4 text-purple-500" />
          <span>Incoming Student Inquiries</span>
          {pendingRequests.length > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold">
              {pendingRequests.length} pending
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-stone-100 dark:bg-stone-800 text-stone-500">
              {interviewRequests.length}
            </span>
          )}
        </button>
      </div>

      {deskTab === 'calendar' ? (
        <MentorCalendarView onLaunchLiveSession={handleLaunchFromCalendar} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Total Requests
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
            {interviewRequests.length}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">Student inquiries</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Pending Slots
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
            {pendingRequests.length}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">Awaiting your response</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Scheduled Sessions
          </div>
          <div className="text-2xl font-bold font-mono text-purple-800 dark:text-purple-300">
            {scheduledRequests.length}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">Upcoming calendar dates</div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Completed Rounds
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
            {completedRequests.length}
          </div>
          <div className="text-[10px] text-stone-500 dark:text-stone-400">Evaluations dispatched</div>
        </div>
      </div>

      {/* Requests Table / Card List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Incoming Mentee Interview Requests</span>
          </h2>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {interviewRequests.length} candidate sessions
          </span>
        </div>

        <div className="space-y-3">
          {interviewRequests.map(req => {
            const isPending = req.status === 'pending';
            const isScheduled = req.status === 'scheduled';
            const isCompleted = req.status === 'completed';

            return (
              <div
                key={req.id}
                className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-2xs space-y-3.5 transition-all hover:border-stone-300 dark:hover:border-stone-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                        {req.studentName}
                      </span>
                      <span className="text-stone-300 dark:text-stone-700">·</span>
                      <span className="text-xs text-stone-600 dark:text-stone-300">{req.studentInstitution}</span>
                    </div>

                    <div className="text-xs text-stone-700 dark:text-stone-300">
                      Target Opportunity:{' '}
                      <strong className="text-amber-800 dark:text-amber-400 font-semibold">{req.targetOpportunity}</strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 pt-0.5">
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono text-[10px] uppercase font-bold text-stone-700 dark:text-stone-300">
                        {req.interviewType} Interview
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {req.requestedDurationMinutes} mins
                      </span>
                      <span>·</span>
                      <span>Preferred: <strong>{req.preferredTime}</strong></span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCompleted ? (
                      <span className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed ({req.rubric?.overallScore || 90}/100)</span>
                      </span>
                    ) : isScheduled ? (
                      <span className="px-2.5 py-1 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Scheduled: {req.scheduledTime}</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Awaiting Mentor Confirmation</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Candidate Notes */}
                <div className="p-3 bg-stone-50 dark:bg-stone-850 rounded-lg border border-stone-200/80 dark:border-stone-750 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                  <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400">
                    Candidate Preparation Note:
                  </span>
                  <p className="leading-relaxed">"{req.studentNotes}"</p>
                </div>

                {/* Scorecard Summary if completed */}
                {isCompleted && req.rubric && (
                  <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
                    <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-emerald-800 dark:text-emerald-300">
                      Dispatched Evaluation Summary:
                    </span>
                    <p className="text-emerald-900 dark:text-emerald-200">{req.rubric.feedbackSummary}</p>
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Contact: <span className="font-mono text-stone-700 dark:text-stone-300">{req.studentEmail}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => {
                          setSchedulingModalReq(req);
                          setScheduleTimeInput(req.preferredTime);
                        }}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>Confirm Slot</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleLaunchSession(req)}
                      className="px-4 py-1.5 text-xs font-bold rounded bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Repeat Mock Session' : 'Launch Live Studio Session'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Slot Modal */}
      {schedulingModalReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                Confirm Mock Interview Slot
              </h3>
              <button
                type="button"
                onClick={() => setSchedulingModalReq(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              <p className="text-stone-600 dark:text-stone-300">
                Confirming live session for <strong>{schedulingModalReq.studentName}</strong> for{' '}
                <strong>{schedulingModalReq.targetOpportunity}</strong>.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Agreed Date & Time
                </label>
                <input
                  type="text"
                  required
                  value={scheduleTimeInput}
                  onChange={e => setScheduleTimeInput(e.target.value)}
                  placeholder="e.g. Tomorrow at 16:00 GMT"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-[11px] text-amber-800 dark:text-amber-300">
                A calendar invitation with the Afriversity Live Studio link will be dispatched to {schedulingModalReq.studentEmail}.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setSchedulingModalReq(null)}
                  className="px-3.5 py-2 text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
