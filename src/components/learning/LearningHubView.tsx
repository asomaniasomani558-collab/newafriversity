import React from 'react';
import {
  BookOpen,
  ExternalLink,
  Target,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LEARNING_RESOURCES } from '../../data/learningResources';

export const LearningHubView: React.FC = () => {
  const { user, setActiveTab } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Targeted Skill Readiness
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight mt-1">
          Learning Hub
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
          Targeted micro-courses and preparation guides directly mapped to missing requirements across your target opportunities.
        </p>
      </div>

      {/* Rationale Banner */}
      <div className="bg-stone-900 dark:bg-stone-950 text-stone-100 p-5 rounded-lg border border-stone-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <Target className="w-4 h-4" />
          <span>CONNECTED TO OPPORTUNITY READINESS GAPS</span>
        </div>
        <h2 className="text-base font-bold text-white">
          Why are these courses recommended to you?
        </h2>
        <p className="text-xs text-stone-300 leading-relaxed max-w-3xl">
          Unlike generic online course platforms, every resource in Afriversity directly resolves a specific missing requirement or interview competency from your active applications.
        </p>
      </div>

      {/* Learning Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEARNING_RESOURCES.map(resource => (
          <div
            key={resource.id}
            className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-800 p-5 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              {/* Unboxed metadata */}
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono">
                <span>{resource.provider}</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{resource.cost} · {resource.duration}</span>
              </div>

              <h3 className="font-bold text-stone-900 dark:text-white text-base leading-snug">
                {resource.title}
              </h3>

              {/* Explicit Opportunity Tie-in */}
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/40 rounded-md border border-amber-200/60 dark:border-amber-800/60 text-xs space-y-1">
                <div className="font-semibold text-amber-900 dark:text-amber-300 text-[10px] uppercase font-mono tracking-wider">
                  Opportunity Impact
                </div>
                <p className="text-amber-950 dark:text-amber-200 font-medium leading-relaxed">
                  {resource.opportunityTieIn}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-1">
                <span>Target Skill:</span>
                <strong className="text-stone-800 dark:text-stone-200 font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200/50 dark:border-stone-700/50">
                  {resource.matchedSkill}
                </strong>
                <span>·</span>
                <span className="capitalize">{resource.level}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 dark:text-stone-500">Verified educational resource</span>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <span>Access Course</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
