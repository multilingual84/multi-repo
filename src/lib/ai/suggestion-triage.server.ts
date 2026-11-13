// Server-only: AI triage of visitor suggestions for the owner's daily digest.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./run-id";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You review visitor feedback for the Multi-Lingual™ website (browser translation, video/audio meetings, Personal Translator, QR wallet). Write a plain-text digest for the site owner in English with three sections:
WORTH DOING — real bugs or improvements several people could benefit from. For each: one-line summary, why it matters, and a short change request the owner could paste to their site builder.
LIKELY USER ERROR — feedback that comes from misunderstanding how the site works. Do NOT recommend changing the site for these; at most suggest clearer wording.
UNCLEAR / IGNORE — spam, vague or off-topic notes.
Be skeptical: one confused visitor is not a reason to change the site. Merge duplicates and note how many people raised them. Never suggest adding tracking, removing existing features, or changing prices. Keep it under 500 words.`;

export async function triageSuggestions(items: { message: string; page: string | null; locale: string | null }[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const list = items.map((s, i) => `${i + 1}. [${s.locale ?? "?"} · ${s.page ?? "?"}] ${s.message}`).join("\n");
  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: [{ role: "user", content: `Visitor feedback from the last day:\n${list}` }],
    providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", include: ["reasoning.encrypted_content"] } },
  });
  const text = (await result.text).trim();
  if (!text) throw new Error("Empty digest.");
  return text;
}
