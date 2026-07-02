import streamingTextCss from './streaming-text.css?raw';

export const STREAMING_TEXT_HTML = `<!-- Streaming assistant text -->
<div class="chat-response-text chat-response-text--dark">
  <div class="stream-smooth-text stream-smooth-text--active">
    <span class="stream-smooth-text__body">Got it — that helps frame the scope.</span>
    <span class="stream-cursor stream-cursor--dark" aria-hidden="true"></span>
  </div>
</div>`;

export const STREAMING_TEXT_CSS = streamingTextCss;

export const STREAMING_TEXT_JS = `// SmoothStreamingText handles reveal in React.
// Vanilla fallback: append characters on an interval.
const body = document.querySelector('.stream-smooth-text__body');
const full = body.textContent;
let i = 0;
body.textContent = '';
const timer = setInterval(() => {
  i += 1;
  body.textContent = full.slice(0, i);
  if (i >= full.length) clearInterval(timer);
}, 24);`;

export const STREAMING_TEXT_REACT = `import { SmoothStreamingText } from './components/SmoothStreamingText';

<SmoothStreamingText
  text={msg.text}
  isStreaming
  className="chat-response-text"
  cursor={<span className="stream-cursor stream-cursor--dark" aria-hidden />}
/>`;
