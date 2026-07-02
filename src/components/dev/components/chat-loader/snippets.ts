import chatLoaderCss from './chat-loader.css?raw';

export const CHAT_LOADER_STEPS = [
  'Parsing functional rules',
  'Checking API schemas',
  'Mapping scope tables',
  'Checking best practices',
  'Assembling blueprint',
] as const;

export const CHAT_LOADER_HTML = `<!-- Mitra chat loader (dark) -->
<div
  class="mitra-chat-loader mitra-chat-loader--dark"
  role="status"
  aria-live="polite"
  aria-label="Mitra is thinking"
  data-mitra-chat-loader
  data-steps='["Parsing functional rules","Checking API schemas","Mapping scope tables","Checking best practices","Assembling blueprint"]'
>
  <div class="mitra-chat-loader__body">
    <div class="mitra-chat-loader__row">
      <span class="mitra-chat-loader__pulse" aria-hidden="true">
        <span class="mitra-chat-loader__pulse-ring"></span>
        <span class="mitra-chat-loader__pulse-dot"></span>
      </span>
      <p class="mitra-chat-loader__phrase mitra-chat-loader__phrase--enter" data-mitra-chat-loader-phrase>
        Parsing functional rules...
      </p>
    </div>
    <div class="mitra-chat-loader__track" aria-hidden="true">
      <div class="mitra-chat-loader__fill" data-mitra-chat-loader-progress style="width: 20%"></div>
    </div>
  </div>
</div>`;

export const CHAT_LOADER_CSS = chatLoaderCss;

export const CHAT_LOADER_JS = `// Minimal cycle logic for vanilla HTML usage
(function initMitraChatLoaders() {
  document.querySelectorAll('[data-mitra-chat-loader]').forEach((root) => {
    const phraseEl = root.querySelector('[data-mitra-chat-loader-phrase]');
    const progressEl = root.querySelector('[data-mitra-chat-loader-progress]');
    if (!phraseEl || !progressEl) return;

    const steps = JSON.parse(root.getAttribute('data-steps') || '[]');
    if (!steps.length) return;

    let index = 0;

    const tick = () => {
      phraseEl.classList.add('mitra-chat-loader__phrase--fading');
      window.setTimeout(() => {
        index = Math.min(index + 1, steps.length - 1);
        phraseEl.textContent = steps[index] + '...';
        phraseEl.classList.remove('mitra-chat-loader__phrase--fading');
        phraseEl.classList.add('mitra-chat-loader__phrase--enter');
        progressEl.style.width = Math.round(((index + 1) / steps.length) * 100) + '%';
      }, 220);
    };

    window.setInterval(tick, 1600);
  });
})();`;

export const CHAT_LOADER_REACT = `import MitraThinkingIndicator from './components/MitraThinkingIndicator';

// In a chat bubble while the model is streaming:
<MitraThinkingIndicator
  theme={theme}
  context="architect"
  compact={false}
/>

// Contexts: 'default' | 'architect' | 'businessOwner'
// compact: smaller card for inline chat rows`;
