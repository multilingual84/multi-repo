// Server-only: transcribe one spoken sentence and translate it for the other phone.
// Audio and text are processed in memory and never stored.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id";
import { automaticConversationPrompt, parseAutomaticTranslation } from '@/lib/automatic-conversation';

const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export async function transcribe(apiKey: string, audio: Blob, mime: string): Promise<string> {
  const form = new FormData();
  const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm";
  form.append("model", "openai/gpt-transcribe");
  form.append("file", new File([audio], `speech.${ext}`, { type: mime }));
  form.append("response_format", "json");
  form.append("stream", "true");
  const res = await fetch(`${GATEWAY}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "X-Lovable-AIG-SDK": "fetch" },
    body: form,
  });
  if (!res.ok || !res.body) throw new Error(`Speech service error [${res.status}]: ${await res.text()}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", deltas = "", done = "";
  for (;;) {
    const { value, done: end } = await reader.read();
    if (end) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const ev = JSON.parse(data) as { type?: string; delta?: string; text?: string };
        if (ev.type === "transcript.text.delta" && ev.delta) deltas += ev.delta;
        if (ev.type === "transcript.text.done" && ev.text) done = ev.text;
      } catch { /* ignore partial line */ }
    }
  }
  return (done || deltas).trim();
}

export async function translate(apiKey: string, text: string, target: string, other?: string, automatic = false): Promise<string> {
  const runId = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runId.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions: automatic ? automaticConversationPrompt(target, other) : other
      ? `You are a live two-way interpreter between language "${target}" and language "${other}". If the speaker used "${target}", translate into "${other}"; otherwise translate into "${target}". Reply exactly as "<code>|<translation>" where <code> is the language code you translated INTO, natural spoken style, nothing else.`
      : `You are a live phone interpreter. Translate the speaker's words into the language with code "${target}". Output only the translation, natural and spoken-style, nothing else. If it is already in that language, return it unchanged.`,
    messages: [{ role: "user", content: text }],
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  return (await result.text).trim();
}

export async function interpretSpeech(input: { audio: string; mime: string; target: string; translate: boolean; other?: string | undefined; automatic?: boolean }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Speech service is not configured.");
  const bytes = Uint8Array.from(atob(input.audio), c => c.charCodeAt(0));
  const heard = await transcribe(apiKey, new Blob([bytes], { type: input.mime }), input.mime);
  if (!heard) return { heard: "", text: "" };
  if (input.automatic) {
    const raw = await translate(apiKey, heard, input.target, input.other, true);
    return { heard, ...parseAutomaticTranslation(raw) };
  }
  if (input.other) {
    const raw = await translate(apiKey, heard, input.target, input.other);
    const i = raw.indexOf('|');
    const lang = i > 0 && i < 13 ? raw.slice(0, i).trim() : input.other;
    return { heard, text: i > 0 && i < 13 ? raw.slice(i + 1).trim() : raw, lang };
  }
  const text = input.translate ? await translate(apiKey, heard, input.target) : heard;
  return { heard, text };
}
