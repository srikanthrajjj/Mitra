import { useEffect, useRef } from 'react';
import { readChatCompletionSound } from './settingsStorage';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    return audioContext;
  } catch {
    return null;
  }
}

// Automatically unlock audio context on first user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (ctx && ctx.state === 'running') {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    }
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

/** Subtle two-tone VR/sci-fi chime when Mitra finishes a chat response. */
export function playChatCompletionSound(): void {
  if (!readChatCompletionSound()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.2, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  master.connect(ctx.destination);

  const tones = [
    { freq: 523.25, start: 0, duration: 0.22 },
    { freq: 783.99, start: 0.1, duration: 0.28 },
  ];

  for (const { freq, start, duration } of tones) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(0.18, now + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + start);
    osc.stop(now + start + duration + 0.05);
  }
}

type ChatSender = { sender: 'user' | 'mitra'; text: string };

/** Play completion sound when generation ends and the last message is from Mitra. */
export function useChatCompletionSound(
  isGenerating: boolean,
  messages: ChatSender[],
): void {
  const prevGeneratingRef = useRef(false);

  useEffect(() => {
    if (prevGeneratingRef.current && !isGenerating) {
      const last = messages.at(-1);
      if (last?.sender === 'mitra' && last.text.trim().length > 0) {
        playChatCompletionSound();
      }
    }
    prevGeneratingRef.current = isGenerating;
  }, [isGenerating, messages]);
}
