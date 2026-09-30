import { LearningResource, Opportunity, University, UserProfile } from '../types';

export const api = {
  async getOpportunities(params?: {
    q?: string;
    type?: string;
    country?: string;
    remote?: boolean;
    level?: string;
  }): Promise<{ total: number; opportunities: Opportunity[] }> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.country && params.country !== 'all') query.append('country', params.country);
    if (params?.remote) query.append('remote', 'true');
    if (params?.level && params.level !== 'all') query.append('level', params.level);

    const res = await fetch(`/api/opportunities?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    return res.json();
  },

  async getOpportunity(id: string): Promise<Opportunity> {
    const res = await fetch(`/api/opportunities/${id}`);
    if (!res.ok) throw new Error('Opportunity not found');
    return res.json();
  },

  async getUniversities(params?: { country?: string; q?: string }): Promise<{ total: number; universities: University[] }> {
    const query = new URLSearchParams();
    if (params?.country && params.country !== 'all') query.append('country', params.country);
    if (params?.q) query.append('q', params.q);

    const res = await fetch(`/api/universities?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch universities');
    return res.json();
  },

  async getLearningResources(): Promise<LearningResource[]> {
    const res = await fetch('/api/learning-resources');
    if (!res.ok) throw new Error('Failed to fetch learning resources');
    return res.json();
  },

  async chatWithAfriversityAI(payload: {
    message: string;
    history: { role: string; content: string }[];
    context: {
      studentProfile: UserProfile | null;
      currentOpportunity?: Opportunity | null;
      currentUniversity?: University | null;
      readinessStatus?: string;
      readinessScore?: number;
    };
  }): Promise<{ reply: string }> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('AI request failed');
    return res.json();
  },

  async analyzeCv(payload: {
    studentProfile: UserProfile;
    opportunity: Opportunity | null;
    cvText: string;
  }): Promise<any> {
    const res = await fetch('/api/ai/cv-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('CV analysis failed');
    return res.json();
  },

  async getMockInterviewQuestions(payload: {
    roleTitle: string;
    opportunityTitle?: string;
    interviewType: string;
  }): Promise<{ questions: any[] }> {
    const res = await fetch('/api/ai/mock-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_questions',
        ...payload
      })
    });
    if (!res.ok) throw new Error('Failed to generate interview questions');
    return res.json();
  },

  async evaluateInterviewAnswer(payload: {
    question: string;
    studentAnswer: string;
  }): Promise<any> {
    const res = await fetch('/api/ai/mock-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'evaluate_answer',
        ...payload
      })
    });
    if (!res.ok) throw new Error('Failed to evaluate answer');
    return res.json();
  },

  async synthesizeSpeech(payload: {
    text: string;
    voiceName?: string;
    style?: string;
  }): Promise<{ audioUrl?: string; fallback?: boolean; text?: string; voiceName?: string }> {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('TTS request failed');
    return res.json();
  },

  async getInterviewAssist(payload: {
    action: 'greeting' | 'question_tip';
    question?: string;
    roleTitle?: string;
    opportunityTitle?: string;
    interviewType?: string;
    personaName?: string;
  }): Promise<{ message?: string; tip?: string }> {
    const res = await fetch('/api/ai/interview-assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Interview assist request failed');
    return res.json();
  }
};
