import React, { useState } from 'react';
import {
  Trophy,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
  Volume2,
  Clock,
  FileText,
  Target,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Mic,
  Play,
  Pause,
  Headphones
} from 'lucide-react';
import { MockInterviewMetrics, VoiceAssistantPersona } from '../../types';
import { voiceEngine } from '../../utils/voiceAssistant';

interface Props {
  metrics: MockInterviewMetrics;
  roleTitle: string;
  opportunityTitle?: string;
  interviewType: string;
  persona: VoiceAssistantPersona;
  audioRecordings?: Record<number, string>;
  onRetake: () => void;
  onNewSession: () => void;
}

export const InterviewSummaryDashboard: React.FC<Props> = ({
  metrics,
  roleTitle,
  opportunityTitle,
  interviewType,
  persona,
  audioRecordings,
  onRetake,
  onNewSession
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleSpeakCoachNote = (text: string, id: string) => {
    if (isPlayingAudio === id) {
      voiceEngine.stop();
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(id);
    voiceEngine.speak(text, persona, 1.0, {
      onEnd: () => setIsPlayingAudio(null),
      onError: () => setIsPlayingAudio(null)
    });
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'Distinction', color: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (score >= 80) return { grade: 'High Competence', color: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    if (score >= 70) return { grade: 'Competitive', color: 'text-stone-700 dark:text-stone-300', badge: 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700' };
    return { grade: 'Developing', color: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
  };

  const gradeInfo = getScoreGrade(metrics.overallReadinessScore);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner & High-Level Readiness */}
      <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 rounded-xl p-6 sm:p-7 border border-stone-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Mock Interview Performance Analysis</span>
              <span>·</span>
              <span className="capitalize">{interviewType} Round</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {roleTitle}
            </h1>
            {opportunityTitle && (
              <p className="text-xs text-stone-300">
                Target Opportunity: <strong className="text-amber-300">{opportunityTitle}</strong>
              </p>
            )}
          </div>

          {/* Overall Readiness Score Callout */}
          <div className="flex items-center gap-4 bg-stone-800/80 p-3.5 rounded-lg border border-stone-700">
            <div className="text-right">
              <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                Overall Readiness
              </div>
              <div className="text-xs font-bold text-stone-200">
                {gradeInfo.grade}
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-stone-900 border-2 border-amber-400 flex items-center justify-center text-lg font-extrabold text-amber-400 font-mono shadow-inner">
              {metrics.overallReadinessScore}%
            </div>
          </div>
        </div>

        {/* Voice Persona Evaluator Credit */}
        <div className="pt-3 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">{persona.avatar}</span>
            <span>
              Evaluated by <strong>{persona.name}</strong> ({persona.title})
            </span>
          </div>

          <button
            onClick={() => handleSpeakCoachNote(
              `Hello! Here is your mock interview assessment for the ${roleTitle} opportunity. Your overall readiness score is ${metrics.overallReadinessScore} percent. ${metrics.speechPaceFeedback} ${metrics.coachSummary.actionItem}`,
              'audio-summary'
            )}
            className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700 text-[11px] transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{isPlayingAudio === 'audio-summary' ? 'Stop Coach Voice' : 'Listen to Coach Summary'}</span>
          </button>
        </div>
      </div>

      {/* 2. Core Progress Metrics Grid (4 Key Dimensions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Speech Pace (WPM) */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Gauge className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
              <span>Speech Pace</span>
            </span>
            <span className="font-mono text-[11px] text-stone-400">
              Benchmark: 130-160
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
              {metrics.averageSpeechPaceWpm}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">WPM</span>
          </div>

          {/* Status meter */}
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                metrics.speechPaceStatus === 'optimal'
                  ? 'bg-emerald-500'
                  : metrics.speechPaceStatus === 'too_fast'
                  ? 'bg-amber-500'
                  : 'bg-stone-400'
              }`}
              style={{
                width: `${Math.min(100, Math.max(10, (metrics.averageSpeechPaceWpm / 200) * 100))}%`
              }}
            />
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-snug line-clamp-2">
            {metrics.speechPaceFeedback}
          </p>
        </div>

        {/* Metric 2: Filler Word Count & Density */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Filler Words</span>
            </span>
            <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400">
              {metrics.fillerWordRating.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-white">
              {metrics.totalFillerCount}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              ({metrics.fillerPercentage}% of speech)
            </span>
          </div>

          {/* Filler word tags */}
          <div className="flex flex-wrap gap-1 min-h-[22px]">
            {metrics.fillerWordBreakdown.length === 0 ? (
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> No verbal fillers detected!
              </span>
            ) : (
              metrics.fillerWordBreakdown.slice(0, 3).map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 font-mono"
                >
                  "{f.word}" ({f.count}x)
                </span>
              ))
            )}
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {metrics.fillerPercentage <= 2
              ? 'Superb vocal control and natural pauses.'
              : 'Replace filler phrases with silent 1-second pauses.'}
          </p>
        </div>

        {/* Metric 3: STAR Methodology Articulation */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <BarChart3 className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
              <span>STAR Structure</span>
            </span>
            <span className="font-mono text-stone-900 dark:text-white font-bold">
              {metrics.starOverallRating}%
            </span>
          </div>

          {/* Miniature 4-step bar */}
          <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] pt-1">
            <div className={`p-1 rounded ${metrics.starComponentsFound.situationPercentage >= 50 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`}>
              S ({metrics.starComponentsFound.situationPercentage}%)
            </div>
            <div className={`p-1 rounded ${metrics.starComponentsFound.taskPercentage >= 50 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`}>
              T ({metrics.starComponentsFound.taskPercentage}%)
            </div>
            <div className={`p-1 rounded ${metrics.starComponentsFound.actionPercentage >= 50 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'}`}>
              A ({metrics.starComponentsFound.actionPercentage}%)
            </div>
            <div className={`p-1 rounded ${metrics.starComponentsFound.resultPercentage >= 50 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold' : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold'}`}>
              R ({metrics.starComponentsFound.resultPercentage}%)
            </div>
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {metrics.starComponentsFound.resultPercentage < 60
              ? 'Tip: Always conclude with a measurable result.'
              : 'Strong balance between context, actions, and concrete outcomes.'}
          </p>
        </div>

        {/* Metric 4: Keyword & Competency Alignment */}
        <div className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-4 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Target className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" />
              <span>Competency Hits</span>
            </span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              {metrics.keywordHits.filter(k => k.found).length}/{metrics.keywordHits.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 min-h-[44px]">
            {metrics.keywordHits.slice(0, 4).map((k, i) => (
              <span
                key={i}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  k.found
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-bold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200/50 dark:border-stone-700/50 line-through'
                }`}
              >
                {k.keyword}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            Incorporated core domain and role terms into your verbal evidence.
          </p>
        </div>
      </div>

      {/* 3. Detailed Question-by-Question Spoken Audio & Performance Breakdown */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Spoken Audio Responses & Performance Review
              </h2>
              {audioRecordings && Object.keys(audioRecordings).length > 0 && (
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  <span>{Object.keys(audioRecordings).length} Audio Recorded</span>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Play back your recorded voice responses alongside speech pace (WPM), filler word counts, and STAR articulation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (expandedQuestion === null) setExpandedQuestion(0);
                else setExpandedQuestion(null);
              }}
              className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold"
            >
              {expandedQuestion !== null ? 'Collapse All' : 'Expand Details'}
            </button>
            <span className="text-xs text-stone-400 font-mono">
              · {metrics.perQuestionMetrics.length} Questions
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {metrics.perQuestionMetrics.map((qm, idx) => {
            const isExpanded = expandedQuestion === idx;
            const hasAudio = audioRecordings && audioRecordings[idx];
            return (
              <div
                key={qm.questionId || idx}
                className="border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="p-4 bg-stone-50/70 dark:bg-stone-850/50 hover:bg-stone-100/70 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          "{qm.questionText}"
                        </p>
                        {hasAudio && (
                          <span className="shrink-0 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded font-bold border border-emerald-200 dark:border-emerald-800 hidden sm:inline-flex items-center gap-1">
                            <Mic className="w-2.5 h-2.5" /> Spoken Voice
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                        <span>{qm.wordCount} words</span>
                        <span>·</span>
                        <span className="font-mono">{qm.speechPaceWpm} WPM</span>
                        <span>·</span>
                        <span className={qm.fillerWordCount > 0 ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-emerald-700 dark:text-emerald-400'}>
                          {qm.fillerWordCount} filler{qm.fillerWordCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      {qm.relevanceScore}%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-stone-900 space-y-4 text-xs border-t border-stone-200 dark:border-stone-800">
                    {/* Audio Response Playback Card (First-Class Feature) */}
                    {hasAudio ? (
                      <div className="p-4 bg-stone-900 text-stone-100 rounded-xl border border-stone-800 space-y-3 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0">
                              <Headphones className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2">
                                <span>Playback Your Spoken Response</span>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                                  Candidate Audio
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400">
                                Recorded Duration: {formatDuration(qm.durationSeconds)} · Speech Pace: {qm.speechPaceWpm} WPM
                              </p>
                            </div>
                          </div>

                          {/* Coach Verbal Feedback for this specific answer */}
                          <button
                            type="button"
                            onClick={() => handleSpeakCoachNote(
                              `Here is my evaluation for Question ${idx + 1}. You spoke at ${qm.speechPaceWpm} words per minute with ${qm.fillerWordCount} filler words. ${qm.starBreakdown.result ? 'Your result was clear and quantified.' : 'Make sure to quantify your end result.'}`,
                              `coach-q-${idx}`
                            )}
                            className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded border border-stone-700 text-[11px] transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>{isPlayingAudio === `coach-q-${idx}` ? 'Stop Coach Voice' : `Listen to ${persona.name}'s Note`}</span>
                          </button>
                        </div>

                        {/* Audio Element Player & Audio Waveform Preview */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-800">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-stone-400 uppercase">Spoken Wave:</span>
                            <div className="flex items-center gap-1 h-4 px-2 bg-stone-800 rounded">
                              {[5, 12, 18, 9, 15, 6, 14, 8, 11, 7, 13, 6].map((h, i) => (
                                <span
                                  key={i}
                                  className="w-1 rounded-full bg-amber-400/80"
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="w-full sm:w-auto flex-1 max-w-md">
                            <audio
                              controls
                              src={audioRecordings[idx]}
                              className="h-8 w-full"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-[11px] flex items-center justify-between">
                        <span>Submitted via text editor without microphone recording.</span>
                        <span className="text-[10px] font-mono text-stone-400">Duration: {formatDuration(qm.durationSeconds)}</span>
                      </div>
                    )}

                    {/* Candidate's Transcribed Answer */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-stone-600 dark:text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
                        <span>Verbal Answer Transcript</span>
                        <span>{qm.wordCount} Spoken Words</span>
                      </div>
                      <p className="p-3.5 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 text-stone-800 dark:text-stone-200 leading-relaxed italic">
                        "{qm.answerText || 'No verbal answer recorded.'}"
                      </p>
                    </div>

                    {/* Performance Metrics Breakdown for this answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* 1. Speech Pace Review */}
                      <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-1">
                        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-stone-400 font-semibold">
                          <span>Speech Pace</span>
                          <Gauge className="w-3 h-3 text-stone-500" />
                        </div>
                        <div className="text-base font-mono font-bold text-stone-900 dark:text-white">
                          {qm.speechPaceWpm} <span className="text-xs font-normal text-stone-500">WPM</span>
                        </div>
                        <div className="text-[11px]">
                          {qm.speechPaceWpm >= 130 && qm.speechPaceWpm <= 165 ? (
                            <span className="text-emerald-700 dark:text-emerald-400 font-medium">Optimal conversational pace</span>
                          ) : qm.speechPaceWpm > 165 ? (
                            <span className="text-amber-700 dark:text-amber-400 font-medium">Fast tempo — pause between points</span>
                          ) : (
                            <span className="text-amber-700 dark:text-amber-400 font-medium">Deliberate — increase tempo</span>
                          )}
                        </div>
                      </div>

                      {/* 2. Filler Word Detection */}
                      <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-1">
                        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-stone-400 font-semibold">
                          <span>Filler Word Analysis</span>
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                        </div>
                        <div className="text-base font-mono font-bold text-stone-900 dark:text-white">
                          {qm.fillerWordCount} <span className="text-xs font-normal text-stone-500">detected</span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate">
                          {qm.fillerWords.length > 0 ? qm.fillerWords.join(', ') : 'None! Crisp verbal delivery.'}
                        </p>
                      </div>

                      {/* 3. STAR Breakdown */}
                      <div className="p-3 rounded-lg bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-750 space-y-1">
                        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-stone-400 font-semibold">
                          <span>STAR Structure</span>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                        <div className="flex items-center gap-2 text-xs pt-1 font-mono">
                          <span className={qm.starBreakdown.situation ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                            S{qm.starBreakdown.situation ? '✓' : '✗'}
                          </span>
                          <span className={qm.starBreakdown.task ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                            T{qm.starBreakdown.task ? '✓' : '✗'}
                          </span>
                          <span className={qm.starBreakdown.action ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-400'}>
                            A{qm.starBreakdown.action ? '✓' : '✗'}
                          </span>
                          <span className={qm.starBreakdown.result ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-amber-700 dark:text-amber-400 font-semibold'}>
                            R{qm.starBreakdown.result ? '✓' : '✗'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          {qm.starBreakdown.result ? 'Action & result demonstrated.' : 'Missing quantified outcome.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI Coach Recommendations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
            {metrics.coachSummary.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/60 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Target Areas to Sharpen</span>
          </div>
          <ul className="space-y-2 text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
            {metrics.coachSummary.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
          <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 font-medium">
            <strong>Key takeaway:</strong> {metrics.coachSummary.actionItem}
          </div>
        </div>
      </div>

      {/* 5. Session Actions & Next Steps */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-md border border-stone-200 dark:border-stone-700 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Export / Print Report</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRetake}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white text-xs font-semibold rounded-md border border-stone-200 dark:border-stone-700 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Retake This Session</span>
          </button>

          <button
            onClick={onNewSession}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 text-xs font-bold rounded-md flex items-center gap-2 shadow-2xs transition-colors"
          >
            <span>Practice Another Opportunity</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
