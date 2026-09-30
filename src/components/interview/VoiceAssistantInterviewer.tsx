import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Headphones,
  Radio,
  Activity,
  Mic,
  MicOff,
  User,
  ShieldCheck,
  ChevronDown,
  Info
} from 'lucide-react';
import { api } from '../../services/api';

export interface InterviewerPersona {
  id: string;
  name: string;
  role: string;
  voiceName: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir';
  avatarInitials: string;
  accentNote: string;
  focus: string;
  defaultStyle: string;
}

export const INTERVIEWER_PERSONAS: Record<string, InterviewerPersona> = {
  victoria: {
    id: 'victoria',
    name: 'Dr. Victoria Mensah',
    role: 'Admissions & Mastercard Foundation Reviewer',
    voiceName: 'Kore',
    avatarInitials: 'VM',
    accentNote: 'Warm, articulate, encouraging academic tone',
    focus: 'Academic depth, genuine candidate motivation & leadership storytelling',
    defaultStyle: 'Clear, encouraging, natural human interviewer and academic admissions director'
  },
  kwame: {
    id: 'kwame',
    name: 'Kwame Asante',
    role: 'Staff Software Engineer & Technical Hiring Lead',
    voiceName: 'Puck',
    avatarInitials: 'KA',
    accentNote: 'Natural, modern, thoughtful engineering cadence',
    focus: 'Technical problem-solving, architectural trade-offs & data structures',
    defaultStyle: 'Energetic, sharp, thoughtful, and natural technical hiring manager'
  },
  amina: {
    id: 'amina',
    name: 'Amina Diallo',
    role: 'Leadership & Behavioral Assessment Coach',
    voiceName: 'Zephyr',
    avatarInitials: 'AD',
    accentNote: 'Calm, authoritative, reassuring mentor presence',
    focus: 'STAR method, team conflict resolution, ownership & adaptability',
    defaultStyle: 'Calm, authoritative, supportive leadership mentor with measured cadence'
  }
};

interface Props {
  currentQuestion: string;
  questionIndex: number;
  totalQuestions: number;
  interviewType: string;
  roleTitle: string;
  opportunityTitle?: string;
  feedback?: any;
  isEvaluating: boolean;
  isRecordingAnswer: boolean;
  onToggleVoiceInput: () => void;
  onAnswerTranscribed?: (text: string) => void;
}

export const VoiceAssistantInterviewer: React.FC<Props> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  interviewType,
  roleTitle,
  opportunityTitle,
  feedback,
  isEvaluating,
  isRecordingAnswer,
  onToggleVoiceInput
}) => {
  const [selectedPersonaKey, setSelectedPersonaKey] = useState<string>('victoria');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [activeSpeechType, setActiveSpeechType] = useState<'question' | 'tip' | 'feedback' | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [coachingTip, setCoachingTip] = useState<string | null>(null);
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [autoPlayQuestion, setAutoPlayQuestion] = useState(false);
  const [audioCache, setAudioCache] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const persona = INTERVIEWER_PERSONAS[selectedPersonaKey] || INTERVIEWER_PERSONAS.victoria;

  // Cleanup on unmount or question change
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // When question changes, reset tip and optionally auto-play
  useEffect(() => {
    stopAudio();
    setCoachingTip(null);

    if (autoPlayQuestion && currentQuestion) {
      handleSpeak(currentQuestion, 'question');
    }
  }, [questionIndex]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setActiveSpeechType(null);
  };

  // Browser speech synthesis fallback
  const speakWithBrowserFallback = (text: string, voiceName: string) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false);
      setActiveSpeechType(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackSpeed * 0.95;
    utterance.pitch = voiceName === 'Kore' ? 1.05 : voiceName === 'Puck' ? 0.95 : 1.0;

    // Pick best English natural voice if installed
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(
      v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Neural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel'))
    );
    if (bestVoice) utterance.voice = bestVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechType(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechType(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Main speech generation using realistic Gemini TTS API
  const handleSpeak = async (
    textToSpeak: string,
    speechType: 'question' | 'tip' | 'feedback'
  ) => {
    if (isSpeaking && activeSpeechType === speechType) {
      stopAudio();
      return;
    }

    stopAudio();
    setIsGeneratingAudio(true);
    setActiveSpeechType(speechType);

    const cacheKey = `${persona.voiceName}_${textToSpeak.slice(0, 80)}`;

    try {
      // Check cache first for instant replay
      if (audioCache[cacheKey]) {
        playWavAudio(audioCache[cacheKey], speechType);
        setIsGeneratingAudio(false);
        return;
      }

      const res = await api.synthesizeSpeech({
        text: textToSpeak,
        voiceName: persona.voiceName,
        style: persona.defaultStyle
      });

      if (res.audioUrl && !res.fallback) {
        setAudioCache(prev => ({ ...prev, [cacheKey]: res.audioUrl! }));
        playWavAudio(res.audioUrl, speechType);
      } else {
        // Fallback to browser synthesis
        speakWithBrowserFallback(textToSpeak, persona.voiceName);
      }
    } catch (err) {
      console.warn('Realistic TTS request note, using browser fallback:', err);
      speakWithBrowserFallback(textToSpeak, persona.voiceName);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playWavAudio = (audioUrl: string, speechType: 'question' | 'tip' | 'feedback') => {
    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.playbackRate = playbackSpeed;

      audio.onplay = () => {
        setIsSpeaking(true);
        setActiveSpeechType(speechType);
      };
      audio.onended = () => {
        setIsSpeaking(false);
        setActiveSpeechType(null);
      };
      audio.onerror = () => {
        console.warn('WAV audio playback error, falling back');
        speakWithBrowserFallback(currentQuestion, persona.voiceName);
      };

      audio.play().catch(e => {
        console.warn('Play was prevented or interrupted:', e);
        setIsSpeaking(false);
        setActiveSpeechType(null);
      });
    } catch (e) {
      speakWithBrowserFallback(currentQuestion, persona.voiceName);
    }
  };

  const handleRequestTip = async () => {
    if (coachingTip) {
      handleSpeak(coachingTip, 'tip');
      return;
    }

    setIsLoadingTip(true);
    try {
      const res = await api.getInterviewAssist({
        action: 'question_tip',
        question: currentQuestion,
        roleTitle,
        opportunityTitle,
        interviewType,
        personaName: `${persona.name} (${persona.role})`
      });

      const tipText = res.tip || 'Structure your response using Situation, Task, your specific Action, and the final measurable Result.';
      setCoachingTip(tipText);
      handleSpeak(tipText, 'tip');
    } catch (err) {
      console.warn('Error fetching tip:', err);
      const fallbackTip = 'Highlight a specific real story: set the scene, explain your concrete action, and quantify the result.';
      setCoachingTip(fallbackTip);
      handleSpeak(fallbackTip, 'tip');
    } finally {
      setIsLoadingTip(false);
    }
  };

  const handleSpeakFeedback = () => {
    if (!feedback) return;
    const spokenFeedback = `Here is your evaluation: You scored ${feedback.relevanceScore}% on relevance. ${feedback.starAnalysis || ''} Key strength: ${feedback.strengths?.[0] || 'Good initiative'}. Area to sharpen: ${feedback.improvements?.[0] || 'Provide measurable outcomes'}.`;
    handleSpeak(spokenFeedback, 'feedback');
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 sm:p-6 space-y-4 shadow-sm transition-all">
      {/* Top Bar: Persona Card & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-transform ${
              isSpeaking ? 'ring-4 ring-amber-400/40 scale-105' : ''
            } ${
              selectedPersonaKey === 'victoria'
                ? 'bg-amber-500 text-stone-950'
                : selectedPersonaKey === 'kwame'
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}>
              {persona.avatarInitials}
            </div>

            {/* Speaking indicator dot */}
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-stone-900"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-white">
                {persona.name}
              </h3>
              <span className="text-[10px] uppercase font-mono font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-600 animate-pulse" />
                <span>Realistic Voice</span>
              </span>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
              {persona.role}
            </p>
          </div>
        </div>

        {/* Persona Selector & Speed Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPersonaKey}
            onChange={e => {
              stopAudio();
              setSelectedPersonaKey(e.target.value);
            }}
            className="text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            aria-label="Select voice assistant persona"
          >
            <option value="victoria">Dr. Victoria (Scholarship & Academic)</option>
            <option value="kwame">Kwame Asante (Senior Tech Lead)</option>
            <option value="amina">Amina Diallo (Leadership Coach)</option>
          </select>

          {/* Speed Toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-md p-0.5 border border-stone-200 dark:border-stone-700 text-[11px] font-mono">
            {[0.85, 1.0, 1.15].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  setPlaybackSpeed(speed);
                  if (audioRef.current) audioRef.current.playbackRate = speed;
                }}
                className={`px-2 py-0.5 rounded transition-all ${
                  playbackSpeed === speed
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white font-bold shadow-2xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Realistic Voice Assistant Interaction Display */}
      <div className="p-4 rounded-lg bg-stone-50/70 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-700/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Voice Assistant Status:</span>
            </span>

            {isSpeaking ? (
              <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 font-mono text-[11px] animate-pulse">
                <span>Speaking</span>
                <span className="capitalize">({activeSpeechType})</span>
              </span>
            ) : isRecordingAnswer ? (
              <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1 font-mono text-[11px] animate-pulse">
                <span>Listening to you...</span>
              </span>
            ) : isGeneratingAudio ? (
              <span className="text-stone-500 font-mono text-[11px] animate-pulse">
                Synthesizing realistic audio...
              </span>
            ) : (
              <span className="text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                Ready for interaction
              </span>
            )}
          </div>

          {/* Soundwave Bars Animation */}
          <div className="flex items-center gap-1 h-5 px-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(bar => (
              <span
                key={bar}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'bg-amber-500 dark:bg-amber-400 animate-pulse'
                    : isRecordingAnswer
                    ? 'bg-red-500 animate-bounce'
                    : 'bg-stone-300 dark:bg-stone-700 h-1.5'
                }`}
                style={{
                  height: isSpeaking
                    ? `${Math.max(4, (bar * 7) % 20)}px`
                    : isRecordingAnswer
                    ? `${Math.max(6, (bar * 5) % 18)}px`
                    : '4px',
                  animationDelay: `${bar * 90}ms`
                }}
              />
            ))}
          </div>
        </div>

        {/* Actions: Speak Question, Interviewer's Tip, Voice Answer, Feedback */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Main Action: Speak Question Aloud */}
          <button
            type="button"
            onClick={() => handleSpeak(currentQuestion, 'question')}
            disabled={isGeneratingAudio}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-2 transition-all shadow-2xs ${
              isSpeaking && activeSpeechType === 'question'
                ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold ring-2 ring-amber-400/50'
                : 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            {isSpeaking && activeSpeechType === 'question' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-stone-950" />
                <span>Pause Question</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Ask Question Aloud</span>
              </>
            )}
          </button>

          {/* Interviewer Tip */}
          <button
            type="button"
            onClick={handleRequestTip}
            disabled={isLoadingTip || isGeneratingAudio}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-2 transition-all ${
              isSpeaking && activeSpeechType === 'tip'
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{isLoadingTip ? 'Thinking...' : "Interviewer's Secret Tip"}</span>
          </button>

          {/* Voice Input (Speech to Text) */}
          <button
            type="button"
            onClick={onToggleVoiceInput}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-2 transition-all ${
              isRecordingAnswer
                ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
            }`}
          >
            {isRecordingAnswer ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                <span>Stop Voice Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
                <span>Speak Answer (Voice Input)</span>
              </>
            )}
          </button>

          {/* Listen to Feedback (when evaluated) */}
          {feedback && (
            <button
              type="button"
              onClick={handleSpeakFeedback}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md border flex items-center gap-2 transition-all ${
                isSpeaking && activeSpeechType === 'feedback'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Listen to Voice Coaching</span>
            </button>
          )}

          {isSpeaking && (
            <button
              type="button"
              onClick={stopAudio}
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-200/60 dark:hover:bg-stone-700"
              title="Stop playback"
              aria-label="Stop audio playback"
            >
              <VolumeX className="w-4 h-4 text-stone-500" />
            </button>
          )}
        </div>

        {/* Display Tip text if expanded */}
        {coachingTip && (
          <div className="p-3 rounded bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 flex items-start justify-between gap-3 animate-in fade-in duration-150">
            <div className="space-y-0.5">
              <span className="font-bold text-[10px] uppercase font-mono tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>{persona.name}'s Coaching Advice:</span>
              </span>
              <p className="leading-relaxed">{coachingTip}</p>
            </div>
            <button
              type="button"
              onClick={() => handleSpeak(coachingTip, 'tip')}
              className="p-1 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded shrink-0"
              title="Re-listen to coaching tip"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Auto-read toggle & Verification Guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoPlayQuestion}
            onChange={e => setAutoPlayQuestion(e.target.checked)}
            className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
          />
          <span>Automatically read new question aloud when navigating</span>
        </label>

        <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-mono text-[10px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Realistic Speech Powered by Gemini TTS</span>
        </div>
      </div>
    </div>
  );
};
