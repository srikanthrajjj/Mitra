import { GoogleGenAI } from "@google/genai";

export const SERVICENOW_EXPERT_PROMPT = `You are Mitra, a Senior ServiceNow Enterprise Architect and certified platform expert.

Your expertise covers:
- ITSM, ITOM, ITAM, HRSD, CSM, GRC, SecOps, and custom scoped applications
- Table design (task-extended vs standalone), dictionary fields, ACLs, and data policies
- Client Scripts, UI Policies, Business Rules, Flow Designer, IntegrationHub, and REST APIs
- Update sets, CI/CD, instance strategy, performance, and governance best practices

You work inside the user's ServiceNow instance and guide real scoped-application builds.

**Length & depth (short-to-medium):**
- Write 4–8 sentences, or 2 compact paragraphs — enough to feel like a proper ServiceNow delivery, not a one-liner
- Explain what you understood, what you're creating (scoped app, tables extending \`task\`, forms, client scripts, business rules, ACLs, update sets), and why it fits the request
- Use correct ServiceNow terms: scoped app, dictionary, GlideRecord, assignment rules, UI policies, Flow Designer, update set
- End with one clear next step or one question when you still need input

**Format:**
- Plain, readable prose. A \`##\` title is fine for build milestones
- Use a Markdown table for field/schema lists; fenced code blocks for scripts
- Use \`-\` bullet lists or \`1.\` numbered lists when offering options the user can pick (these render as selectable pills in chat)
- Use bullets only for artifact summaries when listing what was built (table names, scripts)
- No label lines like "**Status** — value", no arrow prefixes

**Simulation disclaimer (required every reply):**
- End every response with this exact line on its own line: > Simulated preview — not connected to a live ServiceNow instance.

**Never:** essay-length walls of text, JSON/API meta-talk, or refusing ServiceNow scripts and GlideRecord`;

export function cleanApiKey(key?: string): string | undefined {
  if (!key) return undefined;
  const cleaned = key.replace(/^["']|["']$/g, "").trim();
  if (!cleaned || cleaned === "MY_GEMINI_API_KEY") return undefined;
  return cleaned;
}

export function resolveGeminiKey(headerKey?: string): string | undefined {
  return cleanApiKey(headerKey) || cleanApiKey(process.env.GEMINI_API_KEY);
}

export function resolveGroqKey(): string | undefined {
  return cleanApiKey(process.env.GROQ_API_KEY);
}

export function getLlmStatus() {
  return {
    gemini: Boolean(resolveGeminiKey()),
    groq: Boolean(resolveGroqKey()),
  };
}

function getGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { "User-Agent": "mitra-ai-architect" } },
  });
}

export function resolveGeminiModels(model?: string): string[] {
  const pro = ["gemini-2.5-pro", "gemini-2.0-flash"];
  const flash = ["gemini-2.5-flash", "gemini-2.0-flash"];
  if (model === "gemini-2.5-pro" || model === "gpt-4o" || model === "claude-3.5-sonnet") {
    return pro;
  }
  return flash;
}

export function buildGeminiContents(
  chatHistory: Array<{ sender: string; text: string }>,
  prompt: string
) {
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (const msg of chatHistory) {
    const text = msg.text?.trim();
    if (!text) continue;
    contents.push({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text }],
    });
  }

  contents.push({ role: "user", parts: [{ text: prompt }] });
  return contents;
}

export function formatPhaseContextBlock(phaseContext?: {
  currentPhase?: number;
  phaseLabel?: string;
  questionIndex?: number;
  userRole?: string;
  pendingGateCount?: number;
}): string {
  if (!phaseContext?.currentPhase) return "";
  return [
    "",
    "[7-phase project context]",
    `Phase: ${phaseContext.phaseLabel ?? phaseContext.currentPhase}`,
    `Discovery question index: ${phaseContext.questionIndex ?? 0}`,
    `Active persona: ${phaseContext.userRole ?? "architect"}`,
    `Open approval gates: ${phaseContext.pendingGateCount ?? 0}`,
    "Honor phase gates — do not skip ahead to deploy/build topics unless phase allows.",
  ].join("\n");
}

export function buildOpenAIMessages(
  chatHistory: Array<{ sender: string; text: string }>,
  prompt: string,
  systemInstruction: string,
  workspaceName?: string,
  phaseContext?: Parameters<typeof formatPhaseContextBlock>[0],
) {
  const system =
    systemInstruction +
    (workspaceName ? `\n\n[Active workspace: "${workspaceName}"]` : "") +
    formatPhaseContextBlock(phaseContext);

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: system },
  ];

  for (const msg of chatHistory) {
    const text = msg.text?.trim();
    if (!text) continue;
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: text,
    });
  }

  messages.push({ role: "user", content: prompt });
  return messages;
}

export async function* streamGeminiResponse(params: {
  apiKey: string;
  model?: string;
  chatHistory: Array<{ sender: string; text: string }>;
  prompt: string;
  workspaceName?: string;
  phaseContext?: Parameters<typeof formatPhaseContextBlock>[0];
}): AsyncGenerator<string> {
  const ai = getGeminiClient(params.apiKey);
  const models = resolveGeminiModels(params.model);
  const contents = buildGeminiContents(params.chatHistory, params.prompt);
  const systemInstruction =
    SERVICENOW_EXPERT_PROMPT +
    (params.workspaceName ? `\n\n[Active workspace: "${params.workspaceName}"]` : "") +
    formatPhaseContextBlock(params.phaseContext);

  let lastError: Error | null = null;

  for (const targetModel of models) {
    try {
      const stream = await ai.models.generateContentStream({
        model: targetModel,
        contents,
        config: { systemInstruction },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) yield text;
      }
      return;
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Gemini model ${targetModel} failed:`, lastError.message);
    }
  }

  throw lastError || new Error("All Gemini models failed.");
}

export async function* streamGroqResponse(params: {
  apiKey: string;
  chatHistory: Array<{ sender: string; text: string }>;
  prompt: string;
  workspaceName?: string;
  phaseContext?: Parameters<typeof formatPhaseContextBlock>[0];
}): AsyncGenerator<string> {
  const messages = buildOpenAIMessages(
    params.chatHistory,
    params.prompt,
    SERVICENOW_EXPERT_PROMPT,
    params.workspaceName,
    params.phaseContext,
  );

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      stream: true,
      temperature: 0.6,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`Groq API error ${response.status}: ${errText || response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Groq stream unavailable.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // ignore malformed chunks
      }
    }
  }
}

export async function* streamLlmResponse(params: {
  geminiKey?: string;
  groqKey?: string;
  model?: string;
  chatHistory: Array<{ sender: string; text: string }>;
  prompt: string;
  workspaceName?: string;
  phaseContext?: Parameters<typeof formatPhaseContextBlock>[0];
}): AsyncGenerator<{ text: string; provider: string }> {
  const geminiKey = params.geminiKey;
  const groqKey = params.groqKey;

  if (geminiKey) {
    try {
      for await (const text of streamGeminiResponse({
        apiKey: geminiKey,
        model: params.model,
        chatHistory: params.chatHistory,
        prompt: params.prompt,
        workspaceName: params.workspaceName,
        phaseContext: params.phaseContext,
      })) {
        yield { text, provider: "gemini" };
      }
      return;
    } catch (err: any) {
      console.warn("Gemini failed, trying Groq fallback:", err.message || err);
      if (!groqKey) throw err;
    }
  }

  if (groqKey) {
    for await (const text of streamGroqResponse({
      apiKey: groqKey,
      chatHistory: params.chatHistory,
      prompt: params.prompt,
      workspaceName: params.workspaceName,
      phaseContext: params.phaseContext,
    })) {
      yield { text, provider: "groq" };
    }
    return;
  }

  throw new Error(
    "No AI API key configured. Add GEMINI_API_KEY to .env (free at https://aistudio.google.com/apikey) or GROQ_API_KEY (free at https://console.groq.com)."
  );
}
