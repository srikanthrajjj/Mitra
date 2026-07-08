import chatLoaderCss from './chat-loader.css?raw';
import thinkingVariationsCss from './thinking-variations.css?raw';

export const CHAT_LOADER_STEPS = [
  'Parsing functional rules',
  'Checking API schemas',
  'Mapping scope tables',
  'Checking best practices',
  'Assembling blueprint',
] as const;

export const THINKING_SNIPPETS_HTML = `<!-- Grid dots (production) -->
<div class="mitra-think mitra-think--grid mitra-think--dark" role="status" aria-live="polite" aria-label="Thinking about your request">
  <div class="mitra-think__grid" aria-hidden="true">
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
    <span class="mitra-think__grid-dot"></span>
  </div>
  <span class="mitra-think__grid-label">Thinking about your request</span>
</div>

<!-- 2. Typing dots -->
<div class="mitra-think mitra-think--dots mitra-think--dark" role="status" aria-live="polite">
  <span class="mitra-think__dots-label">Mitra is thinking</span>
  <span class="mitra-think__dots" aria-hidden="true">
    <span class="mitra-think__dot"></span>
    <span class="mitra-think__dot"></span>
    <span class="mitra-think__dot"></span>
  </span>
</div>

<!-- 3. Shimmer label -->
<div class="mitra-think mitra-think--shimmer mitra-think--dark" role="status" aria-live="polite">
  <span class="mitra-think__shimmer-dot" aria-hidden="true"></span>
  <p class="mitra-think__shimmer-text">Reviewing your request...</p>
</div>

<!-- 4. Glow pulse -->
<div class="mitra-think mitra-think--glow mitra-think--dark" role="status" aria-live="polite" aria-label="Thinking">
  <span class="mitra-think__glow-orb-wrap" aria-hidden="true">
    <span class="mitra-think__glow-halo"></span>
    <span class="mitra-think__glow-orb"></span>
  </span>
  <span class="mitra-think__glow-label">Thinking</span>
</div>`;

export const THINKING_SNIPPETS_CSS = `${chatLoaderCss}\n\n${thinkingVariationsCss}`;

export const THINKING_SNIPPETS_JS = `// Snake scan — one dot at a time, ping-pong forward / reverse
const DOT_COUNT = 8;
const STEP_MS = 260;
let index = 0;
let direction = 1;

setInterval(() => {
  if (index === DOT_COUNT - 1) direction = -1;
  else if (index === 0) direction = 1;
  index += direction;

  document.querySelectorAll('.mitra-think__grid-dot').forEach((el, i) => {
    el.classList.toggle('mitra-think__grid-dot--active', i === index);
  });
}, STEP_MS);`;

export const THINKING_SNIPPETS_REACT = `import MitraThinkingIndicator from './components/MitraThinkingIndicator';
import {
  PhaseStreamThinking,
  TypingDotsThinking,
  ShimmerThinking,
  GlowPulseThinking,
} from './components/dev/components/chat-loader/ThinkingVariations';

// Production — grid snake scan
<MitraThinkingIndicator theme={theme} context="architect" />

// Dev variations (pick by use case):
<PhaseStreamThinking theme="dark" />   {/* same as production grid dots */}
<TypingDotsThinking theme="dark" />    {/* short wait, pre-stream */}
<ShimmerThinking theme="dark" />       {/* background / low-attention */}
<GlowPulseThinking theme="dark" />     {/* minimal breathing orb */}

// Contexts on MitraThinkingIndicator: 'default' | 'architect' | 'businessOwner'`;

// Legacy exports for backwards compatibility
export const CHAT_LOADER_HTML = THINKING_SNIPPETS_HTML;
export const CHAT_LOADER_CSS = THINKING_SNIPPETS_CSS;
export const CHAT_LOADER_JS = THINKING_SNIPPETS_JS;
export const CHAT_LOADER_REACT = THINKING_SNIPPETS_REACT;
