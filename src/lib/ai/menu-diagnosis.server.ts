// Server-only: Lovable AI Gateway call for the menu-layout diagnosis feature.
// Never import this module from client code; load it inside a server handler.
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./run-id";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are the layout diagnostics assistant for the Multi-Lingual™ website, a single-page app whose sticky top menu contains: a logo block, Overview / Pricing Matrix / 7-Day Free Pass / Share us buttons in one wrapping row, and a full-width yellow "Personal Translator" banner underneath. A visitor describes a menu layout problem on their device. Identify the single most likely cause and suggest one concrete fix the visitor can try (and, when relevant, one note for the site team). Rules: be concise (under 120 words), no jargon the visitor cannot act on, never invent features the site does not have, and if the description is too vague, say exactly what detail to add (device model, browser, portrait/landscape, screen width). Reply in the same language the visitor used.`;

export async function diagnoseMenuLayout(input: { description: string; device: string }): Promise<string> {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured on this site yet.");

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    instructions: INSTRUCTIONS,
    messages: [
      {
        role: "user",
        content: `Visitor device: ${input.device || "not provided"}\n\nMenu issue description:\n${input.description}`,
      },
    ],
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const text = (await result.text).trim();
  if (!text) throw new Error("The AI returned an empty diagnosis. Please try again.");
  return text;
}
