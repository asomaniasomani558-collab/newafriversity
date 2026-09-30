import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  RefreshCw,
  Gauge,
  AlertTriangle,
  Radio,
  Settings2,
  Flame,
  Award,
  BookOpen,
  StopCircle,
  Pause,
  History,
  Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VERIFIED_OPPORTUNITIES } from '../../data/opportunities';
import { api } from '../../services/api';
import { MockInterviewMetrics, VoiceAssistantPersona } from '../../types';
import { VOICE_PERSONAS, voiceEngine } from '../../utils/voiceAssistant';
import {
  analyzeStarStructure,
  findFillerWordsInText,
  generateSessionMetrics
} from '../../utils/interviewMetrics';
import { InterviewSummaryDashboard } from './InterviewSummaryDashboard';
import { MentorLiveInterviewDesk } from './MentorLiveInterviewDesk';
import { StudentMentorBookingView } from './StudentMentorBookingView';
import { Video, Calendar, Check, Users } from 'lucide-react';

export const MockInterviewView: React.FC = () => {
  const { user, createInterviewRequest } = useApp();

  // If Mentor, render the Live Student Mock Interview Studio Desk
  if (user?.role === 'mentor') {
    return <MentorLiveInterviewDesk />;
  }

  // Student Sub-view Mode: Calendar Booking vs AI Voice Mock
  const [studentMode, setStudentMode] = useState<'calendar_booking' | 'ai_voice'>('calendar_booking');

  // Student Live Request Modal state
  const [isLiveRequestModalOpen, setIsLiveRequestModalOpen] = useState(false);
  const [liveReqPreferredTime, setLiveReqPreferredTime] = useState('This Thursday at 16:00 GMT');
  const [liveReqDuration, setLiveReqDuration] = useState(45);
  const [liveReqNotes, setLiveReqNotes] = useState('I would appreciate a mock session covering STAR questions and my engineering project bullets.');
  const [liveReqSuccess, setLiveReqSuccess] = useState<string | null>(null);

  const [selectedOppId, setSelectedOppId] = useState<string>(
    VERIFIED_OPPORTUNITIES[1].id // Google SWE Intern
  );
  const [roleTitle, setRoleTitle] = useState('Software Engineering Intern');
  const [interviewType, setInterviewType] = useState<'technical' | 'behavioral' | 'scholarship' | 'admissions'>('behavioral');

  // Voice Assistant persona
  const [selectedPersona, setSelectedPersona] = useState<VoiceAssistantPersona>(VOICE_PERSONAS[0]);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [autoSpeakQuestion, setAutoSpeakQuestion] = useState<boolean>(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Answers & Durations per question
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [durations, setDurations] = useState<Record<number, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, any>>({});
  const [evaluating, setEvaluating] = useState(false);

  // Live timer for current question
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Voice Recording (Speech Recognition & MediaRecorder Audio Capture)
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [audioRecordings, setAudioRecordings] = useState<Record<number, string>>({});
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [userAudioTime, setUserAudioTime] = useState(0);
  const [userAudioTotalDuration, setUserAudioTotalDuration] = useState(0);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  // Coach Hint state
  const [coachHint, setCoachHint] = useState<string | null>(null);

  // Summary Dashboard state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryMetrics, setSummaryMetrics] = useState<MockInterviewMetrics | null>(null);

  // Historical sessions
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('afriversity_mock_interview_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const selectedOpp = VERIFIED_OPPORTUNITIES.find(o => o.id === selectedOppId);
  const currentStudentAnswer = answers[currentIdx] || '';

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (sessionActive && !showSummary && isTimerRunning) {
      interval = setInterval(() => {
        setCurrentDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, showSummary, isTimerRunning]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      voiceEngine.stop();
    };
  }, []);

  // When question changes, speak if auto-speak is enabled
  useEffect(() => {
    if (sessionActive && questions[currentIdx] && !showSummary) {
      // Start duration timer
      setIsTimerRunning(true);
      setCurrentDuration(durations[currentIdx] || 0);
      setCoachHint(null);

      if (autoSpeakQuestion) {
        handleSpeakQuestion(questions[currentIdx].question);
      }
    }
  }, [currentIdx, sessionActive, questions, showSummary]);

  // Handle Speech Synthesis
  const handleSpeakQuestion = (text: string) => {
    if (isAiSpeaking) {
      voiceEngine.stop();
      setIsAiSpeaking(false);
      return;
    }

    setIsAiSpeaking(true);
    voiceEngine.speak(text, selectedPersona, voiceSpeed, {
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false)
    });
  };

  const handleStopSpeaking = () => {
    voiceEngine.stop();
    setIsAiSpeaking(false);
  };

  // Provide realistic voice coach hint
  const handleRequestCoachHint = () => {
    const q = questions[currentIdx];
    if (!q) return;

    let hint = `Remember the STAR structure. First describe the context clearly, then focus on your exact personal actions, and wrap up with a quantified result.`;
    if (interviewType === 'technical') {
      hint = `Break down the problem into input, output, constraints, and algorithmic trade-offs before writing code.`;
    } else if (interviewType === 'scholarship') {
      hint = `Connect your academic ambitions directly with how you will create transformative impact in your African home community.`;
    }

    setCoachHint(hint);
    setIsAiSpeaking(true);
    voiceEngine.speak(hint, selectedPersona, voiceSpeed, {
      onEnd: () => setIsAiSpeaking(false),
      onError: () => setIsAiSpeaking(false)
    });
  };

  // Start new interview session
  const handleStartSession = async () => {
    voiceEngine.stop();
    setIsAiSpeaking(false);
    setLoadingQuestions(true);
    setSessionActive(true);
    setShowSummary(false);
    setSummaryMetrics(null);
    setCurrentIdx(0);
    setAnswers({});
    setDurations({});
    setFeedbacks({});
    setAudioRecordings({});
    setCurrentDuration(0);

    try {
      const res = await api.getMockInterviewQuestions({
        roleTitle,
        opportunityTitle: selectedOpp?.title,
        interviewType
      });
      setQuestions(res.questions);
    } catch (err) {
      console.error('Failed to load interview questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Live answer update
  const handleAnswerChange = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: val
    }));
    setDurations(prev => ({
      ...prev,
      [currentIdx]: currentDuration
    }));
  };

  // Helper to stop recording cleanly and preserve audio
  const handleStopRecordingCleanly = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // Toggle audio playback for user's recorded response
  const handleTogglePlayUserAudio = () => {
    if (!userAudioRef.current) return;
    if (isPlayingUserAudio) {
      userAudioRef.current.pause();
      setIsPlayingUserAudio(false);
    } else {
      userAudioRef.current.play().then(() => {
        setIsPlayingUserAudio(true);
      }).catch(err => {
        console.warn('Audio playback error:', err);
        setIsPlayingUserAudio(false);
      });
    }
  };

  // Speech Recognition & Microphone Audio Recording
  const handleToggleVoiceInput = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isRecording) {
      handleStopRecordingCleanly();
      return;
    }

    // Determine supported mime type for cross-browser reliability
    let chosenMime = '';
    const candidateMimes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
      for (const m of candidateMimes) {
        if (MediaRecorder.isTypeSupported(m)) {
          chosenMime = m;
          break;
        }
      }
    }

    // Start real audio recording via MediaRecorder
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        audioChunksRef.current = [];

        const mediaRecorder = chosenMime ? new MediaRecorder(stream, { mimeType: chosenMime }) : new MediaRecorder(stream);
        const actualMime = mediaRecorder.mimeType || chosenMime || 'audio/webm';

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioRecordings(prev => ({
              ...prev,
              [currentIdx]: audioUrl
            }));
          }
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
          }
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        setIsTimerRunning(true);
      } catch (err) {
        console.warn('Microphone audio recording not permitted or unavailable:', err);
      }
    }

    // Start real-time speech recognition if supported
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
          setIsTimerRunning(true);
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }

          if (transcript) {
            setAnswers(prev => {
              const existing = prev[currentIdx] || '';
              const combined = existing ? `${existing} ${transcript}` : transcript;
              return {
                ...prev,
                [currentIdx]: combined
              };
            });
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsRecording(true);
        setIsTimerRunning(true);
      }
    } else {
      setIsRecording(true);
      setIsTimerRunning(true);
    }
  };

  // Evaluate current question answer
  const handleEvaluateCurrentAnswer = async () => {
    const text = answers[currentIdx] || '';
    if (!text.trim() || evaluating) return;

    setEvaluating(true);
    try {
      const currentQ = questions[currentIdx];
      const evaluation = await api.evaluateInterviewAnswer({
        question: currentQ.question,
        studentAnswer: text
      });

      setFeedbacks(prev => ({
        ...prev,
        [currentIdx]: evaluation
      }));

      // Optionally speak coach feedback
      if (evaluation.structureFeedback) {
        voiceEngine.speak(
          `Good effort! ${evaluation.structureFeedback}`,
          selectedPersona,
          voiceSpeed,
          {
            onStart: () => setIsAiSpeaking(true),
            onEnd: () => setIsAiSpeaking(false)
          }
        );
      }
    } catch (err) {
      console.error('Evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  // Complete Interview & Generate Summary Dashboard
  const handleFinishAndShowSummary = () => {
    voiceEngine.stop();
    setIsAiSpeaking(false);
    if (recognitionRef.current) recognitionRef.current.stop();
    setIsRecording(false);
    setIsTimerRunning(false);

    // Save final question duration
    const finalDurations = {
      ...durations,
      [currentIdx]: Math.max(15, currentDuration)
    };
    setDurations(finalDurations);

    // Compile comprehensive metrics
    const metrics = generateSessionMetrics(questions, answers, finalDurations);
    setSummaryMetrics(metrics);
    setShowSummary(true);

    // Save session to history
    const sessionRecord = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      roleTitle,
      opportunityTitle: selectedOpp?.title || roleTitle,
      interviewType,
      personaName: selectedPersona.name,
      overallReadinessScore: metrics.overallReadinessScore,
      speechPaceWpm: metrics.averageSpeechPaceWpm,
      fillerCount: metrics.totalFillerCount,
      starRating: metrics.starOverallRating
    };

    const updatedHistory = [sessionRecord, ...history.slice(0, 9)];
    setHistory(updatedHistory);
    try {
      localStorage.setItem('afriversity_mock_interview_history', JSON.stringify(updatedHistory));
    } catch (e) {}
  };

  // Real-time metrics for current answer
  const liveWordCount = currentStudentAnswer.trim() ? currentStudentAnswer.trim().split(/\s+/).length : 0;
  const liveWpm = currentDuration > 5 && liveWordCount > 0 ? Math.round((liveWordCount / currentDuration) * 60) : 0;
  const liveFillers = findFillerWordsInText(currentStudentAnswer);
  const liveStar = analyzeStarStructure(currentStudentAnswer);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Preparation & Practice Loop
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
          Mock Interview Studio & Faculty Scheduling Desk
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Book live 1-on-1 mock interviews directly onto faculty calendars or practice with the AI spoken voice assistant.
        </p>
      </div>

      {/* Sub-Tab Navigation Bar for Students */}
      {!sessionActive && !showSummary && (
        <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2">
          <button
            type="button"
            onClick={() => setStudentMode('calendar_booking')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              studentMode === 'calendar_booking'
                ? 'border-amber-500 text-stone-900 dark:text-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Book Faculty Live Interview (Calendar)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
              Available Slots
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStudentMode('ai_voice')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              studentMode === 'ai_voice'
                ? 'border-amber-500 text-stone-900 dark:text-white font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Voice Mock Interview</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-stone-100 dark:bg-stone-800 text-stone-500">
              Instant
            </span>
          </button>
        </div>
      )}

      {/* SUMMARY DASHBOARD VIEW */}
      {showSummary && summaryMetrics ? (
        <InterviewSummaryDashboard
          metrics={summaryMetrics}
          roleTitle={roleTitle}
          opportunityTitle={selectedOpp?.title}
          interviewType={interviewType}
          persona={selectedPersona}
          audioRecordings={audioRecordings}
          onRetake={handleStartSession}
          onNewSession={() => {
            setShowSummary(false);
            setSessionActive(false);
          }}
        />
      ) : !sessionActive && studentMode === 'calendar_booking' ? (
        <StudentMentorBookingView
          onSwitchToAiMock={() => setStudentMode('ai_voice')}
          onRequestCustomSlot={() => setIsLiveRequestModalOpen(true)}
        />
      ) : !sessionActive ? (
        /* CONFIGURATION SCREEN */
        <div className="space-y-6">
          {/* Live Faculty 1-on-1 Mock Interview Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-xl border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                <span>Verified Faculty Mentorship Option</span>
              </span>
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white">
                Want a Live 1-on-1 Mock Interview with a Verified Faculty Advisor?
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
                Connect directly with an academic mentor for a live 30 or 45-minute video interview session. Receive an official STAR rubric scorecard and personalized feedback for your target opportunity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLiveRequestModalOpen(true)}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Request Live Mentor Session</span>
            </button>
          </div>

          {liveReqSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{liveReqSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Configuration Form (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-stone-900 p-6 sm:p-7 rounded-xl border border-stone-200 dark:border-stone-800 space-y-5 shadow-2xs">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  Set Up Your Spoken Mock Interview
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select your target opportunity, interview format, and preferred AI interviewer persona.
                </p>
              </div>

              <div className="space-y-4">
                {/* Target Opportunity */}
                <div>
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-1.5">
                    Target Opportunity
                  </label>
                  <select
                    value={selectedOppId}
                    onChange={e => {
                      setSelectedOppId(e.target.value);
                      const found = VERIFIED_OPPORTUNITIES.find(o => o.id === e.target.value);
                      if (found) {
                        setRoleTitle(found.title.split('(')[0].trim());
                        if (found.type === 'scholarship') setInterviewType('scholarship');
                        else if (found.type === 'admission') setInterviewType('admissions');
                        else setInterviewType('behavioral');
                      }
                    }}
                    className="w-full text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md p-2.5 text-stone-900 dark:text-white font-medium"
                  >
                    {VERIFIED_OPPORTUNITIES.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.organization} — {o.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-1.5">
                      Target Role / Degree Track
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={e => setRoleTitle(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md p-2.5 text-stone-900 dark:text-white"
                      placeholder="e.g. Software Engineering Intern"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-1.5">
                      Interview Format
                    </label>
                    <select
                      value={interviewType}
                      onChange={e => setInterviewType(e.target.value as any)}
                      className="w-full text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md p-2.5 text-stone-900 dark:text-white font-medium"
                    >
                      <option value="behavioral">Behavioral (STAR Method)</option>
                      <option value="technical">Technical & System Problem Solving</option>
                      <option value="scholarship">Scholarship & Leadership Committee</option>
                      <option value="admissions">University Admissions Board</option>
                    </select>
                  </div>
                </div>

                {/* AI Interviewer Persona Selector */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider mb-2">
                    Select AI Voice Assistant Persona
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VOICE_PERSONAS.map(p => {
                      const isSelected = selectedPersona.id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPersona(p)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-2xs'
                              : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl">{p.avatar}</span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-stone-900 dark:text-white flex items-center justify-between">
                                <span className="truncate">{p.name}</span>
                                {isSelected && (
                                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono font-bold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                                {p.title}
                              </p>
                            </div>
                          </div>
                          <p className="text-[10px] text-stone-600 dark:text-stone-300 mt-2 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Audio Voice Preferences */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={autoSpeakQuestion}
                      onChange={e => setAutoSpeakQuestion(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Automatically read new questions aloud</span>
                  </label>

                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <span>Voice Speed:</span>
                    {[0.85, 1.0, 1.2].map(speed => (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => setVoiceSpeed(speed)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                          voiceSpeed === speed
                            ? 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 font-bold'
                            : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartSession}
                  disabled={loadingQuestions}
                  className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs sm:text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  {loadingQuestions ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Interview Track...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Voice Interview Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Interview History & Pacing Guide (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Voice Persona Showcase Card */}
              <div className="bg-stone-900 text-stone-100 p-5 rounded-xl border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-semibold">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Selected AI Interviewer</span>
                  </div>
                  <span className="text-xl">{selectedPersona.avatar}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedPersona.name}</h3>
                  <p className="text-[11px] text-stone-300">{selectedPersona.title}</p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed bg-stone-800/80 p-2.5 rounded border border-stone-700">
                  "{selectedPersona.description}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span>Accent: {selectedPersona.accent}</span>
                  <button
                    onClick={() => {
                      voiceEngine.speak(
                        `Welcome! I am ${selectedPersona.name}. I look forward to conducting your mock interview today. Take a deep breath, structure your thoughts with the STAR method, and speak with confidence.`,
                        selectedPersona,
                        voiceSpeed
                      );
                    }}
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Sample Voice
                  </button>
                </div>
              </div>

              {/* Past Performance Record Card */}
              <div className="bg-white dark:bg-stone-900 p-5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900 dark:text-white uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Recent Practice Sessions</span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    {history.length} Saved
                  </span>
                </div>

                {history.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-stone-500 py-4 text-center">
                    No past sessions yet. Complete your first session to unlock speech pace and filler word progress trends!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {history.map(item => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 text-xs flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-stone-900 dark:text-white truncate">
                            {item.roleTitle}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                            <span>{item.date}</span>
                            <span>·</span>
                            <span>{item.speechPaceWpm} WPM</span>
                            <span>·</span>
                            <span>{item.fillerCount} fillers</span>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400 shrink-0 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          {item.overallReadinessScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIVE INTERVIEW SESSION */
        <div className="space-y-4">
          {/* Top Session Progress Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedPersona.avatar}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white">
                    {selectedPersona.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200/60 dark:border-amber-800/60">
                    Voice Assistant Active
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  {roleTitle} · {interviewType} round
                </p>
              </div>
            </div>

            {/* Simulated Audio Waveform Bar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 h-5 px-3 py-1 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400 mr-1">
                  {isAiSpeaking ? 'AI Speaking' : isRecording ? 'Listening' : 'Ready'}
                </span>
                {[4, 8, 14, 9, 16, 6, 12, 5].map((height, idx) => (
                  <span
                    key={idx}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      isAiSpeaking
                        ? 'bg-amber-500 animate-pulse'
                        : isRecording
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                    style={{
                      height: isAiSpeaking || isRecording ? `${Math.max(4, (height * (idx % 2 === 0 ? 1.2 : 0.8)))}px` : '4px'
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleFinishAndShowSummary}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-md transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Complete Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Question & Answer Card (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-stone-900 p-5 sm:p-6 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
                    <span className="font-bold text-stone-900 dark:text-white">
                      QUESTION {currentIdx + 1} OF {questions.length}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{interviewType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRequestCoachHint}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      title="Request a verbal hint on how to structure this answer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Coach Hint</span>
                    </button>
                    <span className="text-stone-300 dark:text-stone-700">|</span>
                    <button
                      onClick={() => setSessionActive(false)}
                      className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      Exit Session
                    </button>
                  </div>
                </div>

                {/* Spoken Question Text & Voice Replay Controls */}
                {questions[currentIdx] && (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                        "{questions[currentIdx].question}"
                      </h3>

                      <div className="flex items-center gap-1 shrink-0">
                        {isAiSpeaking ? (
                          <button
                            onClick={handleStopSpeaking}
                            className="p-2 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse flex items-center gap-1"
                            title="Stop speaking"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSpeakQuestion(questions[currentIdx].question)}
                            className="p-2 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                            title="Speak question aloud using Dr. Kwame / Dr. Amara's voice"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {coachHint && (
                      <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong>{selectedPersona.name}'s Coaching Tip:</strong> {coachHint}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Competencies Evaluated:</span>
                      {questions[currentIdx].expectedCompetencies?.map((c: string, ci: number) => (
                        <span key={ci} className="text-[10px] text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded font-mono border border-stone-200/50 dark:border-stone-700/50">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidate Response Text Area with Voice Input */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Your Verbal Response</span>
                      {audioRecordings[currentIdx] && (
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                          Audio Recorded
                        </span>
                      )}
                    </label>

                    {/* Microphone Dictation & Recording Button */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`text-xs px-3 py-1.5 rounded-md border flex items-center gap-1.5 font-bold transition-all shadow-2xs ${
                        isRecording
                          ? 'bg-red-600 text-white border-red-700 animate-pulse'
                          : 'bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-950 border-stone-800 dark:border-amber-600 hover:bg-stone-800 dark:hover:bg-amber-400'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <StopCircle className="w-3.5 h-3.5 animate-spin" />
                          <span>Stop & Save Audio</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5 text-amber-400 dark:text-stone-950" />
                          <span>{audioRecordings[currentIdx] ? 'Re-record Spoken Answer' : 'Record Spoken Answer'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <textarea
                    value={currentStudentAnswer}
                    onChange={e => handleAnswerChange(e.target.value)}
                    rows={5}
                    placeholder="Speak your answer with the microphone to record your audio, or type here using Situation, Task, Action, and Result (STAR)..."
                    className="w-full text-xs sm:text-sm p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
                  />

                  {/* Active Recording State Bar with Live Audio Visualizer */}
                  {isRecording && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex flex-wrap items-center justify-between gap-3 text-xs text-red-700 dark:text-red-300 animate-pulse">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
                        <div>
                          <div className="font-bold flex items-center gap-1.5">
                            <span>Recording Your Spoken Response...</span>
                            <span className="text-[10px] font-mono bg-red-200/60 dark:bg-red-900/60 px-1 rounded">LIVE MIC</span>
                          </div>
                          <p className="text-[11px] opacity-80">
                            Speak articulately. Your audio will be saved and evaluated for speech pace and fillers.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 h-5 px-2 bg-red-100 dark:bg-red-900/50 rounded">
                          {[6, 12, 18, 10, 22, 14, 8, 16].map((h, i) => (
                            <span
                              key={i}
                              className="w-1 bg-red-600 rounded-full animate-bounce"
                              style={{
                                height: `${h}px`,
                                animationDelay: `${i * 70}ms`
                              }}
                            />
                          ))}
                        </div>
                        <span className="font-mono font-bold text-sm bg-red-100 dark:bg-red-900/70 px-2 py-0.5 rounded text-red-900 dark:text-red-100">
                          {currentDuration}s
                        </span>
                        <button
                          type="button"
                          onClick={handleToggleVoiceInput}
                          className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white font-bold rounded text-xs"
                        >
                          Finish Recording
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Recorded Audio Playback & Performance Review Player */}
                  {audioRecordings[currentIdx] && !isRecording && (
                    <div className="p-3.5 bg-stone-900 text-stone-100 dark:bg-stone-950 rounded-xl border border-stone-800 space-y-2.5 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
                            <Mic className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>Playback Spoken Response</span>
                              <span className="text-[9px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-700 px-1.5 py-0.2 rounded font-bold">
                                Ready for review
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400">
                              Review your tone, clarity, and pacing alongside live metrics.
                            </p>
                          </div>
                        </div>

                        {/* Interactive Play/Pause Button */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTogglePlayUserAudio}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            {isPlayingUserAudio ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Pause Playback</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Play My Voice</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (isPlayingUserAudio && userAudioRef.current) {
                                userAudioRef.current.pause();
                                setIsPlayingUserAudio(false);
                              }
                              setAudioRecordings(prev => {
                                const copy = { ...prev };
                                delete copy[currentIdx];
                                return copy;
                              });
                            }}
                            className="text-[11px] text-red-400 hover:text-red-300 hover:underline font-semibold px-2 py-1"
                            title="Discard recording and record again"
                          >
                            Clear & Re-record
                          </button>
                        </div>
                      </div>

                      {/* Native HTML5 Audio Controller & Live Waveform Indicator */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-stone-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-stone-400 uppercase">Voice Waveform:</span>
                          <div className="flex items-center gap-1 h-4 px-2 bg-stone-800 rounded">
                            {[4, 10, 16, 8, 14, 6, 12, 5, 11, 7].map((h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full transition-all duration-150 ${
                                  isPlayingUserAudio
                                    ? 'bg-amber-400 animate-pulse'
                                    : 'bg-stone-600'
                                }`}
                                style={{
                                  height: isPlayingUserAudio ? `${Math.max(4, h * (i % 2 === 0 ? 1.2 : 0.8))}px` : '4px'
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex-1 max-w-sm">
                          <audio
                            ref={userAudioRef}
                            controls
                            src={audioRecordings[currentIdx]}
                            onPlay={() => setIsPlayingUserAudio(true)}
                            onPause={() => setIsPlayingUserAudio(false)}
                            onEnded={() => setIsPlayingUserAudio(false)}
                            onTimeUpdate={(e) => {
                              const el = e.currentTarget;
                              setUserAudioTime(Math.round(el.currentTime));
                              setUserAudioTotalDuration(Math.round(el.duration || 0));
                            }}
                            className="h-8 w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Metrics Floating Bar (Speech Pace, Words, Fillers) */}
                  <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-850/60 border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-mono font-semibold">{currentDuration}s</span>
                      </div>

                      <div className="flex items-center gap-1 text-stone-600 dark:text-stone-400">
                        <span>{liveWordCount} words</span>
                      </div>

                      {liveWpm > 0 && (
                        <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                          <Gauge className="w-3.5 h-3.5 text-amber-600" />
                          <span className="font-mono font-bold">{liveWpm} WPM</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {liveFillers.total > 0 && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          {liveFillers.total} filler phrase{liveFillers.total > 1 ? 's' : ''} detected
                        </span>
                      )}

                      {/* STAR tags */}
                      <div className="flex items-center gap-1 text-[10px] font-mono">
                        <span className={liveStar.situation ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                          S{liveStar.situation ? '✓' : ''}
                        </span>
                        <span className={liveStar.task ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                          T{liveStar.task ? '✓' : ''}
                        </span>
                        <span className={liveStar.action ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                          A{liveStar.action ? '✓' : ''}
                        </span>
                        <span className={liveStar.result ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                          R{liveStar.result ? '✓' : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleEvaluateCurrentAnswer}
                      disabled={!currentStudentAnswer.trim() || evaluating}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {evaluating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing Response...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-stone-950" />
                          <span>Submit for STAR Coaching</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Navigation between questions */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => {
                      voiceEngine.stop();
                      setCurrentIdx(prev => prev - 1);
                    }}
                    className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white disabled:opacity-30"
                  >
                    ← Previous Question
                  </button>

                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => {
                        voiceEngine.stop();
                        setCurrentIdx(prev => prev + 1);
                      }}
                      className="text-xs font-semibold text-stone-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishAndShowSummary}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <span>Finish & View Summary Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback & Coaching Drawer (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>STAR Evaluation & Live Coaching</span>
                  </h3>
                  {feedbacks[currentIdx] && (
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {feedbacks[currentIdx].relevanceScore}% RELEVANCE
                    </span>
                  )}
                </div>

                {!feedbacks[currentIdx] ? (
                  <div className="text-center py-10 space-y-2 text-stone-400 dark:text-stone-500 text-xs">
                    <Clock className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                    <p>Speak or type your answer and click <strong>Submit for STAR Coaching</strong> to receive instant structured feedback.</p>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {/* Spoken feedback button */}
                    <div className="flex items-center justify-between p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80">
                      <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-[11px]">
                        <span>{selectedPersona.avatar}</span>
                        <span>{selectedPersona.name}'s Audio Assessment</span>
                      </div>
                      <button
                        onClick={() => {
                          voiceEngine.speak(
                            feedbacks[currentIdx].structureFeedback || feedbacks[currentIdx].starAnalysis,
                            selectedPersona,
                            voiceSpeed
                          );
                        }}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded text-[11px] font-bold flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Play Advice</span>
                      </button>
                    </div>

                    {/* STAR Breakdown */}
                    <div className="space-y-1">
                      <div className="font-semibold text-stone-800 dark:text-stone-200 text-[11px] uppercase tracking-wider">
                        STAR Structure Analysis
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/80 p-2.5 rounded border border-stone-200 dark:border-stone-700 leading-relaxed">
                        {feedbacks[currentIdx].starAnalysis}
                      </p>
                    </div>

                    {/* Strengths */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <div className="font-semibold text-emerald-800 dark:text-emerald-400 text-[11px] uppercase tracking-wider">
                        What Worked Well
                      </div>
                      {feedbacks[currentIdx].strengths?.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>

                    {/* Improvements */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <div className="font-semibold text-amber-800 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                        Areas to Sharpen
                      </div>
                      {feedbacks[currentIdx].improvements?.map((imp: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Live Interview Request Modal */}
      {isLiveRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-stone-900 dark:text-white">
                  Request Live 1-on-1 Mock Interview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLiveRequestModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createInterviewRequest({
                  studentId: user?.id || 'usr-student-active',
                  studentName: user?.fullName || 'Student Learner',
                  studentEmail: user?.email || 'student@afriversity.org',
                  studentInstitution: user?.institution || 'Verified University',
                  targetOpportunity: selectedOpp?.title || roleTitle,
                  opportunityId: selectedOpp?.id,
                  interviewType: interviewType === 'admissions' ? 'scholarship' : interviewType,
                  requestedDurationMinutes: liveReqDuration,
                  preferredTime: liveReqPreferredTime,
                  studentNotes: liveReqNotes
                });
                setIsLiveRequestModalOpen(false);
                setLiveReqSuccess(`Your 1-on-1 live mock interview request has been dispatched to your assigned faculty mentor!`);
                setTimeout(() => setLiveReqSuccess(null), 5000);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Target Opportunity
                </label>
                <div className="p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-medium">
                  {selectedOpp?.title || roleTitle}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Requested Duration
                  </label>
                  <select
                    value={liveReqDuration}
                    onChange={e => setLiveReqDuration(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes (Full Round)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Preferred Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    value={liveReqPreferredTime}
                    onChange={e => setLiveReqPreferredTime(e.target.value)}
                    placeholder="e.g. Thursday 16:00 GMT"
                    className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  What would you like the mentor to evaluate?
                </label>
                <textarea
                  rows={3}
                  value={liveReqNotes}
                  onChange={e => setLiveReqNotes(e.target.value)}
                  placeholder="e.g. I need guidance on behavioral STAR questions, system design, or scholarship leadership..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white leading-relaxed"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                Your assigned faculty advisor will receive your request on their Advisory Desk, confirm the calendar time slot, and conduct the live mock video interview with you.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsLiveRequestModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Submit Request to Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
