import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Bot,
  User,
  ArrowRight,
  Volume2,
  Mic
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export const AfriversityAssistantDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    aiSuggestedPrompt,
    setAiSuggestedPrompt,
    user,
    selectedOpportunity,
    selectedUniversity,
    setActiveTab
  } = useApp();

  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; content: string; timestamp: string }[]
  >([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello ${user ? user.fullName.split(' ')[0] : 'there'}. I'm your Afriversity AI companion. I understand your academic profile, target opportunities, and readiness checklists. What would you like to prepare today?`,
      timestamp: 'Just now'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If suggested prompt changed, set it to input
  useEffect(() => {
    if (aiSuggestedPrompt) {
      setInput(aiSuggestedPrompt);
    }
  }, [aiSuggestedPrompt]);

  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiDrawerOpen]);

  if (!isAiDrawerOpen) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      role: 'user' as const,
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAiSuggestedPrompt('');
    setLoading(true);

    try {
      const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      const response = await api.chatWithAfriversityAI({
        message: textToSend,
        history,
        context: {
          studentProfile: user,
          currentOpportunity: selectedOpportunity,
          currentUniversity: selectedUniversity,
          readinessStatus: 'PARTIALLY_READY',
          readinessScore: 78
        }
      });

      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant' as const,
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: 'I had trouble connecting to the verification service. Please try asking again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'What am I missing for this application?',
    'Find scholarships for Computer Engineering in Ghana',
    'How should I structure my personal statement?',
    'What is my top priority milestone this week?'
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white dark:bg-stone-900 shadow-2xl border-l border-stone-200 dark:border-stone-800 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-[#FAF9F5] dark:bg-stone-950 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-stone-900 dark:bg-amber-500 text-stone-100 dark:text-stone-950 flex items-center justify-center font-bold text-xs">
            AF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-stone-900 dark:text-white">Afriversity AI</span>
              <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/60 px-1.5 py-0.2 rounded font-mono font-medium">
                Context-Aware
              </span>
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {selectedOpportunity ? `Focus: ${selectedOpportunity.organization}` : 'Personal Student Advisor'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Context Chip */}
      {(selectedOpportunity || selectedUniversity) && (
        <div className="px-4 py-2 bg-stone-100/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center justify-between">
          <span className="truncate">
            Active Context:{' '}
            <strong className="text-stone-900 dark:text-white">
              {selectedOpportunity?.title || selectedUniversity?.name}
            </strong>
          </span>
          <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold uppercase">
            Live
          </span>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded bg-stone-900 dark:bg-stone-800 text-stone-200 shrink-0 flex items-center justify-center text-[10px] font-bold mt-1">
                AI
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-lg p-3.5 space-y-1.5 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-stone-900 dark:bg-amber-600 text-stone-100 dark:text-stone-950 shadow-2xs'
                  : 'bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-stone-800 dark:text-stone-200'
              }`}
            >
              <div className="whitespace-pre-line text-xs">{m.content}</div>
              <div
                className={`text-[10px] ${
                  m.role === 'user' ? 'text-stone-400 dark:text-stone-900/70 text-right' : 'text-stone-400 dark:text-stone-500'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-stone-500 dark:text-stone-400 italic p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
            <span>Consulting verified requirements & student profile...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850/40 space-y-1.5">
        <div className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase">Suggested Inquiries</div>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.slice(0, 2).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 px-2.5 py-1 rounded text-left transition-colors truncate max-w-full"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask about opportunities, requirements, deadlines..."
            className="w-full text-xs sm:text-sm pl-3 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white dark:text-stone-950 rounded disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-[10px] text-stone-400 dark:text-stone-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Afriversity AI citations strictly link to official institutional portals.</span>
        </div>
      </div>
    </div>
  );
};
