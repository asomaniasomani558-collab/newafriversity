import {
  CompetencyKeywordHit,
  DetectedFillerWord,
  MockInterviewMetrics,
  QuestionPerformanceMetric
} from '../types';

export const COMMON_FILLER_WORDS = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you know',
  'actually',
  'basically',
  'literally',
  'sort of',
  'kind of',
  'honestly',
  'obviously',
  'i mean',
  'so yeah',
  'kinda'
];

export const STAR_CUE_WORDS = {
  situation: ['situation', 'context', 'background', 'when', 'at', 'during', 'initially', 'project', 'school', 'university'],
  task: ['task', 'objective', 'goal', 'challenge', 'assigned', 'responsible', 'needed to', 'problem', 'target'],
  action: ['action', 'implemented', 'built', 'developed', 'designed', 'researched', 'executed', 'collaborated', 'created', 'solved', 'led', 'organized'],
  result: ['result', 'outcome', 'impact', 'improved', 'increased', 'reduced', 'achieved', 'percent', '%', 'metric', 'delivered', 'learned', 'success']
};

export const findFillerWordsInText = (text: string): { total: number; breakdown: DetectedFillerWord[] } => {
  if (!text) return { total: 0, breakdown: [] };

  const lower = text.toLowerCase();
  const counts: Record<string, number> = {};
  let total = 0;

  for (const filler of COMMON_FILLER_WORDS) {
    // Word boundary matching
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      counts[filler] = matches.length;
      total += matches.length;
    }
  }

  const breakdown: DetectedFillerWord[] = Object.entries(counts)
    .map(([word, count]) => ({
      word,
      count,
      examples: [`"...${word}..."`]
    }))
    .sort((a, b) => b.count - a.count);

  return { total, breakdown };
};

export const analyzeStarStructure = (text: string): {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
  score: number;
} => {
  const lower = text.toLowerCase();

  const hasSituation = STAR_CUE_WORDS.situation.some(w => lower.includes(w));
  const hasTask = STAR_CUE_WORDS.task.some(w => lower.includes(w));
  const hasAction = STAR_CUE_WORDS.action.some(w => lower.includes(w));
  const hasResult = STAR_CUE_WORDS.result.some(w => lower.includes(w));

  let count = 0;
  if (hasSituation) count++;
  if (hasTask) count++;
  if (hasAction) count++;
  if (hasResult) count++;

  const score = Math.round((count / 4) * 100);

  return {
    situation: hasSituation,
    task: hasTask,
    action: hasAction,
    result: hasResult,
    score
  };
};

export const matchCompetencyKeywords = (
  text: string,
  expectedCompetencies: string[]
): CompetencyKeywordHit[] => {
  const lower = text.toLowerCase();
  const hits: CompetencyKeywordHit[] = [];

  // Match expected competencies
  for (const comp of expectedCompetencies) {
    const compLower = comp.toLowerCase();
    const words = compLower.split(/\s+/);
    const found = words.some(w => w.length > 3 && lower.includes(w));
    hits.push({
      keyword: comp,
      found,
      count: found ? 1 : 0,
      category: 'technical'
    });
  }

  // Key impact & structural words
  const keyDomainTerms = ['collaborated', 'measured', 'framework', 'tested', 'initiative', 'deadline', 'impact'];
  for (const term of keyDomainTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      hits.push({
        keyword: term,
        found: true,
        count: matches.length,
        category: 'impact'
      });
    }
  }

  return hits;
};

export const computeQuestionMetric = (
  questionId: string,
  questionText: string,
  answerText: string,
  durationSeconds: number,
  expectedCompetencies: string[],
  relevanceScore: number = 80
): QuestionPerformanceMetric => {
  const words = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const safeDuration = Math.max(5, durationSeconds);
  const speechPaceWpm = words > 0 ? Math.round((words / safeDuration) * 60) : 0;

  const { total: fillerWordCount, breakdown } = findFillerWordsInText(answerText);
  const star = analyzeStarStructure(answerText);
  const keywordHits = matchCompetencyKeywords(answerText, expectedCompetencies);

  return {
    questionId,
    questionText,
    answerText,
    wordCount: words,
    durationSeconds: safeDuration,
    speechPaceWpm,
    fillerWordCount,
    fillerWords: breakdown.map(b => `${b.word} (${b.count}x)`),
    relevanceScore,
    starBreakdown: {
      situation: star.situation,
      task: star.task,
      action: star.action,
      result: star.result
    },
    keywordsMatched: keywordHits.filter(k => k.found).map(k => k.keyword)
  };
};

export const generateSessionMetrics = (
  questions: { id: string; question: string; expectedCompetencies: string[]; relevanceScore?: number }[],
  answers: Record<number, string>,
  durations: Record<number, number>
): MockInterviewMetrics => {
  const perQuestionMetrics: QuestionPerformanceMetric[] = [];
  let totalWords = 0;
  let totalSeconds = 0;
  let aggregatedFillers: Record<string, number> = {};
  let totalStarSituation = 0;
  let totalStarTask = 0;
  let totalStarAction = 0;
  let totalStarResult = 0;
  let totalRelevance = 0;

  const validAnswerIndices = Object.keys(answers)
    .map(Number)
    .filter(idx => answers[idx] && answers[idx].trim().length > 0);

  const numAnswered = Math.max(1, validAnswerIndices.length);

  for (const idx of validAnswerIndices) {
    const q = questions[idx];
    if (!q) continue;

    const answer = answers[idx] || '';
    const duration = durations[idx] || 45;
    const metric = computeQuestionMetric(
      q.id,
      q.question,
      answer,
      duration,
      q.expectedCompetencies || [],
      q.relevanceScore || 82
    );

    perQuestionMetrics.push(metric);
    totalWords += metric.wordCount;
    totalSeconds += metric.durationSeconds;
    totalRelevance += metric.relevanceScore;

    if (metric.starBreakdown.situation) totalStarSituation++;
    if (metric.starBreakdown.task) totalStarTask++;
    if (metric.starBreakdown.action) totalStarAction++;
    if (metric.starBreakdown.result) totalStarResult++;

    const { breakdown } = findFillerWordsInText(answer);
    for (const b of breakdown) {
      aggregatedFillers[b.word] = (aggregatedFillers[b.word] || 0) + b.count;
    }
  }

  const averageSpeechPaceWpm = totalSeconds > 0 && totalWords > 0
    ? Math.round((totalWords / totalSeconds) * 60)
    : 135;

  let speechPaceStatus: 'optimal' | 'too_fast' | 'too_slow' | 'balanced' = 'optimal';
  let speechPaceFeedback = 'Excellent pacing! Your verbal delivery matches the 130–160 WPM benchmark of top interviewees.';

  if (averageSpeechPaceWpm < 115) {
    speechPaceStatus = 'too_slow';
    speechPaceFeedback = 'Pacing is slightly deliberate (<115 WPM). Try maintaining vocal momentum between sentences.';
  } else if (averageSpeechPaceWpm > 168) {
    speechPaceStatus = 'too_fast';
    speechPaceFeedback = 'Pacing is very brisk (>168 WPM). Use brief 1-second pauses after key points to let results sink in.';
  }

  const totalFillerCount = Object.values(aggregatedFillers).reduce((sum, c) => sum + c, 0);
  const fillerPercentage = totalWords > 0 ? Number(((totalFillerCount / totalWords) * 100).toFixed(1)) : 0;

  let fillerWordRating: 'exceptional' | 'good' | 'moderate' | 'high_filler_density' = 'exceptional';
  if (fillerPercentage > 6) {
    fillerWordRating = 'high_filler_density';
  } else if (fillerPercentage > 3.5) {
    fillerWordRating = 'moderate';
  } else if (fillerPercentage > 1.5) {
    fillerWordRating = 'good';
  }

  const fillerWordBreakdown: DetectedFillerWord[] = Object.entries(aggregatedFillers)
    .map(([word, count]) => ({
      word,
      count,
      examples: [`used ${count} time${count > 1 ? 's' : ''}`]
    }))
    .sort((a, b) => b.count - a.count);

  const situationPct = Math.round((totalStarSituation / numAnswered) * 100);
  const taskPct = Math.round((totalStarTask / numAnswered) * 100);
  const actionPct = Math.round((totalStarAction / numAnswered) * 100);
  const resultPct = Math.round((totalStarResult / numAnswered) * 100);

  const starOverallRating = Math.round((situationPct + taskPct + actionPct + resultPct) / 4);

  // Keyword hits across all questions
  const allCompetencies = Array.from(new Set(questions.flatMap(q => q.expectedCompetencies || [])));
  const combinedAnswers = Object.values(answers).join(' ');
  const keywordHits = matchCompetencyKeywords(combinedAnswers, allCompetencies);

  // Overall scores
  const clarityScore = Math.max(60, Math.min(98, Math.round(95 - fillerPercentage * 3)));
  const confidenceScore = Math.max(60, Math.min(96, Math.round(
    speechPaceStatus === 'optimal' ? 92 : speechPaceStatus === 'too_fast' ? 78 : 82
  )));

  const avgRelevance = Math.round(totalRelevance / numAnswered);
  const overallReadinessScore = Math.round(
    avgRelevance * 0.4 + starOverallRating * 0.3 + clarityScore * 0.15 + confidenceScore * 0.15
  );

  const strengths: string[] = [];
  const improvements: string[] = [];

  if (speechPaceStatus === 'optimal') {
    strengths.push('Superb conversational tempo (130-160 WPM), allowing interviewers to absorb your points easily.');
  }
  if (fillerWordRating === 'exceptional' || fillerWordRating === 'good') {
    strengths.push(`Minimal filler word intrusion (${fillerPercentage}% of speech), projecting confidence and composure.`);
  }
  if (actionPct >= 75) {
    strengths.push('Strong articulation of direct ownership and engineering/leadership actions taken.');
  }

  if (resultPct < 60) {
    improvements.push('Quantify the final Result more frequently. Add numbers, percentages, test coverage, or specific outcomes.');
  }
  if (fillerWordRating === 'high_filler_density' || fillerWordRating === 'moderate') {
    const topFiller = fillerWordBreakdown[0]?.word || 'filler words';
    improvements.push(`Replace repetitive "${topFiller}" verbal fillers with deliberate 1-second silent pauses.`);
  }
  if (speechPaceStatus === 'too_fast') {
    improvements.push('Pace yourself during complex technical explanations to prevent rushing through critical steps.');
  }

  if (strengths.length === 0) {
    strengths.push('Engaged actively and answered all mock interview questions thoroughly.');
  }
  if (improvements.length === 0) {
    improvements.push('Continue practicing cross-examination and rapid behavioral storytelling.');
  }

  return {
    totalWords,
    totalDurationSeconds: totalSeconds,
    averageSpeechPaceWpm,
    speechPaceStatus,
    speechPaceFeedback,
    totalFillerCount,
    fillerPercentage,
    fillerWordRating,
    fillerWordBreakdown,
    starOverallRating,
    starComponentsFound: {
      situationPercentage: situationPct,
      taskPercentage: taskPct,
      actionPercentage: actionPct,
      resultPercentage: resultPct
    },
    keywordHits,
    clarityScore,
    confidenceScore,
    overallReadinessScore,
    perQuestionMetrics,
    coachSummary: {
      strengths,
      improvements,
      actionItem: `Focus on the Google X-Y-Z formula for your next session: "Accomplished [X] as measured by [Y], by doing [Z]".`
    }
  };
};
