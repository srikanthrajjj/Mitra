import chatBubbleCss from './chat-bubble.css?raw';

export const CHAT_BUBBLE_HTML = `<!-- User + assistant rows -->
<div class="mitra-chat-message mitra-chat-message--user">
  <div class="mitra-chat-avatar mitra-chat-avatar--user-light">SR</div>
  <div class="mitra-chat-bubble-wrap">
    <div class="mitra-chat-bubble mitra-chat-bubble--user-light">
      I want to build a ServiceNow application for HR ticketing.
    </div>
  </div>
</div>

<div class="mitra-chat-message mitra-chat-message--assistant">
  <div class="mitra-chat-avatar mitra-chat-avatar--assistant"></div>
  <div class="mitra-chat-bubble-wrap">
    <div class="mitra-chat-bubble mitra-chat-bubble--assistant-light">
      Got it — that helps frame the scope.
    </div>
  </div>
</div>`;

export const CHAT_BUBBLE_CSS = chatBubbleCss;

export const CHAT_BUBBLE_REACT = `// ChatView.tsx message row structure
<div className={\`group flex gap-4 max-w-3xl chat-message-entry \${isMitra ? 'mr-auto' : 'ml-auto flex-row-reverse'}\`}>
  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">...</div>
  <div className="max-w-[85%] relative flex flex-col items-start">
    <div className={isMitra ? 'text-slate-800' : 'px-5 py-3 rounded-[20px] rounded-tr-[4px] bg-emerald-50 border border-emerald-200/60 text-slate-900'}>
      {msg.text}
    </div>
  </div>
</div>`;
