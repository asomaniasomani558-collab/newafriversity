import { VoiceAssistantPersona } from '../types';

export const VOICE_PERSONAS: VoiceAssistantPersona[] = [
  {
    id: 'kwame',
    name: 'Dr. Kwame Mensah',
    title: 'Senior Admissions Fellow & Engineering Dean',
    institution: 'KNUST & Ashesi Faculty Advisory',
    accent: 'Ghanaian & West African English (Baritone)',
    avatar: '👨🏾‍🏫',
    preferredGender: 'male',
    voicePitch: 0.92,
    voiceRate: 0.94,
    description: 'Calm, measured, and distinguished. Dr. Kwame prioritizes structured critical thinking, technical discipline, and clarity.',
    coachingStyle: 'Academic rigor & structured depth'
  },
  {
    id: 'amara',
    name: 'Dr. Amara Okafor',
    title: 'Global Talent Recruiter & Tech Strategist',
    institution: 'Tech Talent Advisory (Lagos & Nairobi)',
    accent: 'African International English (Mezzo-Soprano)',
    avatar: '👩🏾‍💼',
    preferredGender: 'female',
    voicePitch: 1.05,
    voiceRate: 0.98,
    description: 'Dynamic, encouraging, and razor-sharp. Dr. Amara guides candidates to articulate their impact using the STAR method.',
    coachingStyle: 'STAR method & quantified impact'
  },
  {
    id: 'david',
    name: 'David Mwangi',
    title: 'Scholarship & Fellowship Director',
    institution: 'African Leadership Advisory Council',
    accent: 'East African English (Tenor)',
    avatar: '👨🏾‍🎓',
    preferredGender: 'male',
    voicePitch: 0.96,
    voiceRate: 0.96,
    description: 'Supportive, inquisitive, and authentic. David evaluates personal motivation, leadership journey, and community impact.',
    coachingStyle: 'Mission alignment & community impact'
  },
  {
    id: 'zainab',
    name: 'Zainab Al-Hassan',
    title: 'Industry Mentor & Engineering Lead',
    institution: 'African Innovation Fellows',
    accent: 'Crisp West African English (Alto)',
    avatar: '👩🏾‍💻',
    preferredGender: 'female',
    voicePitch: 1.02,
    voiceRate: 0.97,
    description: 'Direct, modern, and pragmatic. Zainab prepares students to handle technical curveballs and communicate with poise.',
    coachingStyle: 'Real-world problem solving & poise'
  }
];

export interface SpeechPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentText: string;
  activePersonaId: string;
}

class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    this.isInitialized = true;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.isInitialized && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Resolve best matching natural voice for a given persona
   */
  public resolveVoiceForPersona(persona: VoiceAssistantPersona): SpeechSynthesisVoice | null {
    const all = this.getVoices();
    if (!all || all.length === 0) return null;

    const isFemale = persona.preferredGender === 'female';

    // 1. Look for English voices with natural tags or specific regional accents
    const candidates = all.filter(v => v.lang.startsWith('en'));

    // Preference priority:
    // a. Voices with name matching male/female keywords and "Natural", "Online", "Google", "Premium"
    const preferredKeywords = isFemale
      ? ['female', 'samantha', 'victoria', 'karen', 'serena', 'zira', 'amy', 'olivia', 'fiona']
      : ['male', 'daniel', 'david', 'george', 'oliver', 'arthur', 'rishi', 'james', 'guy'];

    // High quality matches
    for (const kw of preferredKeywords) {
      const match = candidates.find(v => v.name.toLowerCase().includes(kw));
      if (match) return match;
    }

    // Try Google natural voices
    const googleVoice = candidates.find(v =>
      v.name.includes('Google') && (isFemale ? v.name.includes('Female') : v.name.includes('Male'))
    );
    if (googleVoice) return googleVoice;

    // Fallback to first candidate or first voice
    return candidates[0] || all[0] || null;
  }

  /**
   * Speak structured text using the persona's acoustic parameters
   */
  public speak(
    text: string,
    persona: VoiceAssistantPersona,
    speedMultiplier: number = 1.0,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
      onBoundary?: (charIndex: number) => void;
    }
  ) {
    if (!this.synth) {
      callbacks?.onError?.(new Error('Speech synthesis not supported in this browser.'));
      return;
    }

    // Stop ongoing speech
    this.stop();

    // Clean up text: remove markdown asterisks, hashes, brackets for smooth vocalization
    const cleanedText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const matchedVoice = this.resolveVoiceForPersona(persona);

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Apply persona pitch and speed modulation
    utterance.pitch = Math.max(0.7, Math.min(1.5, persona.voicePitch));
    utterance.rate = Math.max(0.7, Math.min(1.4, persona.voiceRate * speedMultiplier));

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      callbacks?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      callbacks?.onError?.(e);
    };

    utterance.onboundary = (event) => {
      callbacks?.onBoundary?.(event.charIndex);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public isSpeaking(): boolean {
    return !!(this.synth && (this.synth.speaking || this.synth.pending));
  }
}

export const voiceEngine = new VoiceEngine();
