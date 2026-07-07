import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, Sparkles, Terminal, Copy, Check, Paperclip, Plus, ArrowLeft,
  Building2, DollarSign, Factory, Cpu, Layers, Settings, ShieldAlert, Heart,
  Code, FileText, BarChart3, Lightbulb, Eye, Users, ArrowUp, Search, MessageSquare, 
  ArrowUpFromLine, Wand2, ArrowRight, Mic, Zap, Square, ClipboardList, Share2,
  ThumbsUp, ThumbsDown, Volume2
} from 'lucide-react';
import { ChatMessage, Solution, Theme } from '../types';
import { cn } from '@/lib/utils';
import { isDarkTheme } from '../utils/theme';
import { USER_DISPLAY_NAME, USER_INITIALS } from '../constants/user';
import { MitraLogo } from './MitraLogo';
import { ASSISTANT_LABEL } from '../constants/organization';
import StarterPromptsList from './StarterPromptsList';
import { ColdStartEntryChips } from './ColdStartEntryChips';
import { DiscoveryAppSuggestionChips } from './DiscoveryAppSuggestionChips';
import {
  shouldShowDiscoveryAppSuggestions,
} from '../constants/discoverySuggestions';
import StructuredMarkdown from './StructuredMarkdown';
import { isDemoMode, setDemoMode } from '../utils/demoMode';
import SimulationComposerStack from './SimulationComposerStack';
import MitraThinkingIndicator from './MitraThinkingIndicator';
import { MitraTodos } from './MitraTodos';
import { SmoothStreamingText } from './SmoothStreamingText';

interface ChatViewProps {
  appVersion?: 'v2' | 'v3';
  theme: Theme;
  activeSolution: Solution | null;
  onSendMessage: (text: string) => void;
  isGeneratingMessage: boolean;
  onStopGeneration?: () => void;
  onChoiceSelect?: (messageId: string, choice: string) => void;
  onNavigate?: (tab: string) => void;
}

function parseInlineMarkdown(text: string, isDark: boolean = true) {
  // Handle bold (**text**) and inline code (`code`)
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[0].startsWith('**')) {
      parts.push(
        <strong key={match.index} className={`font-semibold ${isDark ? 'text-slate-50' : 'text-slate-900'}`}>
          {match[2]}
        </strong>
      );
    } else {
      parts.push(
        <code key={match.index} className={`px-1.5 py-0.5 rounded font-mono text-[11.5px] mx-0.5 ${
          isDark
            ? 'bg-muted text-brand-green border border-border'
            : 'bg-slate-100 text-emerald-700 border border-slate-200'
        }`}>
          {match[3]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function CodeBlock({ code, isDark, language }: { code: string; isDark: boolean; language?: string; key?: React.Key }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect language from first line hint like ```xml or ```js
  return (
    <div className={`relative rounded-xl overflow-hidden border mt-2 mb-1 ${
      isDark ? 'bg-muted border-border' : 'bg-slate-900 border-slate-700'
    }`}>
      {/* Header bar */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${
        isDark ? 'border-border bg-card/80' : 'border-slate-700 bg-slate-800'
      }`}>
        <span className="text-[10px] font-mono uppercase tracking-wide text-slate-500">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-white transition-colors"
        >
          {copied
            ? <><Check className="w-3 h-3 text-brand-green" /><span className="text-brand-green">Copied</span></>
            : <><Copy className="w-3 h-3" /><span>Copy</span></>
          }
        </button>
      </div>
      {/* Code body */}
      <pre className="overflow-x-auto p-4 text-[12px] leading-relaxed font-mono text-slate-300 whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function SnRecordUpdateShell({
  children,
  isDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div className="sn-record-update overflow-hidden rounded-xl border border-amber-300/80 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/[0.06]">
      <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-100/70 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/[0.08] dark:text-amber-200/90">
        <ClipboardList className="h-3.5 w-3.5 shrink-0" />
        <span>ServiceNow · Record updated</span>
      </div>
      <div className={`px-3.5 py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{children}</div>
    </div>
  );
}

function InfoCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-[12.5px] leading-relaxed ${
      isDark
        ? 'bg-brand-green/5 border-brand-green/15 text-slate-300'
        : 'bg-emerald-50 border-emerald-200/60 text-slate-700'
    }`}>
      <Sparkles className="w-3.5 h-3.5 text-brand-green mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function StreamingCursor({ isDark }: { isDark: boolean }) {
  return (
    <span
      className={cn(
        'stream-cursor inline-block w-[2px] h-[1em] align-[-0.1em] ml-0.5 rounded-full',
        isDark ? 'bg-brand-green/80' : 'bg-emerald-500/90',
      )}
      aria-hidden
    />
  );
}


function choiceIcon(choice: string) {
  const key = choice.toLowerCase();
  if (key.includes('health')) return Heart;
  if (key.includes('bank')) return Building2;
  if (key.includes('manufactur')) return Factory;
  if (key.includes('telecom')) return Cpu;
  if (key.includes('case')) return Layers;
  if (key.includes('hrsd') || key.includes('hr ')) return Users;
  if (key.includes('custom')) return Settings;
  if (key.includes('script')) return Code;
  if (key.includes('rule')) return ShieldAlert;
  if (key.includes('sla')) return Zap;
  if (key.includes('xml') || key.includes('schema')) return FileText;
  if (key.includes('routing') || key.includes('inventory') || key.includes('audit')) return Lightbulb;
  return Sparkles;
}

function isStakeholderApprovalChoice(choice: string): boolean {
  return /send for stakeholder approval|share for approval/i.test(choice);
}

function partitionChoices(choices: string[]): { primary: string[]; secondary: string[] } {
  const primary = choices.filter(isStakeholderApprovalChoice);
  const secondary = choices.filter((c) => !isStakeholderApprovalChoice(c));
  return { primary, secondary };
}

export default function ChatView({
  appVersion = 'v2',
  theme, 
  activeSolution, 
  onSendMessage, 
  isGeneratingMessage,
  onStopGeneration,
  onChoiceSelect,
  onNavigate,
}: ChatViewProps) {
  const isDark = isDarkTheme(theme);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useLocalOnly, setUseLocalOnly] = useState(() => isDemoMode());
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);

  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [dislikedMessages, setDislikedMessages] = useState<Record<string, boolean>>({});
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLikeMessage = (id: string) => {
    setLikedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setDislikedMessages(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const handleDislikeMessage = (id: string) => {
    setDislikedMessages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    setLikedMessages(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const handleSpeakMessage = (text: string, id: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === id) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
      } else {
        window.speechSynthesis.cancel();
        const cleanText = text.replace(/[*#`_\-]/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.onend = () => {
          setSpeakingMessageId(null);
        };
        utterance.onerror = () => {
          setSpeakingMessageId(null);
        };
        setSpeakingMessageId(id);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setMoreOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleEngine = () => {
    const newVal = !useLocalOnly;
    setUseLocalOnly(newVal);
    setDemoMode(newVal);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputValue(`Analyze this requirements document: "${file.name}"`);
    }
  };

  const messages = activeSolution?.chatHistory || [];

  useEffect(() => {
    if (activeSolution || isGeneratingMessage) return;
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [activeSolution, isGeneratingMessage]);

  const centerLastMessage = (smooth = false) => {
    const container = messagesContainerRef.current;
    const lastMsg = lastMessageRef.current;
    if (!container || !lastMsg) return;

    const containerH = container.clientHeight;
    const contentH = container.scrollHeight;

    if (contentH <= containerH) {
      container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const msgRect = lastMsg.getBoundingClientRect();
    const msgTop = msgRect.top - containerRect.top + container.scrollTop;
    const msgH = msgRect.height;
    const target = msgTop - containerH / 2 + msgH / 2;
    const maxScroll = contentH - containerH;
    container.scrollTo({
      top: Math.max(0, Math.min(target, maxScroll)),
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const keepLastMessageVisible = (smooth = false) => {
    const container = messagesContainerRef.current;
    const lastMsg = lastMessageRef.current;
    if (!container || !lastMsg) return;

    if (container.scrollHeight <= container.clientHeight) {
      container.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const msgRect = lastMsg.getBoundingClientRect();
    const edgePadding = 48;

    if (msgRect.bottom > containerRect.bottom - edgePadding) {
      const delta = msgRect.bottom - (containerRect.bottom - edgePadding);
      container.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
    } else if (msgRect.top < containerRect.top + edgePadding) {
      const delta = msgRect.top - (containerRect.top + edgePadding);
      container.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const isEmptyChat = messages.length === 0 && !isGeneratingMessage;
  const isColdStart =
    isEmptyChat &&
    activeSolution?.blueprint.status === 'not_started' &&
    !activeSolution?.phaseProgress;
  const showDiscoverySuggestions = shouldShowDiscoveryAppSuggestions(
    messages,
    activeSolution?.phaseProgress,
    isGeneratingMessage,
  );
  const showInviteGlow = !inputValue.trim() && !isGeneratingMessage;
  const isHrTicketingWorkspace = activeSolution?.id === 'hr-ticketing';
  const chatTitle = activeSolution
    ? activeSolution.blueprint.title || activeSolution.name
    : '';

  const streamSignature = messages.map((m) => m.text.length).join('|');

  // Keep the active response centered in view while streaming
  useEffect(() => {
    if (!isGeneratingMessage) return;

    let rafId = 0;
    const follow = () => {
      const container = messagesContainerRef.current;
      const lastMsg = lastMessageRef.current;
      if (container && lastMsg) {
        const containerH = container.clientHeight;
        const contentH = container.scrollHeight;
        if (contentH > containerH) {
          const containerRect = container.getBoundingClientRect();
          const msgRect = lastMsg.getBoundingClientRect();
          const msgTop = msgRect.top - containerRect.top + container.scrollTop;
          const msgH = msgRect.height;
          const target = msgTop - containerH / 2 + msgH / 2;
          const maxScroll = contentH - containerH;
          const targetScroll = Math.max(0, Math.min(target, maxScroll));

          const diff = targetScroll - container.scrollTop;
          if (Math.abs(diff) > 0.5) {
            container.scrollTop += diff * 0.35;
          }
        }
      }
      rafId = requestAnimationFrame(follow);
    };

    rafId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(rafId);
  }, [isGeneratingMessage]);

  useEffect(() => {
    if (messages.length === 0 || isGeneratingMessage) return;
    const timer = window.setTimeout(() => keepLastMessageVisible(true), 50);
    return () => window.clearTimeout(timer);
  }, [messages.length, streamSignature, isGeneratingMessage]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-transparent relative">
      {activeSolution && (
        <div className={`sticky top-0 z-20 flex h-[52px] shrink-0 items-center border-b border-border px-4 md:px-8 ${
          isDark ? 'bg-sidebar' : 'bg-sidebar/80'
        }`}>
          <h2
            className="min-w-0 truncate text-[12px] font-bold tracking-tight text-foreground"
            title={chatTitle}
          >
            {chatTitle}
          </h2>
        </div>
      )}
      <div
        ref={messagesContainerRef}
        style={{ scrollBehavior: 'auto' }}
        className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 relative z-0"
      >
        <div className={`max-w-3xl mx-auto w-full min-h-full flex flex-col justify-center py-10 pb-16 ${
          messages.length > 0 ? 'space-y-6' : ''
        }`}>
          {isEmptyChat && (
            <div
              className={`flex flex-col px-2 transition-all duration-500 ease-out ${
                inputValue.trim()
                  ? 'opacity-0 max-h-0 overflow-hidden mb-0 pointer-events-none'
                  : 'opacity-100 mb-4'
              }`}
            >
              <div className="mb-8 text-center flex flex-col items-center justify-center">
                <div className="mb-5 flex justify-center">
                  <div className="relative">
                    <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${
                      isDark ? 'bg-primary/15' : 'bg-emerald-400/15'
                    }`} />
                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border ${
                      isDark
                        ? 'bg-card/80 border-white/[0.08] text-primary'
                        : 'bg-emerald-50 border-emerald-200/60 text-emerald-600'
                    }`}>
                      <Sparkles className="h-7 w-7 animate-pulse text-primary" />
                    </div>
                  </div>
                </div>
                {appVersion === 'v3' && (
                  <span className="mb-3 inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#00ff66] border border-emerald-500/25 animate-pulse font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] shrink-0" />
                    v3 · Agentic Reasoner
                  </span>
                )}
                <h2 className={`font-display text-3xl md:text-4xl font-bold tracking-tight mb-3 text-center ${
                  isDark ? 'text-slate-50' : 'text-slate-900'
                }`}>
                  {appVersion === 'v3'
                    ? 'Mitra v3 — Agentic Mode'
                    : isColdStart
                      ? 'Start a new solution'
                      : isHrTicketingWorkspace
                        ? 'Architect your HR Ticketing solution'
                        : 'What would you like to build?'}
                </h2>
                <p className={`text-[14px] leading-relaxed max-w-lg mx-auto text-center ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {appVersion === 'v3'
                    ? 'Multi-agent orchestration with autonomous reasoning, schema graph mapping, and ATF suite generation — releasing next week.'
                    : isColdStart
                      ? 'Pick an entry mode or describe your ServiceNow requirement — Mitra will guide you step by step and file Studio deliverables as you go.'
                      : isHrTicketingWorkspace
                        ? 'Walk through the HRSD blueprint step by step — then route the executive summary for stakeholder approval with ServiceNow-style record updates.'
                        : "Describe your app and I'll help you build tables, forms, and scripts."}
                </p>
              </div>

              {isColdStart ? (
                <ColdStartEntryChips
                  theme={theme}
                  disabled={isGeneratingMessage}
                  onSelect={(prompt) => onSendMessage(prompt)}
                  onTemplateNavigate={() => onNavigate?.('templates')}
                />
              ) : showDiscoverySuggestions ? (
                <DiscoveryAppSuggestionChips
                  theme={theme}
                  disabled={isGeneratingMessage}
                  onSelect={(prompt) => onSendMessage(prompt)}
                />
              ) : (
                <StarterPromptsList
                  theme={theme}
                  disabled={isGeneratingMessage}
                  onSelect={(prompt) => onSendMessage(prompt)}
                />
              )}
            </div>
          )}
          {messages.map((msg, i) => {
              const isMitra = msg.sender === 'mitra';
              const isSnUpdate = isMitra && (msg.snUpdate || msg.text.includes('## Record updated'));
              const isLastMessage = i === messages.length - 1;
              const isStreamingThisMessage =
                isMitra &&
                isGeneratingMessage &&
                isLastMessage;
              const hasTodos = isMitra && msg.todos && msg.todos.length > 0;
              const showThinkingOnly =
                isStreamingThisMessage && !msg.text.trim() && !hasTodos;
              const todosAnimating =
                isStreamingThisMessage && hasTodos && !msg.text.trim();
              const isAnySelected = msg.selectedChoice !== undefined;
              return (
                <div 
                  key={msg.id || i}
                  ref={isLastMessage ? lastMessageRef : undefined}
                  className={`group relative flex gap-4 max-w-3xl scroll-mt-8 chat-message-entry ${isMitra ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Avatar Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isStreamingThisMessage 
                      ? isDark
                          ? 'bg-brand-green/5 border border-brand-green/20 text-brand-green'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                      : isMitra 
                        ? isSnUpdate
                          ? isDark
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                            : 'bg-amber-50 border border-amber-200 text-amber-700'
                          : 'bg-transparent border-transparent'
                        : isDark
                          ? 'bg-mitra-surface border border-white/[0.08] text-brand-green'
                          : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`}>
                    {isMitra ? (
                      isSnUpdate ? (
                        <ClipboardList className="w-4 h-4" />
                      ) : (
                        <MitraLogo
                          className="h-5.5 w-5.5 opacity-90"
                        />
                      )
                    ) : (
                      <span className="text-[10px] font-bold font-display tracking-wide">{USER_INITIALS}</span>
                    )}
                  </div>

                  {/* Message Bubble Wrapper */}
                  <div className="max-w-[85%] relative flex flex-col items-start">

                    {/* Body Text */}
                    <div className={`break-words ${
                      isMitra 
                        ? isDark 
                          ? 'text-slate-200' 
                          : 'text-slate-800'
                        : isDark
                          ? 'px-4 py-3 rounded-2xl border bg-mitra-highlight/80 border-white/[0.08] text-slate-50 font-medium'
                          : 'px-5 py-3 rounded-[20px] rounded-tr-[4px] bg-emerald-50 border border-emerald-200/60 text-slate-900'
                    }`}>
                      {isMitra ? (
                        <>
                          {hasTodos && (
                            <div
                              className={cn(
                                'mb-3 rounded-xl border p-3',
                                isDark
                                  ? 'border-white/[0.08] bg-mitra-surface/50'
                                  : 'border-slate-200 bg-white shadow-sm',
                              )}
                            >
                              <MitraTodos
                                items={msg.todos!}
                                summary={msg.todoSummary}
                                animate={todosAnimating}
                                stepMs={850}
                                isDark={isDark}
                              />
                            </div>
                          )}
                          {showThinkingOnly ? (
                            <MitraThinkingIndicator theme={theme} context="architect" compact />
                          ) : isStreamingThisMessage ? (
                            <SmoothStreamingText
                              text={msg.text}
                              isStreaming
                              className="chat-response-text"
                              cursor={<StreamingCursor isDark={isDark} />}
                            />
                          ) : (
                            <div className="chat-response-text stream-final-text">
                              {isSnUpdate ? (
                                <SnRecordUpdateShell isDark={isDark}>
                                  <StructuredMarkdown
                                    text={msg.text}
                                    isDark={isDark}
                                    onSendMessage={onSendMessage}
                                    isGenerating={isGeneratingMessage}
                                    messageId={msg.id}
                                    selectedChoice={msg.selectedChoice}
                                    onChoiceSelect={onChoiceSelect}
                                    renderCodeBlock={(code, key, language) => (
                                      <CodeBlock key={key} code={code} language={language} isDark={isDark} />
                                    )}
                                  />
                                </SnRecordUpdateShell>
                              ) : (
                                <StructuredMarkdown
                                  text={msg.text}
                                  isDark={isDark}
                                  onSendMessage={onSendMessage}
                                  isGenerating={isGeneratingMessage}
                                  messageId={msg.id}
                                  selectedChoice={msg.selectedChoice}
                                  onChoiceSelect={onChoiceSelect}
                                  renderCodeBlock={(code, key, language) => (
                                    <CodeBlock key={key} code={code} language={language} isDark={isDark} />
                                  )}
                                />
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap text-[14px] leading-[1.7]">{msg.text}</span>
                      )}

                      {msg.choices && msg.choices.length > 0 && !isStreamingThisMessage && (() => {
                        const { primary, secondary } = partitionChoices(msg.choices);
                        const isAnySelected = !!msg.selectedChoice;
                        const renderChoice = (choice: string, prominent = false) => {
                          const isSelected = msg.selectedChoice === choice;
                          const Icon = prominent ? Share2 : choiceIcon(choice);
                          const handleClick = () => {
                            if (onChoiceSelect) {
                              onChoiceSelect(msg.id, choice);
                            } else {
                              onSendMessage(choice);
                            }
                          };
                          if (prominent) {
                            return (
                              <button
                                key={choice}
                                type="button"
                                disabled={isGeneratingMessage || isAnySelected}
                                onClick={handleClick}
                                className={`mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border px-5 py-3.5 text-[14px] font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                                  isSelected
                                    ? isDark
                                      ? 'border-brand-green/50 bg-brand-green/20 text-brand-green shadow-[0_0_20px_rgba(50,215,75,0.22)]'
                                      : 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-md'
                                    : isAnySelected
                                      ? isDark
                                        ? 'border-white/[0.04] bg-mitra-surface/30 text-slate-600 opacity-40'
                                        : 'border-slate-100 bg-slate-50 text-slate-400 opacity-40'
                                      : isDark
                                        ? 'border-brand-green/35 bg-brand-green/10 text-brand-green hover:bg-brand-green/18 hover:border-brand-green/50 hover:shadow-[0_0_18px_rgba(50,215,75,0.2)] cursor-pointer active:scale-[0.99]'
                                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.99]'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="h-4 w-4 shrink-0" />
                                ) : (
                                  <Icon className="h-4 w-4 shrink-0" />
                                )}
                                <span>{choice}</span>
                              </button>
                            );
                          }
                          return (
                            <button
                              key={choice}
                              type="button"
                              disabled={isGeneratingMessage || isAnySelected}
                              onClick={handleClick}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium transition-all duration-200 disabled:cursor-not-allowed ${
                                isSelected
                                  ? isDark
                                    ? 'bg-brand-green/15 border-brand-green/40 text-brand-green shadow-[0_0_14px_rgba(50,215,75,0.18)]'
                                    : 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                                  : isAnySelected
                                    ? isDark
                                      ? 'bg-mitra-surface/30 border-white/[0.04] text-slate-600 opacity-40'
                                      : 'bg-slate-50 border-slate-100 text-slate-400 opacity-40'
                                    : isDark
                                      ? 'bg-mitra-surface/60 border-white/[0.1] text-slate-200 hover:bg-mitra-highlight hover:border-brand-green/35 hover:text-white hover:shadow-[0_0_12px_rgba(50,215,75,0.12)] cursor-pointer active:scale-[0.98]'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md cursor-pointer active:scale-[0.98]'
                              }`}
                            >
                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 shrink-0" />
                              ) : (
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${
                                  isAnySelected
                                    ? ''
                                    : isDark
                                      ? 'text-brand-green/70'
                                      : 'text-emerald-600'
                                }`} />
                              )}
                              <span>{choice}</span>
                            </button>
                          );
                        };
                        return (
                          <div className="mt-3">
                            {primary.map((choice) => renderChoice(choice, true))}
                            {secondary.length > 0 && (
                              <>
                                <p className={`text-[11px] font-medium uppercase tracking-wide mb-2 ${primary.length > 0 ? 'mt-4' : ''} ${
                                  isDark ? 'text-slate-500' : 'text-slate-400'
                                }`}>
                                  {primary.length > 0 ? 'Or' : 'Pick one'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {secondary.map((choice) => renderChoice(choice))}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}

                      {isMitra &&
                        isLastMessage &&
                        !isStreamingThisMessage &&
                        shouldShowDiscoveryAppSuggestions(
                          messages,
                          activeSolution?.phaseProgress,
                          isGeneratingMessage,
                        ) && (
                          <DiscoveryAppSuggestionChips
                            theme={theme}
                            disabled={isGeneratingMessage}
                            onSelect={(prompt) => onSendMessage(prompt)}
                            compact
                          />
                        )}

                      {/* Hover Actions Toolbar (Mitra only, placed below body and chips) */}
                      {isMitra && (
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1.5 mt-2 self-start px-1 h-6">
                          <button
                            type="button"
                            onClick={() => handleLikeMessage(msg.id || `${i}`)}
                            className={`p-1 rounded-md border transition-all duration-150 cursor-pointer active:scale-95 ${
                              likedMessages[msg.id || `${i}`]
                                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                                : isDark
                                  ? 'text-slate-400 hover:text-slate-200 border-white/[0.08] bg-slate-900/90 hover:bg-slate-800'
                                  : 'text-slate-500 hover:text-slate-800 border-slate-200 bg-white/95 hover:bg-slate-50'
                            }`}
                            title="Like"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDislikeMessage(msg.id || `${i}`)}
                            className={`p-1 rounded-md border transition-all duration-150 cursor-pointer active:scale-95 ${
                              dislikedMessages[msg.id || `${i}`]
                                ? 'text-rose-500 bg-rose-500/10 border-rose-500/30'
                                : isDark
                                  ? 'text-slate-400 hover:text-slate-200 border-white/[0.08] bg-slate-900/90 hover:bg-slate-800'
                                  : 'text-slate-500 hover:text-slate-800 border-slate-200 bg-white/95 hover:bg-slate-50'
                            }`}
                            title="Dislike"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpeakMessage(msg.text, msg.id || `${i}`)}
                            className={`p-1 rounded-md border transition-all duration-150 cursor-pointer active:scale-95 ${
                              speakingMessageId === (msg.id || `${i}`)
                                ? 'text-primary bg-primary/10 border-primary/30 animate-pulse'
                                : isDark
                                  ? 'text-slate-400 hover:text-slate-200 border-white/[0.08] bg-slate-900/90 hover:bg-slate-800'
                                  : 'text-slate-500 hover:text-slate-800 border-slate-200 bg-white/95 hover:bg-slate-50'
                            }`}
                            title="Speak aloud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(msg.text, msg.id || `${i}`)}
                            className={`p-1 rounded-md border transition-all duration-150 cursor-pointer active:scale-95 ${
                              copiedId === (msg.id || `${i}`)
                                ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
                                : isDark
                                  ? 'text-slate-400 hover:text-slate-200 border-white/[0.08] bg-slate-900/90 hover:bg-slate-800'
                                  : 'text-slate-500 hover:text-slate-800 border-slate-200 bg-white/95 hover:bg-slate-50'
                            }`}
                            title="Copy text"
                          >
                            {copiedId === (msg.id || `${i}`) ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

        </div>
      </div>

      {/* Composer — pinned below scroll area so responses stay visible above */}
      <div className="shrink-0 px-4 pt-2 pb-4 z-20 relative border-t border-transparent">
        <div className="max-w-3xl mx-auto w-full relative z-20">
          {/* Floating More Options Popover */}
          {moreOptionsOpen && (
            <div 
              ref={optionsRef}
              className={`absolute bottom-full left-3 mb-2 p-1.5 rounded-2xl border shadow-xl flex flex-col gap-1 w-[240px] z-50 animate-fade-in ${
                isDark ? 'bg-popover border-border text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.4)]' : 'bg-white border-slate-200 text-slate-700 shadow-[0_10px_30px_rgba(0,0,0,0.08)]'
              }`}
            >
              <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b mb-1 ${
                isDark ? 'text-muted-foreground border-border/70' : 'text-slate-400 border-slate-100'
              }`}>
                {ASSISTANT_LABEL}
              </div>

              {/* Option 1: Create Incident */}
              <button
                type="button"
                onClick={() => {
                  setInputValue('Create a new incident ticket regarding ');
                  setMoreOptionsOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-muted text-foreground hover:text-foreground' : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Create Incident</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-normal">Submit a new incident ticket</div>
                </div>
              </button>

              {/* Option 2: Check Ticket Status */}
              <button
                type="button"
                onClick={() => {
                  setInputValue('Check status of ticket ');
                  setMoreOptionsOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-muted text-foreground hover:text-foreground' : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Eye className="w-4 h-4 text-brand-green mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Check Ticket Status</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-normal">Retrieve active ticket update</div>
                </div>
              </button>

              {/* Option 3: Search Knowledge Base */}
              <button
                type="button"
                onClick={() => {
                  setInputValue('Search knowledge base articles for ');
                  setMoreOptionsOpen(false);
                }}
                className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-muted text-foreground hover:text-foreground' : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Search Knowledge Articles</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-normal">Query self-service solutions</div>
                </div>
              </button>

              <div className={`border-t my-1 ${isDark ? 'border-border/70' : 'border-slate-100'}`} />

              {/* Option 4: Command Console */}
              <button
                type="button"
                onClick={() => {
                  if (!inputValue.startsWith('/')) {
                    setInputValue('/' + inputValue);
                  }
                  setMoreOptionsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-muted text-foreground hover:text-foreground' : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Command Console</span>
              </button>

              {/* Option 5: Toggle AI Engine */}
              <button
                type="button"
                onClick={() => {
                  toggleEngine();
                  setMoreOptionsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                  isDark ? 'hover:bg-muted text-foreground hover:text-foreground' : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-brand-green shrink-0" />
                  <span>AI Engine</span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  useLocalOnly 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'bg-emerald-500/10 text-brand-green border border-emerald-500/20'
                }`}>
                  {useLocalOnly ? 'Demo' : 'Live API'}
                </span>
              </button>
            </div>
          )}

          <SimulationComposerStack
            theme={theme}
            inputId="tour-input-bar"
            cardClassName={`transition-colors duration-300 overflow-visible ${
              inputValue.trim().length > 0
                ? 'input-active-glow' + (isDark ? '' : ' light')
                : showInviteGlow
                  ? 'input-invite-glow' + (isDark ? '' : ' light')
                  : isDark
                    ? 'border-border hover:border-border/80'
                    : 'border-[#eaecf0]/60 hover:border-emerald-300'
            } ${
              inputValue.trim().length > 0
                ? isDark
                  ? 'bg-mitra-input'
                  : 'bg-white'
                : showInviteGlow
                  ? isDark
                    ? 'vr-glass-surface'
                    : 'bg-white'
                  : isDark
                    ? 'vr-glass-surface hover:bg-mitra-highlight/30'
                    : 'bg-[#f3f4f6] hover:bg-[#eef2f6]'
            }`}
          >
            <div className="flex flex-col p-3 relative overflow-visible">
            {showInviteGlow && (
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  background: isDark
                    ? 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255, 255, 255, 0.02), transparent 70%)'
                    : 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(50, 215, 75, 0.04), transparent 70%)',
                }}
                aria-hidden
              />
            )}

            {/* Inner content wrapper for proper z-index layering */}
            <div className="relative z-10">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept=".txt,.json,.csv,.pdf,.doc,.docx"
              />

              {/* Top typing area: Textarea */}
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isGeneratingMessage ? 'Mitra is thinking…' : isEmptyChat ? 'Describe your ServiceNow requirement…' : 'How can I help you today?'}
              disabled={isGeneratingMessage}
              rows={1}
              className={`w-full bg-transparent outline-none border-none resize-none text-[13.5px] leading-relaxed font-sans px-2 pt-1 font-medium min-h-[38px] max-h-[200px] ${
                isDark ? 'text-slate-100 placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
              }`}
            />

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between mt-2 pt-2 px-1">
              {/* Left Side elements */}
              <div className="flex items-center gap-2">
                {/* Plus options button */}
                <button
                  type="button"
                  onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    moreOptionsOpen
                      ? isDark ? 'bg-muted text-foreground' : 'bg-slate-200 text-slate-800'
                      : isDark 
                        ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                        : 'text-slate-555 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="More Actions"
                >
                  <Plus className={`w-4 h-4 transition-transform duration-250 ${moreOptionsOpen ? 'rotate-45 text-brand-green' : ''}`} />
                </button>
              </div>

              {/* Right Side elements */}
              <div className="flex items-center gap-2">
                {/* File Attachment Button */}
                <button
                  type="button"
                  disabled={isGeneratingMessage}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDark 
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                      : 'text-slate-555 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Attach Document"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Mic icon button */}
                <button
                  type="button"
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDark 
                      ? 'text-muted-foreground hover:text-foreground hover:bg-muted' 
                      : 'text-slate-555 hover:text-slate-800 hover:bg-slate-200'
                  }`}
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {isGeneratingMessage ? (
                  <button
                    type="button"
                    onClick={onStopGeneration}
                    title="Stop response"
                    className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 cursor-pointer ${
                      isDark
                        ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300 border border-red-500/25'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    <Square className="w-3 h-3 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                      inputValue.trim()
                        ? 'bg-brand-green hover:bg-brand-green-hover hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(0,255,102,0.45)] cursor-pointer'
                        : isDark
                          ? 'bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
                          : 'bg-slate-200 text-slate-455 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform duration-300 stroke-[3.5] ${
                      inputValue.trim() ? 'text-slate-950 font-bold' : 'text-slate-450'
                    }`} />
                  </button>
                )}
              </div>
            </div>
            </div>
            </div>
          </SimulationComposerStack>
        </div>
      </div>

    </div>
  );
}
