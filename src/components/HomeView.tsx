import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, ShieldCheck, ArrowRight, Paperclip, Sparkles, Terminal, Mic,
} from 'lucide-react';
import { ResolvedTheme } from '../types';
import { isDarkTheme } from '../utils/theme';
import { type HomeActionType } from '../data/homeActions';
import HomeActionCards from './HomeActionCards';
import SimulationComposerStack from './SimulationComposerStack';
import { ComposerModeSelect } from './ComposerModeSelect';
import { ComposerInstanceSelect } from './ComposerInstanceSelect';
import { NotificationBanner } from './NotificationBanner';
import { ProdInstanceBanner } from './ProdInstanceBanner';
import { ComposerAttachmentPreview } from './ComposerAttachmentPreview';
import { useComposerAttachments } from '../hooks/useComposerAttachments';
import {
  getServiceNowInstance,
  instanceHostname,
  isProdInstance,
  loadSelectedInstanceId,
  persistSelectedInstanceId,
} from '../data/serviceNowInstances';
import {
  ComposerModeId,
  getComposerModePlaceholder,
} from '../constants/composerModes';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  appVersion?: 'v2' | 'v3';
  theme: ResolvedTheme;
  onSelectAction: (actionType: HomeActionType) => void;
  onSendMessage: (text: string) => void;
  isServerConnected?: boolean;
  onCreateConnection?: () => void;
  taskNotificationEnabled?: boolean;
  onTaskNotificationChange?: (value: boolean) => void;
  onNotificationsEnabled?: () => void;
}

export default function HomeView({
  appVersion = 'v2',
  theme,
  onSelectAction,
  onSendMessage,
  isServerConnected = true,
  onCreateConnection,
  taskNotificationEnabled = false,
  onTaskNotificationChange,
  onNotificationsEnabled,
}: HomeViewProps) {
  const isDark = isDarkTheme(theme);
  const [inputValue, setInputValue] = useState('');
  const [composerMode, setComposerMode] = useState<ComposerModeId>('plan');
  const [isFocused, setIsFocused] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedInstanceId, setSelectedInstanceId] = useState(() => loadSelectedInstanceId());
  const selectedInstance = getServiceNowInstance(selectedInstanceId);
  const {
    attachments,
    addFiles,
    removeAttachment,
    clearAttachments,
    hasUploading,
  } = useComposerAttachments();
  const [notificationBannerDismissed, setNotificationBannerDismissed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const handleSelectInstance = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    persistSelectedInstanceId(instanceId);
  };

  const handleSend = () => {
    if (hasUploading) return;
    const trimmed = inputValue.trim();
    const readyNames = attachments.filter((a) => a.status === 'ready').map((a) => a.name);
    if (!trimmed && readyNames.length === 0) return;

    const message =
      trimmed
      || (readyNames.length === 1
        ? `Uploaded document requirements: "${readyNames[0]}". Architect a solution based on this specification.`
        : `Uploaded documents: ${readyNames.map((n) => `"${n}"`).join(', ')}. Architect a solution based on these specifications.`);

    onSendMessage(message);
    setInputValue('');
    clearAttachments();
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
      if (!inputValue.trim()) {
        const first = e.dataTransfer.files[0];
        setInputValue(
          `Uploaded document requirements: "${first.name}". Architect a solution based on this specification.`,
        );
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      if (!inputValue.trim()) {
        const first = e.target.files[0];
        const isImage = first.type.startsWith('image/');
        setInputValue(
          isImage
            ? `Analyze this diagram or screenshot ("${first.name}") and describe the ServiceNow architecture it represents.`
            : `Uploaded document requirements: "${first.name}". Architect a solution based on this specification.`,
        );
      }
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
      <div className="flex-1 overflow-y-auto px-4 pt-8 pb-8 md:px-8 lg:px-12">
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
              multiple
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
            {!taskNotificationEnabled && !notificationBannerDismissed && onTaskNotificationChange && (
            <NotificationBanner
              isDark={isDark}
              onEnable={() => {
                onTaskNotificationChange(true);
                onNotificationsEnabled?.();
              }}
              onDismiss={() => setNotificationBannerDismissed(true)}
            />
            )}
            <SimulationComposerStack
              theme={theme}
              inputId="tour-input-bar"
              isActive={isFocused || inputValue.trim().length > 0}
              attachedHeader={
                isProdInstance(selectedInstance) && selectedInstance ? (
                  <ProdInstanceBanner
                    isDark={isDark}
                    instanceName={selectedInstance.name}
                    hostname={instanceHostname(selectedInstance.url)}
                  />
                ) : undefined
              }
              cardClassName="bg-card transition-colors duration-200"
            >
              <div className="relative flex flex-col p-3">
                {dragActive && (
                  <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-primary/10 text-primary backdrop-blur-xs">
                    <span className="font-display text-[11px] font-semibold">Drop requirements here!</span>
                  </div>
                )}

                <ComposerAttachmentPreview
                  isDark={isDark}
                  attachments={attachments}
                  onRemove={removeAttachment}
                />

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder={getComposerModePlaceholder(composerMode)}
                  rows={1}
                  className="min-h-[38px] w-full max-h-[200px] resize-none border-none bg-transparent px-2 pt-1 text-[13.5px] font-medium leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
                />

                <Separator className="my-2" />

                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <ComposerInstanceSelect
                      theme={theme}
                      value={selectedInstanceId}
                      onChange={handleSelectInstance}
                      onCreateConnection={onCreateConnection}
                      isConnected={isServerConnected}
                    />
                    <ComposerModeSelect
                      theme={theme}
                      value={composerMode}
                      onChange={setComposerMode}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      disabled={(!inputValue.trim() && attachments.length === 0) || hasUploading}
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
                    ? 'bg-mitra-surface/40 border-white/[0.06] hover:bg-mitra-surface/60'
                    : 'bg-muted/60 border-border hover:bg-accent'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4 text-brand-green" />
                  </div>
                  <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-foreground'}`}>
                    Multi-Agent Canvas
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Visually coordinate multiple specialized subagents working on complex workflows and record producers concurrently.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? 'bg-mitra-surface/40 border-white/[0.06] hover:bg-mitra-surface/60'
                    : 'bg-muted/60 border-border hover:bg-accent'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4 text-brand-green" />
                  </div>
                  <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-foreground'}`}>
                    Schema Graph Mapper
                  </h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Generate and inspect interactive database schema diagrams linking tables, reference fields, and choice choices in real-time.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isDark
                    ? 'bg-mitra-surface/40 border-white/[0.06] hover:bg-mitra-surface/60'
                    : 'bg-muted/60 border-border hover:bg-accent'
                }`}>
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center mb-3">
                    <Terminal className="w-4 h-4 text-brand-green" />
                  </div>
                  <h3 className={`text-xs font-bold mb-1.5 ${isDark ? 'text-white' : 'text-foreground'}`}>
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
