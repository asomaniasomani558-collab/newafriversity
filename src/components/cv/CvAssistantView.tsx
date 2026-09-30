import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VERIFIED_OPPORTUNITIES } from '../../data/opportunities';
import { api } from '../../services/api';
import { Opportunity } from '../../types';
import { MentorCvReviewDesk } from './MentorCvReviewDesk';

export const CvAssistantView: React.FC = () => {
  const { user, updateProfile } = useApp();

  if (user?.role === 'mentor') {
    return <MentorCvReviewDesk />;
  }

  const [selectedOppId, setSelectedOppId] = useState<string>(
    VERIFIED_OPPORTUNITIES[1].id // Default to Google Software Engineering Internship
  );

  const [cvSummary, setCvSummary] = useState(
    user?.cvSummary ||
      'Third-year Computer Engineering undergraduate at KNUST with distinction standing. Experienced in algorithmic problem solving in Python and C++, full-stack web architectures, and collaborative software engineering projects. Passionate about scalable African tech infrastructure.'
  );

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedOpp = VERIFIED_OPPORTUNITIES.find(o => o.id === selectedOppId) || null;

  const handleRunAnalysis = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeCv({
        studentProfile: user,
        opportunity: selectedOpp,
        cvText: cvSummary
      });
      setAnalysisResult(res);
    } catch (err) {
      console.error('CV analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Opportunity Tailoring & Readiness
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
            CV Assistant
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Align your verified achievements with target opportunity requirements. Never fabricates credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Target Opportunity Selector Banner */}
      <div className="no-print bg-stone-900 dark:bg-stone-950 text-stone-100 p-4 sm:p-5 rounded-lg border border-stone-800 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold">
              STEP 1 · TARGET OPPORTUNITY
            </span>
            <div className="text-sm font-bold text-white">
              Tailor this CV specifically for:
            </div>
          </div>

          <select
            value={selectedOppId}
            onChange={e => {
              setSelectedOppId(e.target.value);
              setAnalysisResult(null);
            }}
            className="text-xs bg-stone-800 dark:bg-stone-900 text-stone-100 border border-stone-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 max-w-md"
          >
            {VERIFIED_OPPORTUNITIES.map(o => (
              <option key={o.id} value={o.id}>
                {o.organization} — {o.title}
              </option>
            ))}
          </select>
        </div>

        {selectedOpp && (
          <div className="text-xs text-stone-300 pt-2 border-t border-stone-800 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>Key skills: <strong>{selectedOpp.skills.join(', ')}</strong></span>
            <span>·</span>
            <span>Academic requirements: <strong>{selectedOpp.academic_requirements}</strong></span>
          </div>
        )}
      </div>

      {/* Two Column Layout: Editor & Live AI Alignment */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CV Draft & Profile Information (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-stone-900 dark:text-white text-sm tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span>Professional Summary & Technical Narrative</span>
              </h2>
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-stone-950 text-white rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-2xs"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Alignment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-stone-950" />
                    <span>Analyze Alignment with Opportunity</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <textarea
                value={cvSummary}
                onChange={e => {
                  setCvSummary(e.target.value);
                  updateProfile({ cvSummary: e.target.value });
                }}
                rows={5}
                className="w-full text-xs sm:text-sm p-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white rounded-md focus:outline-none focus:ring-1 focus:ring-stone-900 dark:focus:ring-amber-500 font-sans leading-relaxed"
                placeholder="Write your professional summary tailored to African and international reviewers..."
              />
            </div>

            {/* Profile Projects Section */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                <span>Verified Student Projects in Profile</span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-normal">Pulled from My Afriversity</span>
              </div>

              <div className="space-y-2">
                {user?.projects.map(proj => (
                  <div key={proj.id} className="p-3 rounded-md bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs space-y-1">
                    <div className="font-bold text-stone-900 dark:text-white">{proj.title}</div>
                    <p className="text-stone-600 dark:text-stone-300">{proj.description}</p>
                    {proj.techStack && (
                      <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono pt-1">
                        Stack: {proj.techStack.join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Hallucination Disclaimer */}
            <div className="bg-amber-50/60 dark:bg-amber-950/40 p-3 rounded border border-amber-200/70 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Zero Falsehood Policy:</strong> Afriversity AI improves phrasing, conciseness, and framing of your actual projects. We will never invent fake internships, companies, or degrees.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Suggested Rewrites (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 p-5 rounded-lg border border-stone-200 dark:border-stone-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Opportunity Alignment Feedback</span>
              </h3>
              {analysisResult && (
                <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  {analysisResult.overallScore}% MATCH
                </span>
              )}
            </div>

            {!analysisResult && !analyzing ? (
              <div className="text-center py-10 space-y-2">
                <Sparkles className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                  Click <strong>Analyze Alignment</strong> to check your CV against {selectedOpp?.title}.
                </p>
              </div>
            ) : analyzing ? (
              <div className="text-center py-12 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-600 dark:text-amber-400 mx-auto" />
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Comparing profile, opportunity keywords, and drafting impact bullets...
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Strengths */}
                <div className="space-y-1.5">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-400 text-[11px] uppercase tracking-wider">
                    Confirmed Strengths
                  </div>
                  {analysisResult.strengths?.map((str: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>

                {/* Missing Gaps */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="font-semibold text-amber-800 dark:text-amber-400 text-[11px] uppercase tracking-wider">
                    Missing Information / Gaps
                  </div>
                  {analysisResult.missingGaps?.map((gap: string, i: number) => (
                    <div key={i} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>

                {/* Suggested Impact Bullets (Google X-Y-Z formula) */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="font-semibold text-stone-800 dark:text-stone-200 text-[11px] uppercase tracking-wider">
                    Tailored Impact Rewrites (X-Y-Z Method)
                  </div>
                  {analysisResult.tailoredBulletSuggestions?.map((item: any, i: number) => (
                    <div key={i} className="bg-stone-50 dark:bg-stone-800/70 p-3 rounded border border-stone-200 dark:border-stone-700 space-y-1.5">
                      <div className="text-[10px] font-mono text-stone-500 dark:text-stone-400 font-bold uppercase">{item.section}</div>
                      <div className="text-stone-400 dark:text-stone-500 line-through text-[11px]">{item.before}</div>
                      <div className="text-stone-900 dark:text-white font-medium text-xs bg-white dark:bg-stone-900 p-2 rounded border border-stone-100 dark:border-stone-800">
                        {item.improved}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 pt-1">
                        <span>{item.reason}</span>
                        <button
                          onClick={() => copyText(item.improved, `bullet-${i}`)}
                          className="text-stone-700 dark:text-stone-200 hover:text-stone-950 dark:hover:text-white font-semibold flex items-center gap-1"
                        >
                          {copiedId === `bullet-${i}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === `bullet-${i}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actionable recommendation */}
                <div className="p-3 bg-stone-900 dark:bg-stone-950 text-stone-100 rounded text-xs space-y-1">
                  <div className="font-semibold text-amber-400 text-[10px] uppercase font-mono">
                    Recommended Action
                  </div>
                  <p className="text-stone-200 leading-relaxed">{analysisResult.recommendedAction}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clean Formatted CV View */}
      <div className="bg-white dark:bg-stone-900 p-8 sm:p-10 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 max-w-4xl mx-auto">
        <div className="no-print pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
          <span>CLEAN FORMATTED CV VIEW</span>
          <span>READY FOR EXPORT / PRINT</span>
        </div>

        {/* CV Header */}
        <div className="border-b border-stone-300 dark:border-stone-700 pb-4 text-center space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white uppercase">
            {user?.fullName || 'Victoria Mensah'}
          </h2>
          <div className="text-xs text-stone-600 dark:text-stone-300 font-medium flex flex-wrap justify-center items-center gap-2">
            <span>{user?.city || 'Kumasi'}, {user?.country || 'Ghana'}</span>
            <span>·</span>
            <span>{user?.email || 'student@university.edu'}</span>
            <span>·</span>
            <span>{user?.phone || '+233 24 555 0192'}</span>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-1">
            Professional Summary
          </h3>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            {cvSummary}
          </p>
        </div>

        {/* Education */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-1">
            Education
          </h3>
          <div className="flex justify-between items-baseline text-xs">
            <div>
              <strong className="text-stone-900 dark:text-white">{user?.institution || 'Kwame Nkrumah University of Science and Technology (KNUST)'}</strong>
              <div className="text-stone-600 dark:text-stone-400">{user?.programme || 'BSc Computer Engineering'} · GPA: {user?.gradeGpa || '3.82 / 4.0'}</div>
            </div>
            <span className="font-mono text-stone-500 dark:text-stone-400 text-[11px]">Expected {user?.graduationYear || 2027}</span>
          </div>
        </div>

        {/* Technical Projects */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-1">
            Selected Technical Projects
          </h3>
          {user?.projects.map(proj => (
            <div key={proj.id} className="text-xs space-y-0.5">
              <div className="flex justify-between items-baseline">
                <strong className="text-stone-900 dark:text-white">{proj.title}</strong>
                {proj.techStack && (
                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">[{proj.techStack.join(', ')}]</span>
                )}
              </div>
              <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">{proj.description}</p>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-1">
            Skills & Competencies
          </h3>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <strong>Core Skills:</strong> {user?.skills.join(', ') || 'Python, C++, Data Structures, React, Git, System Design'}.
          </p>
        </div>
      </div>
    </div>
  );
};
