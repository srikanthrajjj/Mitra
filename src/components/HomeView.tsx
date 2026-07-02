import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, ShieldCheck, ArrowRight, Paperclip, Plus, Sparkles, Terminal,
  ShieldAlert, Eye, Mic,
} from 'lucide-react';
import { ResolvedTheme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { type HomeActionType } from '../data/homeActions';
import HomeActionCards from './HomeActionCards';
import { isDemoMode, setDemoMode } from '../utils/demoMode';
import SimulationComposerStack from './SimulationComposerStack';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  appVersion?: 'v2' | 'v3';
  theme: ResolvedTheme;
  onSelectAction: (actionType: HomeActionType) => void;
  onSendMessage: (text: string) => void;
}

export default function HomeView({
  appVersion = 'v2',
  theme,
  onSelectAction,
  onSendMessage,
}: HomeViewProps) {
  const isDark = isDarkTheme(theme);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [useLocalOnly, setUseLocalOnly] = useState(() => isDemoMode());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const toggleEngine = () => {
    const newVal = !useLocalOnly;
    setUseLocalOnly(newVal);
    setDemoMode(newVal);
  };

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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setInputValue(`Uploaded document requirements: "${file.name}". Architect a solution based on this specification.`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      setInputValue(
        isImage
          ? `Analyze this diagram or screenshot ("${file.name}") and describe the ServiceNow architecture it represents.`
          : `Uploaded document requirements: "${file.name}". Architect a solution based on this specification.`,
      );
      e.target.value = '';
    }
  };


  const focusInput = () => {
    queueMicrotask(() => textareaRef.current?.focus());
  };

  const handleActionCard = (actionId: HomeActionType, prompt: string) => {
    if (actionId === 'template') {
      onSendMessage(prompt);
      return;
    }
    if (actionId === 'import') {
      setInputValue(prompt);
      focusInput();
      if (fileInputRef.current) {
        fileInputRef.current.accept = '.txt,.json,.csv,.pdf,.doc,.docx';
        fileInputRef.current.click();
        fileInputRef.current.accept = '.txt,.json,.csv,.pdf,.doc,.docx,image/*';
      }
      return;
    }
    if (actionId === 'analyze') {
      onSendMessage(prompt);
      return;
    }
    setInputValue(prompt);
    focusInput();
  };

  const handleExampleClick = (actionId: HomeActionType, prompt: string) => {
    if (actionId === 'template') {
      onSendMessage(prompt);
      return;
    }
    if (actionId === 'import') {
      setInputValue(prompt);
      focusInput();
      if (fileInputRef.current) {
        fileInputRef.current.accept = '.txt,.json,.csv,.pdf,.doc,.docx';
        fileInputRef.current.click();
        fileInputRef.current.accept = '.txt,.json,.csv,.pdf,.doc,.docx,image/*';
      }
      return;
    }
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="relative mx-auto w-full max-w-4xl">
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />

          <div className="relative z-10 mb-8 text-center flex flex-col items-center justify-center">
            <h1 className="mb-3 flex items-center justify-center gap-2 text-3xl font-display font-semibold tracking-tight md:text-4xl">
              <span className="text-foreground">Welcome to</span>
              <span className="flex items-center gap-1 font-bold text-primary glow-green">
                Mitra
                <Sparkles className="h-6 w-6 animate-pulse text-primary" />
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-center text-sm leading-relaxed text-muted-foreground md:text-[15px]">
              Your AI architect for ServiceNow — from design to deployment.
            </p>
          </div>

          <div className="relative z-10 mb-8 flex flex-col items-center justify-center w-full">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 text-center">Get started</p>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept=".txt,.json,.csv,.pdf,.doc,.docx,image/*"
            />
            <div className="w-full flex justify-center">
              <HomeActionCards theme={theme} onActionCard={handleActionCard} onExampleClick={handleExampleClick} />
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 bg-transparent px-4 pb-3 pt-1.5">
        <div className="relative mx-auto w-full max-w-3xl">
          <div
            className="relative"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <SimulationComposerStack
              theme={theme}
              inputId="tour-input-bar"
              cardClassName={cn(
                'border bg-card shadow-lg transition-all duration-300 hover:shadow-xl',
                isFocused || inputValue.trim().length > 0
                  ? 'border-primary/40 ring-1 ring-primary/20 scale-[1.005] shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                  : 'border-border hover:border-primary/20',
              )}
            >
              <div className="relative flex flex-col p-3">
                {dragActive && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-primary/10 text-primary backdrop-blur-xs">
                    <span className="font-display text-[11px] font-semibold">Drop requirements here!</span>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="How can I help you today?"
                  rows={1}
                  className="min-h-[38px] w-full max-h-[200px] resize-none border-none bg-transparent px-2 pt-1 text-[13.5px] font-medium leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                />

                <Separator className="my-2" />

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <DropdownMenu open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className={cn('h-4 w-4 transition-transform', moreOptionsOpen && 'rotate-45 text-primary')} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="top" align="start" className={cn(theme, 'w-56')}>
                        <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setInputValue('Create a new incident ticket regarding '); setMoreOptionsOpen(false); }}>
                          <ShieldAlert className="mr-2 h-4 w-4 text-rose-500" />
                          Create incident
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setInputValue('Check status of ticket '); setMoreOptionsOpen(false); }}>
                          <Eye className="mr-2 h-4 w-4 text-primary" />
                          Check ticket status
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setInputValue('Search knowledge base articles for '); setMoreOptionsOpen(false); }}>
                          <FileText className="mr-2 h-4 w-4 text-emerald-500" />
                          Search knowledge articles
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { if (!inputValue.startsWith('/')) setInputValue('/' + inputValue); setMoreOptionsOpen(false); }}>
                          <Terminal className="mr-2 h-4 w-4" />
                          Command console
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { toggleEngine(); setMoreOptionsOpen(false); }}>
                          <Sparkles className="mr-2 h-4 w-4 text-primary" />
                          AI engine
                          <Badge variant="outline" className="ml-auto text-[9px]">
                            {useLocalOnly ? 'Demo' : 'Live'}
                          </Badge>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={!inputValue.trim()}
                      onClick={handleSend}
                    >
                      <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                    </Button>
                  </div>
                </div>
              </div>
            </SimulationComposerStack>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Your data is secure and stays within your instance.</span>
          </div>

          {/* Upcoming v3 Features Section */}
          {appVersion === 'v3' && (
            <div className="mt-12 pt-8 border-t border-sidebar-border/40 relative z-10 text-left animate-fade-in">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-green animate-pulse" />
                Upcoming v3 Features (Releasing Next Week)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Feature 1 */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-900/40 border-white/[0.06] hover:bg-zinc-900/60'
                    : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4 text-brand-green" />
                  </div>
                  <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Multi-Agent Canvas
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Visually coordinate multiple specialized subagents working on complex workflows and record producers concurrently.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-900/40 border-white/[0.06] hover:bg-zinc-900/60'
                    : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4 text-brand-green" />
                  </div>
                  <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Schema Graph Mapper
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Generate and inspect interactive database schema diagrams linking tables, reference fields, and choice choices in real-time.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? 'bg-zinc-900/40 border-white/[0.06] hover:bg-zinc-900/60'
                    : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Terminal className="w-4 h-4 text-brand-green" />
                  </div>
                  <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ATF Suite Generator
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Automatically draft and export end-to-end Automated Test Framework suites based on user story requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
