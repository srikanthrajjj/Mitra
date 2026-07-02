import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FileText, Package, Workflow, Download, type LucideIcon } from 'lucide-react';
import { MitraLogo } from './MitraLogo';
import { MitraTodos } from './MitraTodos';
import { HR_BUILD_TODOS } from '../utils/buildTodos';
import type { MitraTodoItem } from '../types';
import { USER_INITIALS } from '../constants/user';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import replySoundUrl from '../assets/sound.mp3';

type BubbleKind = 'user' | 'thinking' | 'todos' | 'assistant';

interface DemoBubble {
  id: string;
  kind: BubbleKind;
  text?: string;
  artifacts?: string[];
  todos?: MitraTodoItem[];
  todoSummary?: string;
  enterIndex: number;
}

interface DemoStep {
  kind: BubbleKind;
  text?: string;
  artifacts?: string[];
  todos?: MitraTodoItem[];
  todoSummary?: string;
  /** ms after previous step */
  delay: number;
}

const DEMO_STEPS: DemoStep[] = [
  {
    kind: 'user',
    text: 'Build an HR onboarding tracker on ServiceNow — employee requests, manager approvals, and SLA visibility.',
    delay: 800,
  },
  { kind: 'thinking', delay: 1100 },
  {
    kind: 'todos',
    todoSummary:
      "I'll build your HR onboarding tracker: HRSD scope, catalog workflows, SLA timers, and stakeholder-ready artifacts.",
    todos: HR_BUILD_TODOS,
    delay: 400,
  },
  {
    kind: 'assistant',
    text: "I'll map this to HRSD patterns: user stories, a catalog item with approval routing, and Flow Designer SLA timers.",
    delay: 5200,
  },
  {
    kind: 'user',
    text: 'Can you show the user stories and catalog structure?',
    delay: 1000,
  },
  {
    kind: 'assistant',
    text: 'Generated artifacts are ready. Next I\'ll build the ATF test suite and SLA dashboard widgets.',
    artifacts: ['4 User Stories', 'Catalog Item', 'Flow Designer'],
    delay: 1100,
  },
  {
    kind: 'user',
    text: 'Can you compile the full HR onboarding requirements document for download?',
    delay: 1500,
  },
  { kind: 'thinking', delay: 1000 },
  {
    kind: 'assistant',
    text: 'Requirements document generated. You can click on the file below to download the markdown specification.',
    artifacts: ['Requirements Doc (MD)'],
    delay: 1300,
  },
];

const LOOP_PAUSE_MS = 4000;
const FADE_OUT_MS = 600;

const ARTIFACT_ICONS: Record<string, LucideIcon> = {
  '4 User Stories': FileText,
  'Catalog Item': Package,
  'Flow Designer': Workflow,
  'Requirements Doc (MD)': Download,
};

let stepId = 0;
function nextId() {
  stepId += 1;
  return `hero-bubble-${stepId}`;
}

function downloadRequirements() {
  const markdownContent = `# HR Onboarding Tracker - ServiceNow Requirements

## 1. Overview
This document specifies the requirements for the HR Onboarding Tracker application built on ServiceNow.

## 2. Workflows & Features
- **Employee Requests**: Form for new hires to submit details.
- **Manager Approvals**: Automated approval routing to reporting managers.
- **SLA Visibility**: SLA timers and Flow Designer triggers.

## 3. Catalog Structure
- Catalog Item: HR Onboarding Request
- Workflow: Approval & Provisioning Flow
- SLA: 24-hour response SLA

## 4. User Stories
- **US-101**: As a new hire, I want to submit my onboarding details so that my equipment is ordered.
- **US-102**: As a manager, I want to approve new hire requests so that onboarding tasks can proceed.
- **US-103**: As an HR specialist, I want SLA timers on approvals to ensure onboarding is completed in 3 days.
`;
  const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'mitra_hr_onboarding_requirements.md');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function AssistantHeader({ status }: { status?: 'thinking' | 'ready' }) {
  return (
    <div className="landing-hero-chat-bubble-header">
      <div className="landing-hero-chat-bubble-brand">
        <MitraLogo className="landing-hero-chat-bubble-logo" alt="" />
        <span className="landing-hero-chat-bubble-name">Mitra</span>
      </div>
      {status && (
        <span
          className={cn(
            'landing-hero-chat-bubble-status',
            status === 'thinking' && 'landing-hero-chat-bubble-status--thinking',
          )}
        >
          {status === 'thinking' ? (
            <>
              <span className="landing-hero-chat-status-dot" aria-hidden="true" />
              Thinking
            </>
          ) : (
            <>
              <span className="landing-hero-chat-status-dot landing-hero-chat-status-dot--ready" aria-hidden="true" />
              Ready
            </>
          )}
        </span>
      )}
    </div>
  );
}

function UserAvatar() {
  return (
    <span className="landing-hero-chat-user-avatar" aria-hidden="true">
      {USER_INITIALS}
    </span>
  );
}

let sharedAudioContext: AudioContext | null = null;

// Global helper to unlock audio context on user gesture
function getOrInitializeAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass();
    }
  }
  if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }
  return sharedAudioContext;
}

// Automatically try to unlock audio on first click, keypress, or touch
if (typeof window !== 'undefined') {
  const unlock = () => {
    const ctx = getOrInitializeAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        window.removeEventListener('click', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('touchstart', unlock);
      }).catch(() => {});
    } else if (ctx) {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    }
  };
  window.addEventListener('click', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock);
}

// Subtle synthesized bubble pop sound using Web Audio API (gaming style)
function playBubbleSound() {
  try {
    const ctx = getOrInitializeAudioContext();
    if (!ctx) return;
    
    // Resume context if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    
    const now = ctx.currentTime;
    
    // Bubble sound frequency sweep: low to high (pop effect)
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.12);
    
    // Subtle gain decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.015); // subtle but audible pop
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    // Suppress audio context restrictions
  }
}

// Play custom sound.mp3 for assistant replies
function playReplySound() {
  try {
    const audio = new Audio(replySoundUrl);
    audio.volume = 0.17; // halved volume (reduced by 50% from 0.35)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Safe fallback if user hasn't clicked yet
      });
    }
  } catch (e) {
    // Suppress audio context restrictions
  }
}

interface LandingHeroChatDemoProps {
  isLight?: boolean;
}

export function LandingHeroChatDemo({ isLight = false }: LandingHeroChatDemoProps) {
  const [bubbles, setBubbles] = useState<DemoBubble[]>([]);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLogoIntro, setShowLogoIntro] = useState(true);
  const [showWelcomeText, setShowWelcomeText] = useState(false);
  const enterCounterRef = useRef(0);
  const timeoutsRef = useRef<number[]>([]);
  const showcaseRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const handleArtifactClick = (label: string) => {
    if (label === 'Requirements Doc (MD)') {
      downloadRequirements();
    }
  };

  const messagesRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    if (showcaseRef.current && messagesRef.current) {
      const showcaseHeight = showcaseRef.current.clientHeight;
      const messagesHeight = messagesRef.current.scrollHeight;
      if (messagesHeight > showcaseHeight) {
        setTranslateY(showcaseHeight - messagesHeight - 16);
      } else {
        setTranslateY(0);
      }
    }
  }, [bubbles, showLogoIntro, showWelcomeText]);

  const runSequence = useCallback(() => {
    clearTimers();
    setFadeOut(false);
    setBubbles([]);
    setShowLogoIntro(true);
    setShowWelcomeText(false);
    enterCounterRef.current = 0;

    const introTimeoutId = window.setTimeout(() => {
      setShowLogoIntro(false);
      setShowWelcomeText(true);
    }, 4200);
    timeoutsRef.current.push(introTimeoutId);

    const welcomeTimeoutId = window.setTimeout(() => {
      setShowWelcomeText(false);
    }, 6200);
    timeoutsRef.current.push(welcomeTimeoutId);

    const introOffset = 4200 + 2000;
    let elapsed = introOffset;

    DEMO_STEPS.forEach((step) => {
      elapsed += step.delay;
      const timeoutId = window.setTimeout(() => {
        const enterIndex = enterCounterRef.current;
        enterCounterRef.current += 1;

        if (step.kind === 'thinking') {
          setBubbles((prev) => {
            const withoutThinking = prev.filter((b) => b.kind !== 'thinking');
            return [...withoutThinking, { id: nextId(), kind: 'thinking', enterIndex }];
          });
          return;
        }

        if (step.kind === 'todos') {
          playReplySound();
          setBubbles((prev) => {
            const withoutThinking = prev.filter((b) => b.kind !== 'thinking');
            return [
              ...withoutThinking,
              {
                id: nextId(),
                kind: 'todos',
                todos: step.todos,
                todoSummary: step.todoSummary,
                enterIndex,
              },
            ];
          });
          return;
        }

        // Play reply sound for assistant messages only (no sound for user messages)
        if (step.kind === 'assistant') {
          playReplySound();
        }

        setBubbles((prev) => {
          const withoutThinking = prev.filter((b) => b.kind !== 'thinking');
          return [
            ...withoutThinking,
            {
              id: nextId(),
              kind: step.kind,
              text: step.text,
              artifacts: step.artifacts,
              enterIndex,
            },
          ];
        });
      }, elapsed);
      timeoutsRef.current.push(timeoutId);
    });

    // Stopped sequence loop: bubbles will run through once and stay on screen
  }, [clearTimers]);

  useEffect(() => {
    runSequence();
    return clearTimers;
  }, [runSequence, clearTimers]);

  return (
    <div
      className={cn('landing-hero-chat', isLight && 'landing-hero-chat--light')}
      aria-hidden="true"
    >
      <div ref={showcaseRef} className="landing-hero-chat-showcase">
        {showLogoIntro ? (
          <div className="landing-hero-logo-intro">
            <div className="landing-hero-logo-wrap">
              <div className="landing-logo-glow-ring" />
              <MitraLogo className="landing-hero-logo h-11 w-11" />
            </div>
          </div>
        ) : showWelcomeText ? (
          <div className="flex items-center justify-center h-full w-full min-h-[24rem]">
            <motion.div 
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-4 px-6 max-w-sm"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 mb-2">
                <MitraLogo className="h-5 w-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-light tracking-wide text-white/95 leading-relaxed">
                Let's build your app today.
              </h2>
            </motion.div>
          </div>
        ) : (
          <div
            ref={messagesRef}
            className={cn(
              'landing-hero-chat-messages',
              fadeOut && 'landing-hero-chat-messages--fade-out',
            )}
            style={{
              transform: `translateY(${translateY}px)`,
              transition: fadeOut
                ? 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'transform 450ms cubic-bezier(0.25, 0.1, 0.25, 1), opacity 600ms ease-out'
            }}
          >
            {bubbles.map((bubble) => (
              <div
                key={bubble.id}
                className={cn(
                  'landing-hero-chat-bubble-wrap landing-hero-chat-bubble-enter',
                  bubble.kind === 'user' && 'landing-hero-chat-bubble-wrap--user',
                  bubble.kind !== 'user' && 'landing-hero-chat-bubble-wrap--assistant',
                )}
                style={{ '--bubble-enter-index': bubble.enterIndex } as React.CSSProperties}
              >
                {bubble.kind === 'user' && (
                  <div className="landing-hero-chat-bubble-row landing-hero-chat-bubble-row--user">
                    <div className="landing-hero-chat-bubble landing-hero-chat-bubble--user">
                      <p className="landing-hero-chat-bubble-text">{bubble.text}</p>
                    </div>
                    <UserAvatar />
                  </div>
                )}

                {bubble.kind === 'thinking' && (
                  <div className="landing-hero-chat-bubble landing-hero-chat-bubble--assistant landing-hero-chat-bubble--thinking">
                    <AssistantHeader status="thinking" />
                    <div className="landing-hero-chat-thinking-status">
                      <span className="landing-hero-chat-thinking-text">Mapping your request</span>
                      <div className="landing-hero-chat-typing" role="status" aria-label="Thinking">
                        <span className="landing-hero-chat-typing-dot" />
                        <span className="landing-hero-chat-typing-dot" />
                        <span className="landing-hero-chat-typing-dot" />
                      </div>
                    </div>
                  </div>
                )}

                {bubble.kind === 'todos' && bubble.todos && (
                  <div className="landing-hero-chat-bubble landing-hero-chat-bubble--assistant landing-hero-chat-bubble--todos">
                    <AssistantHeader />
                    <MitraTodos items={bubble.todos} summary={bubble.todoSummary} animate stepMs={850} />
                  </div>
                )}

                {bubble.kind === 'assistant' && (
                  <div
                    className={cn(
                      'landing-hero-chat-bubble landing-hero-chat-bubble--assistant',
                      bubble.artifacts && bubble.artifacts.length > 0 && 'landing-hero-chat-bubble--with-artifacts',
                    )}
                  >
                    <AssistantHeader status={bubble.artifacts?.length ? 'ready' : undefined} />
                    <p className="landing-hero-chat-bubble-text">{bubble.text}</p>
                    {bubble.artifacts && bubble.artifacts.length > 0 && (
                      <div className="landing-hero-chat-artifacts">
                        {bubble.artifacts.map((label) => {
                          const Icon = ARTIFACT_ICONS[label];
                          const isInteractive = label === 'Requirements Doc (MD)';
                          return (
                            <span
                              key={label}
                              role={isInteractive ? 'button' : undefined}
                              tabIndex={isInteractive ? 0 : undefined}
                              onClick={() => isInteractive && handleArtifactClick(label)}
                              onKeyDown={(e) => {
                                if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
                                  e.preventDefault();
                                  handleArtifactClick(label);
                                }
                              }}
                              className={cn(
                                'landing-hero-chat-artifact',
                                isInteractive && 'landing-hero-chat-artifact--interactive',
                              )}
                            >
                              {Icon && <Icon className="landing-hero-chat-artifact-icon" aria-hidden="true" />}
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

