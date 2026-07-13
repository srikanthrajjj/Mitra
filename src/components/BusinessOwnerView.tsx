import { useState, useRef, useEffect, useCallback, type ChangeEvent, type DragEvent } from 'react';
import {
  Upload, FileText, Sparkles, GitBranch, Paperclip, ListChecks,
} from 'lucide-react';
import { Theme, UserStory, BusinessOwnerSubmission, BusinessOwnerRequirementsUpload } from '../types';
import { isDarkTheme } from '../utils/theme';
import { ASSISTANT_LABEL } from '../constants/organization';
import {
  SAMPLE_REQUIREMENTS_DOC,
  SAMPLE_PROCESS_FLOW,
  BA_QUESTIONS,
  BO_CHAT_COLD_START,
  BO_CHAT_QUESTIONS,
} from '../data/businessOwnerSamples';
import { generateUserStories, summarizeRequirements, type BAAnswers } from '../utils/userStoryGenerator';
import {
  briefChatAck,
  generateRequirementsFromChat,
  mapChatAnswerKey,
  requirementsReadyMessage,
  type BOChatAnswers,
} from '../utils/businessOwnerChatEngine';
import { thinkingDelay } from '../utils/demoThinkingDelay';
import { useChatCompletionSound } from '../utils/chatCompletionSound';
import { BusinessOwnerArtifactsPanel } from './BusinessOwnerArtifactsPanel';
import {
  BusinessOwnerChatComposer,
  BusinessOwnerChatThread,
  BusinessOwnerEntryTabs,
  type BusinessOwnerEntryMode,
} from './BusinessOwnerChat';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { cn } from '@/lib/utils';

type JourneyPhase =
  | 'idle'
  | 'chat_discovery'
  | 'intro'
  | 'ba_questions'
  | 'stories_ready'
  | 'flow_prompt'
  | 'complete';

interface BusinessOwnerViewProps {
  theme: Theme;
  submission: BusinessOwnerSubmission | null;
  onSubmissionChange: (submission: BusinessOwnerSubmission) => void;
  onNewSubmission: () => void;
}

function UserStoryCard({ story }: { story: UserStory }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/50 p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[10px] font-normal">
          Draft · Ready for Agile/Jira
        </Badge>
        {story.priority && (
          <span className="text-[10px] capitalize text-muted-foreground">{story.priority}</span>
        )}
      </div>
      {story.epic && (
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-primary/70">
          {story.epic}
        </p>
      )}
      <p className="text-[13px] leading-relaxed text-foreground">{story.formatted}</p>
      <div className="mt-2.5 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        <span className="rounded bg-muted/50 px-1.5 py-0.5">Role: {story.role}</span>
      </div>
    </div>
  );
}

export function BusinessOwnerView({
  theme,
  submission,
  onSubmissionChange,
  onNewSubmission,
}: BusinessOwnerViewProps) {
  const isDark = isDarkTheme(theme);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flowInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatStartedRef = useRef(false);
  const [entryMode, setEntryMode] = useState<BusinessOwnerEntryMode>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'mitra'; text: string }[]>([]);
  const [phase, setPhase] = useState<JourneyPhase>('idle');
  const [baIndex, setBaIndex] = useState(0);
  const [baAnswers, setBaAnswers] = useState<Partial<BAAnswers>>({});
  const [chatIndex, setChatIndex] = useState(0);
  const [chatAnswers, setChatAnswers] = useState<Partial<BOChatAnswers>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [userStories, setUserStories] = useState<UserStory[]>(submission?.userStories ?? []);
  const [requirements, setRequirements] = useState<BusinessOwnerRequirementsUpload | undefined>(
    submission?.requirements,
  );

  useChatCompletionSound(isTyping, messages);

  const addMitraMessage = useCallback(async (text: string, options?: { skipDelay?: boolean }) => {
    setIsTyping(true);
    if (!options?.skipDelay) {
      await thinkingDelay();
    }
    setMessages((prev) => [
      ...prev,
      { id: `mitra-${Date.now()}`, sender: 'mitra', text },
    ]);
    setIsTyping(false);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: 'user', text },
    ]);
  }, []);

  const syncSubmission = useCallback(
    (patch: Partial<BusinessOwnerSubmission>) => {
      const base: BusinessOwnerSubmission = submission ?? {
        id: `bo-${Date.now()}`,
        title: requirements?.fileName.replace(/\.[^.]+$/, '') ?? 'New Submission',
        status: 'draft',
        userStories: [],
        updatedAt: new Date().toISOString(),
      };
      onSubmissionChange({
        ...base,
        ...patch,
        requirements: patch.requirements ?? requirements ?? base.requirements,
        userStories: patch.userStories ?? userStories,
        updatedAt: new Date().toISOString(),
      });
    },
    [submission, requirements, userStories, onSubmissionChange],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, userStories, phase, isTyping]);

  const startBaFlow = useCallback(
    async (req: BusinessOwnerRequirementsUpload) => {
      setRequirements(req);
      setPhase('intro');
      setBaIndex(0);
      setBaAnswers({});
      setUserStories([]);

      await addMitraMessage(
        `I'll convert your business needs into structured user story templates formatted for **ServiceNow Agile Development** or **Jira**.\n\n${summarizeRequirements(req)}\n\nLet me ask a few business analyst questions to refine the stories.`,
      );
      setPhase('ba_questions');
      await addMitraMessage(BA_QUESTIONS[0].prompt, { skipDelay: true });
    },
    [addMitraMessage],
  );

  const startUploadJourney = useCallback(
    async (req: BusinessOwnerRequirementsUpload) => {
      setRequirements(req);
      setPhase('intro');
      setMessages([]);
      setBaIndex(0);
      setBaAnswers({});
      setUserStories([]);

      addUserMessage(`Uploaded: ${req.fileName}`);
      await addMitraMessage(
        `I've received **${req.fileName}**. I'll convert your unstructured business needs into structured user story templates formatted for **ServiceNow Agile Development** or **Jira**.\n\n${summarizeRequirements(req)}\n\nLet me ask a few business analyst questions to refine the stories.`,
      );
      setPhase('ba_questions');
      await addMitraMessage(BA_QUESTIONS[0].prompt, { skipDelay: true });
    },
    [addMitraMessage, addUserMessage],
  );

  const startChatDiscovery = useCallback(async () => {
    if (chatStartedRef.current) return;
    chatStartedRef.current = true;
    setPhase('chat_discovery');
    setChatIndex(0);
    setChatAnswers({});
    await addMitraMessage(BO_CHAT_COLD_START);
    await addMitraMessage(BO_CHAT_QUESTIONS[0].prompt, { skipDelay: true });
  }, [addMitraMessage]);

  useEffect(() => {
    if (entryMode === 'chat' && phase === 'idle' && messages.length === 0) {
      startChatDiscovery();
    }
  }, [entryMode, phase, messages.length, startChatDiscovery]);

  const handleUpload = useCallback(
    (fileName: string, content?: string) => {
      const req: BusinessOwnerRequirementsUpload = {
        id: `req-${Date.now()}`,
        fileName,
        content: content ?? `[Uploaded file: ${fileName}]`,
        uploadedAt: new Date().toISOString(),
      };
      syncSubmission({
        title: fileName.replace(/\.[^.]+$/, ''),
        requirements: req,
        userStories: [],
        status: 'draft',
      });
      startUploadJourney(req);
    },
    [startUploadJourney, syncSubmission],
  );

  const handleSampleDoc = () => {
    syncSubmission({
      title: 'HR Service Delivery Requirements',
      requirements: SAMPLE_REQUIREMENTS_DOC,
      userStories: [],
      status: 'draft',
    });
    startUploadJourney(SAMPLE_REQUIREMENTS_DOC);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file.name);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file.name);
    e.target.value = '';
  };

  const handleGenerateStories = async (answers: BAAnswers) => {
    setPhase('stories_ready');
    await addMitraMessage('Generating draft user stories from your requirements and answers…');

    const req = requirements ?? SAMPLE_REQUIREMENTS_DOC;
    const stories = generateUserStories(req, answers);
    setUserStories(stories);
    syncSubmission({ userStories: stories });

    await addMitraMessage(
      `Here are **${stories.length} draft user stories** ready for Agile/Jira. Review them below — each follows the standard format: *As a [role], I want [action], so that [value]*.`,
      { skipDelay: true },
    );
    setPhase('flow_prompt');
    await addMitraMessage(
      'Would you like to **attach functional process flow diagrams**? Upload a diagram file or generate a sample flow to attach to this submission.',
      { skipDelay: true },
    );
  };

  const handleChatDiscoveryComplete = async (answers: BOChatAnswers) => {
    await addMitraMessage('Drafting your **Requirements Document** from our conversation…');
    const req = generateRequirementsFromChat(answers);
    setRequirements(req);
    syncSubmission({
      title: req.fileName.replace(/\.[^.]+$/, ''),
      requirements: req,
      userStories: [],
      status: 'draft',
    });
    await addMitraMessage(requirementsReadyMessage(req.fileName), { skipDelay: true });
    await startBaFlow(req);
  };

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    setInputValue('');
    addUserMessage(text);

    if (phase === 'chat_discovery') {
      const question = BO_CHAT_QUESTIONS[chatIndex];
      const key = mapChatAnswerKey(question.id);
      const updated = { ...chatAnswers, [key]: text };
      setChatAnswers(updated);

      const nextIndex = chatIndex + 1;
      if (nextIndex < BO_CHAT_QUESTIONS.length) {
        await addMitraMessage(briefChatAck(chatIndex));
        setChatIndex(nextIndex);
        await addMitraMessage(BO_CHAT_QUESTIONS[nextIndex].prompt, { skipDelay: true });
      } else {
        await addMitraMessage(briefChatAck(chatIndex));
        await handleChatDiscoveryComplete(updated as BOChatAnswers);
      }
    } else if (phase === 'ba_questions') {
      const question = BA_QUESTIONS[baIndex];
      const key = question.id === 'user_role'
        ? 'userRole'
        : question.id === 'desired_action'
          ? 'desiredAction'
          : 'businessValue';
      const updated = { ...baAnswers, [key]: text };
      setBaAnswers(updated);

      const nextIndex = baIndex + 1;
      if (nextIndex < BA_QUESTIONS.length) {
        setBaIndex(nextIndex);
        await addMitraMessage(BA_QUESTIONS[nextIndex].prompt);
      } else {
        await handleGenerateStories(updated as BAAnswers);
      }
    } else if (phase === 'flow_prompt' || phase === 'stories_ready') {
      if (/generate|sample|demo/i.test(text)) {
        handleGenerateSampleFlow();
      } else {
        await addMitraMessage(
          'You can upload a process flow diagram using the attachment zone below, or type "generate sample flow" for a demo diagram.',
        );
      }
    }
  };

  const handleGenerateSampleFlow = async () => {
    addUserMessage('Generate sample flow');
    syncSubmission({ processFlow: SAMPLE_PROCESS_FLOW, status: 'submitted' });
    setPhase('complete');
    await addMitraMessage(
      `Sample process flow **"${SAMPLE_PROCESS_FLOW.name}"** attached. Your submission is ready for the Solution Architect to pick up.\n\n**Attached artifacts:**\n• Requirements Document\n• ${userStories.length} User Stories (Draft)\n• Process Flow Diagram`,
    );
  };

  const handleFlowUpload = (fileName: string) => {
    addUserMessage(`Attached diagram: ${fileName}`);
    syncSubmission({
      processFlow: {
        id: `flow-${Date.now()}`,
        name: fileName,
        description: 'Uploaded process flow diagram',
        attachedAt: new Date().toISOString(),
      },
      status: 'submitted',
    });
    setPhase('complete');
    void addMitraMessage(
      `Process flow **"${fileName}"** attached. Your submission is complete and ready for architect review.`,
    );
  };

  const handleReset = () => {
    onNewSubmission();
    setPhase('idle');
    setMessages([]);
    setBaIndex(0);
    setBaAnswers({});
    setChatIndex(0);
    setChatAnswers({});
    setUserStories([]);
    setRequirements(undefined);
    setInputValue('');
    chatStartedRef.current = false;
    if (entryMode === 'chat') {
      setTimeout(() => startChatDiscovery(), 100);
    }
  };

  const handleEntryModeChange = (mode: BusinessOwnerEntryMode) => {
    if (phase !== 'idle') return;
    setEntryMode(mode);
    if (mode === 'upload') {
      chatStartedRef.current = false;
    }
  };

  const showUploadZone = phase === 'idle' && entryMode === 'upload';
  const showChatColdStart = phase === 'idle' && entryMode === 'chat';
  const showComposer =
    phase === 'chat_discovery' ||
    phase === 'intro' ||
    phase === 'ba_questions' ||
    phase === 'flow_prompt' ||
    phase === 'stories_ready';
  const tabsLocked = phase !== 'idle';

  const currentQuestion =
    phase === 'chat_discovery'
      ? BO_CHAT_QUESTIONS[chatIndex]
      : phase === 'ba_questions'
        ? BA_QUESTIONS[baIndex]
        : null;

  const activeSubmission: BusinessOwnerSubmission | null = submission
    ? { ...submission, requirements, userStories }
    : requirements
      ? {
          id: 'temp',
          title: requirements.fileName.replace(/\.[^.]+$/, ''),
          status: 'draft',
          requirements,
          userStories,
          updatedAt: new Date().toISOString(),
        }
      : null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border px-6 py-3">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-base font-display font-medium tracking-tight text-foreground">
                Requirements → User Stories
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Upload a document or chat with Mitra to shape requirements and user stories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <BusinessOwnerEntryTabs
                mode={entryMode}
                onModeChange={handleEntryModeChange}
                disabled={tabsLocked}
              />
              {phase !== 'idle' && (
                <Button variant="outline" size="sm" className="text-xs" onClick={handleReset}>
                  Start over
                </Button>
              )}
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <div className="mx-auto max-w-3xl space-y-4">
            {showUploadZone && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-display font-medium text-foreground">
                    Upload your requirements document
                  </h2>
                  <p className="mt-1.5 text-[13px] text-muted-foreground">
                    Mitra will help convert unstructured business needs into structured user stories
                  </p>
                </div>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'relative cursor-pointer rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all',
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : isDark
                        ? 'border-border/60 bg-card/30 hover:border-primary/40 hover:bg-card/50'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-accent',
                  )}
                >
                  {dragActive && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/10">
                      <span className="text-sm font-medium text-primary">Drop requirements here</span>
                    </div>
                  )}
                  <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-[13px] font-medium text-foreground">
                    Drag & drop or click to browse
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    PDF, Word, or text documents
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.md"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="gap-2 text-[12px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSampleDoc();
                    }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Upload a sample doc
                  </Button>
                </div>
              </div>
            )}

            {showChatColdStart && messages.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Mitra is getting ready to help you describe your business needs…
                </p>
              </div>
            )}

            <BusinessOwnerChatThread
              theme={theme}
              messages={messages}
              isTyping={isTyping}
            />

            {userStories.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-primary" />
                  <h3 className="text-[13px] font-semibold text-foreground">
                    Draft User Stories
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {userStories.length} stories
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  {userStories.map((story) => (
                    <div key={story.id}>
                      <UserStoryCard story={story} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(phase === 'flow_prompt' || phase === 'complete') && (
              <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  <p className="text-[13px] font-medium text-foreground">Process flow diagram</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-[11px]"
                    onClick={handleGenerateSampleFlow}
                    disabled={Boolean(submission?.processFlow)}
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate sample flow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-[11px]"
                    onClick={() => flowInputRef.current?.click()}
                    disabled={Boolean(submission?.processFlow)}
                  >
                    <Paperclip className="h-3 w-3" />
                    Upload diagram
                  </Button>
                  <input
                    ref={flowInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.svg,.vsdx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFlowUpload(file.name);
                      e.target.value = '';
                    }}
                  />
                </div>
                {submission?.processFlow && (
                  <p className="text-[11px] text-muted-foreground">
                    ✓ {submission.processFlow.name} — {submission.processFlow.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {showComposer && (
          <BusinessOwnerChatComposer
            theme={theme}
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder={currentQuestion?.placeholder ?? 'Reply to Mitra…'}
            disabled={isTyping}
            footerLabel={`${ASSISTANT_LABEL} · Business Owner journey`}
          />
        )}
      </div>

      <BusinessOwnerArtifactsPanel submission={activeSubmission} />
    </div>
  );
}
