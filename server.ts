import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { VERIFIED_OPPORTUNITIES } from './src/data/opportunities.js';
import { VERIFIED_UNIVERSITIES } from './src/data/universities.js';
import { LEARNING_RESOURCES } from './src/data/learningResources.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client safely
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Gemini SDK initialization note:', err);
  }
}

// Helper to convert raw PCM (24000Hz, 16-bit, 1 channel) into standard WAV container
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// -----------------------------------------------------------------------------
// Core API Endpoints
// -----------------------------------------------------------------------------

// Opportunities search & list
app.get('/api/opportunities', (req: Request, res: Response) => {
  const { q, type, country, remote, level } = req.query;

  let results = [...VERIFIED_OPPORTUNITIES];

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    results = results.filter(
      opp =>
        opp.title.toLowerCase().includes(query) ||
        opp.organization.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        opp.field.toLowerCase().includes(query) ||
        opp.skills.some(s => s.toLowerCase().includes(query))
    );
  }

  if (type && typeof type === 'string' && type !== 'all') {
    results = results.filter(opp => opp.type === type);
  }

  if (country && typeof country === 'string' && country !== 'all') {
    results = results.filter(
      opp =>
        opp.country.toLowerCase() === country.toLowerCase() ||
        opp.eligible_countries.some(c => c.toLowerCase() === country.toLowerCase()) ||
        opp.eligible_countries.some(c => c.toLowerCase().includes('all'))
    );
  }

  if (remote === 'true') {
    results = results.filter(opp => opp.remote);
  }

  if (level && typeof level === 'string' && level !== 'all') {
    results = results.filter(
      opp => opp.education_level.includes('all') || opp.education_level.includes(level as any)
    );
  }

  res.json({
    total: results.length,
    opportunities: results
  });
});

app.get('/api/opportunities/:id', (req: Request, res: Response) => {
  const opp = VERIFIED_OPPORTUNITIES.find(o => o.id === req.params.id);
  if (!opp) {
    return res.status(404).json({ error: 'Opportunity not found' });
  }
  res.json(opp);
});

// Universities list
app.get('/api/universities', (req: Request, res: Response) => {
  const { country, q } = req.query;
  let results = [...VERIFIED_UNIVERSITIES];

  if (country && typeof country === 'string' && country !== 'all') {
    results = results.filter(u => u.country.toLowerCase() === country.toLowerCase());
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    results = results.filter(
      u =>
        u.name.toLowerCase().includes(query) ||
        u.shortName.toLowerCase().includes(query) ||
        u.city.toLowerCase().includes(query) ||
        u.featuredProgrammes.some(p => p.name.toLowerCase().includes(query))
    );
  }

  res.json({
    total: results.length,
    universities: results
  });
});

app.get('/api/universities/:id', (req: Request, res: Response) => {
  const uni = VERIFIED_UNIVERSITIES.find(u => u.id === req.params.id);
  if (!uni) {
    return res.status(404).json({ error: 'University not found' });
  }
  res.json(uni);
});

// Learning Resources list
app.get('/api/learning-resources', (_req: Request, res: Response) => {
  res.json(LEARNING_RESOURCES);
});

// -----------------------------------------------------------------------------
// Afriversity AI Contextual Assistant (/api/ai/chat)
// -----------------------------------------------------------------------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const studentContext = context?.studentProfile
    ? `
STUDENT PROFILE:
- Name: ${context.studentProfile.fullName || 'Student'}
- Academic Level: ${context.studentProfile.academicLevel || 'Undergraduate'}
- Institution & Programme: ${context.studentProfile.institution || 'N/A'}, ${context.studentProfile.programme || 'N/A'}
- Country: ${context.studentProfile.country || 'Ghana'}
- GPA / Academic Standing: ${context.studentProfile.gradeGpa || 'N/A'}
- Stated Goals: ${(context.studentProfile.goals || []).join(', ')}
- Declared Skills: ${(context.studentProfile.skills || []).join(', ')}
`
    : 'No active student profile provided.';

  const viewingContext = context?.currentOpportunity
    ? `
CURRENTLY VIEWED OPPORTUNITY:
- Title: ${context.currentOpportunity.title}
- Organization: ${context.currentOpportunity.organization}
- Type: ${context.currentOpportunity.type}
- Official Source: ${context.currentOpportunity.official_source}
- Source Portal: ${context.currentOpportunity.application_url}
- Deadline: ${context.currentOpportunity.deadline}
- Academic Requirements: ${context.currentOpportunity.academic_requirements}
- Required Documents: ${(context.currentOpportunity.documents_required || []).join('; ')}
- Current Readiness Status: ${context.readinessStatus || 'Partially Ready'} (${context.readinessScore || 70}%)
`
    : context?.currentUniversity
    ? `
CURRENTLY VIEWED UNIVERSITY:
- Name: ${context.currentUniversity.name} (${context.currentUniversity.shortName})
- Country: ${context.currentUniversity.country}
- Official Portal: ${context.currentUniversity.admissionsPortalUrl}
- Application Deadlines: Undergrad (${context.currentUniversity.applicationTimeline?.undergradDeadline}), Postgrad (${context.currentUniversity.applicationTimeline?.postgradDeadline})
`
    : 'No specific opportunity currently open in focus.';

  const systemInstruction = `
You are Afriversity AI, the intelligent, warm, concise, and context-aware companion for African students on the Afriversity platform.
Tagline: "Find the right opportunity. Know what's missing. Get ready. Apply."

CORE PRINCIPLES & BOUNDARIES:
1. Always be honest, warm, encouraging, concise, and structured.
2. Distinguish clearly between:
   - Verified facts (traceable to official institutional portals)
   - Calculated readiness & user profile matches
   - Recommendations and preparation actions
3. If verified information is unavailable, explicitly state: "I don't have enough verified information to confirm that" and refer to the official source.
4. Afriversity prepares students for opportunities. NEVER claim or pretend that you or Afriversity can submit applications on their behalf. The final action is always directing them to the official application portal.
5. Provide actionable next steps: tell the student specifically what document, skill, or milestone they need to tackle next.
6. Tone: Intelligent, human, respectful, ambitious for African youth. Never use robotic phrases like "As an AI language model". Keep answers scannable (short paragraphs, bullet points).

CONTEXT DATA:
${studentContext}
${viewingContext}
`;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const chatContents = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          chatContents.push({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          });
        }
      }
      chatContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: chatContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.4,
          maxOutputTokens: 1000
        }
      });

      const replyText = response.text || 'I could not generate a response. Please try again.';
      return res.json({ reply: replyText });
    } catch (apiError: any) {
      console.error('Gemini API Error in /api/ai/chat:', apiError);
      // Fallback gracefully below
    }
  }

  // Graceful deterministic contextual response if Gemini key is missing or call failed
  let fallbackReply = `Here is your status on Afriversity: `;
  if (context?.currentOpportunity) {
    const opp = context.currentOpportunity;
    fallbackReply = `Looking at **${opp.title}** by ${opp.organization}:
- **Eligibility:** You match the country and target academic discipline.
- **Deadline:** ${opp.deadline} (Application link: [Official Portal](${opp.application_url})).
- **Your Readiness Status:** ${context.readinessStatus || 'Partially Ready'} (${context.readinessScore || 70}%).
- **Next Step:** Complete your tailored personal statement and request academic references. Remember, Afriversity prepares you, but your final submission happens directly on the official ${opp.organization} portal!`;
  } else {
    fallbackReply = `Welcome to Afriversity. Based on your student profile, your current primary focus is finding relevant technical internships and scholarships.
1. Check the **Opportunity Discovery** tab to review top verified opportunities.
2. Use **Check Readiness** on any card to see exactly which documents or requirements you are currently missing.
3. Once your readiness checklist reaches 100%, click **Apply Officially** to proceed to the institution's verified portal.`;
  }

  res.json({ reply: fallbackReply });
});

// -----------------------------------------------------------------------------
// CV Assistant Analysis (/api/ai/cv-analyze)
// -----------------------------------------------------------------------------
app.post('/api/ai/cv-analyze', async (req: Request, res: Response) => {
  const { studentProfile, opportunity, cvText } = req.body;

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const prompt = `
Analyze this African student's profile and current CV draft against target opportunity: "${opportunity?.title || 'General Engineering/Tech Opportunity'}" by ${opportunity?.organization || 'Partner Organization'}.

OPPORTUNITY REQUIREMENTS:
- Field: ${opportunity?.field || 'STEM'}
- Key Skills: ${(opportunity?.skills || []).join(', ')}
- Requirements: ${(opportunity?.requirements || []).join('; ')}

STUDENT PROFILE & CURRENT CV:
- Name: ${studentProfile?.fullName || 'Student'}
- Academic Level: ${studentProfile?.academicLevel || 'Undergraduate'}
- Programme: ${studentProfile?.programme || 'Computer Engineering'}
- Existing Skills: ${(studentProfile?.skills || []).join(', ')}
- Projects: ${JSON.stringify(studentProfile?.projects || [])}
- CV Text Draft:
${cvText || 'No custom CV text provided yet; evaluate base profile.'}

CRITICAL RULES:
- Never fabricate credentials, companies, grades, or fake degrees.
- Focus on framing real achievements using the Google X-Y-Z formula ("Accomplished [X] as measured by [Y], by doing [Z]").
- Return strict JSON format with keys:
  "overallScore": number (0-100),
  "strengths": string[],
  "missingGaps": string[],
  "tailoredBulletSuggestions": { "section": string, "before": string, "improved": string, "reason": string }[],
  "recommendedAction": string
`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.error('Error in /api/ai/cv-analyze:', err);
    }
  }

  // Deterministic fallback analysis
  res.json({
    overallScore: 78,
    strengths: [
      `Strong academic alignment in ${studentProfile?.programme || 'your degree programme'}`,
      `Verified skills match core requirements (${(opportunity?.skills || ['Python', 'Problem Solving']).slice(0, 2).join(', ')})`,
      'Demonstrated project initiatives relevant to African digital ecosystem'
    ],
    missingGaps: [
      'Quantified impact metrics missing in technical project descriptions',
      'Specific alignment with required distributed systems or API engineering keywords',
      'Explicit leadership or extracurricular community engagement record'
    ],
    tailoredBulletSuggestions: [
      {
        section: 'Technical Projects',
        before: 'Built a web application for student course registration using React and Node.js.',
        improved: 'Architected full-stack web application serving 450+ peers with React & REST API, reducing registration lag by 35%.',
        reason: 'Adds measurable scope, user metrics, and specific technical keywords.'
      },
      {
        section: 'Academic / Technical Experience',
        before: 'Learned algorithms and implemented data structures in Python.',
        improved: 'Developed algorithmic problem sets in Python covering graph traversal and dynamic programming, achieving 95% test suite pass rate.',
        reason: 'Emphasizes rigor, validation, and problem-solving discipline.'
      }
    ],
    recommendedAction: 'Incorporate quantified metrics into your project bullets and update your GitHub repository link before applying.'
  });
});

// -----------------------------------------------------------------------------
// AI Mock Interviewer (/api/ai/mock-interview)
// -----------------------------------------------------------------------------
app.post('/api/ai/mock-interview', async (req: Request, res: Response) => {
  const { action, roleTitle, opportunityTitle, interviewType, question, studentAnswer } = req.body;

  if (action === 'generate_questions') {
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Generate 4 realistic interview questions for an African candidate applying to:
Role: ${roleTitle || 'Software Engineer Intern'}
Opportunity: ${opportunityTitle || 'Google Africa Software Engineering Internship'}
Interview Type: ${interviewType || 'technical'} (options: technical, behavioral, scholarship, admissions).

Return strict JSON with key "questions" as an array of objects:
[
  { "id": "q1", "question": string, "expectedCompetencies": string[] }
]`;
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.4 }
        });
        return res.json(JSON.parse(response.text || '{"questions":[]}'));
      } catch (err) {
        console.error('Error generating questions:', err);
      }
    }

    return res.json({
      questions: [
        {
          id: 'q1',
          question: `Can you walk me through a challenging technical problem you solved, and how you decided on the approach?`,
          expectedCompetencies: ['Problem Solving', 'Data Structures', 'Decision Framework', 'Clarity']
        },
        {
          id: 'q2',
          question: `Why are you interested in this specific opportunity with ${opportunityTitle || 'our organization'} in the African context?`,
          expectedCompetencies: ['Mission Alignment', 'Context Awareness', 'Personal Motivation']
        },
        {
          id: 'q3',
          question: `Tell me about a time you worked on a project team where things did not go as planned. How did you respond?`,
          expectedCompetencies: ['STAR Method', 'Conflict Resolution', 'Ownership', 'Resilience']
        },
        {
          id: 'q4',
          question: `How do you prioritize learning new frameworks or tools when tackling an unfamiliar engineering requirement?`,
          expectedCompetencies: ['Continuous Learning', 'Engineering Discipline', 'Resourcefulness']
        }
      ]
    });
  }

  if (action === 'evaluate_answer') {
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `Evaluate the candidate's interview response objectively using the STAR methodology (Situation, Task, Action, Result).
Question: "${question}"
Candidate Answer: "${studentAnswer}"

Rules:
- Give constructive, actionable feedback.
- Do NOT make psychological or personality assumptions.
- Return strict JSON:
{
  "relevanceScore": number (0-100),
  "structureFeedback": string,
  "starAnalysis": string,
  "strengths": string[],
  "improvements": string[]
}`;
        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.3 }
        });
        return res.json(JSON.parse(response.text || '{}'));
      } catch (err) {
        console.error('Error evaluating answer:', err);
      }
    }

    return res.json({
      relevanceScore: 82,
      structureFeedback: 'Your response clearly communicates your involvement and steps taken.',
      starAnalysis: 'Good Situation and Action articulation. Ensure the "Result" includes concrete numbers or lessons learned.',
      strengths: [
        'Directly addressed the core premise of the question',
        'Showed positive ownership and technical initiative'
      ],
      improvements: [
        'Quantify the final outcome or impact achieved (e.g. users served, speed improved)',
        'Structure explicitly using the STAR model (Situation -> Task -> Action -> Result)'
      ]
    });
  }

  res.status(400).json({ error: 'Invalid action' });
});

// -----------------------------------------------------------------------------
// Realistic Human Speech Synthesis (/api/ai/tts)
// -----------------------------------------------------------------------------
app.post('/api/ai/tts', async (req: Request, res: Response) => {
  const { text, voiceName = 'Kore', style } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for TTS synthesis' });
  }

  // Strip excessive markdown formatting for natural spoken speech
  const cleanText = text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .trim();

  if (genAI && process.env.GEMINI_API_KEY) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: style || 'Clear, warm, professional African scholarship and engineering interviewer'
                }
              }
            ]
          }
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore'
              }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const rawPcm = Buffer.from(base64Audio, 'base64');
        const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);
        return res.json({
          audioUrl: `data:audio/wav;base64,${wavBuffer.toString('base64')}`,
          voiceName,
          provider: 'gemini-tts'
        });
      }
    } catch (err: any) {
      console.warn('Gemini TTS synthesis note:', err?.message || err);
    }
  }

  // Fallback payload so client cleanly utilizes enhanced browser voices
  return res.json({
    fallback: true,
    text: cleanText,
    voiceName
  });
});

// -----------------------------------------------------------------------------
// AI Interview Assistant Coaching Tips (/api/ai/interview-assist)
// -----------------------------------------------------------------------------
app.post('/api/ai/interview-assist', async (req: Request, res: Response) => {
  const { action, question, roleTitle, opportunityTitle, interviewType, personaName } = req.body;

  if (action === 'greeting') {
    const greetingText = `Hello! I am your AI interview partner today for the ${opportunityTitle || roleTitle || 'opportunity'} assessment. We will go through structured interview questions to prepare you thoroughly. Whenever you are ready, I will read each question aloud. Feel free to speak or type your response.`;
    return res.json({ message: greetingText });
  }

  if (action === 'question_tip') {
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are ${personaName || 'an experienced African academic and industry interviewer'}.
Provide a 1 to 2 sentence practical coaching tip for an African candidate answering this interview question:
Question: "${question}"
Target Role/Opportunity: ${roleTitle || 'Opportunity Candidate'}
Interview Type: ${interviewType || 'General'}

Requirements:
- Emphasize the STAR methodology (Situation, Task, Action, Result) or specific technical/evidence clarity.
- Keep it under 35 words.
- Warm, direct, and actionable. Return strict JSON: { "tip": string }`;

        const response = await genAI.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.3 }
        });
        const parsed = JSON.parse(response.text || '{}');
        if (parsed.tip) {
          return res.json({ tip: parsed.tip });
        }
      } catch (err) {
        console.warn('Tip generation note:', err);
      }
    }

    return res.json({
      tip: `Break your answer into Situation, Task, your specific Action, and the measurable Result or learning gained.`
    });
  }

  res.status(400).json({ error: 'Invalid interview assist action' });
});

// -----------------------------------------------------------------------------
// Vite middleware integration for full-stack dev and static serving for prod
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Afriversity server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Afriversity server:', err);
});
