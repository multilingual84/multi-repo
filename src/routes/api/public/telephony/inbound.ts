import { createFileRoute } from '@tanstack/react-router';

// Telnyx TexML voice URL for the public virtual line. Returns only a fixed
// greeting and hangs up; it reads no caller data and stores nothing.
export const CLARA_GREETING =
  'Hello, and thank you for calling Multi-Lingual. This is Clara. For live translation, please visit multi-lingual dot tech on your phone and tap the microphone. Goodbye.';

export function greetingTexml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="alice" language="en-US">${CLARA_GREETING}</Say>\n  <Hangup/>\n</Response>`;
}

const reply = () => new Response(null, { status:410, headers: { 'Cache-Control': 'no-store' } });

export const Route = createFileRoute('/api/public/telephony/inbound')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async () => reply(), GET: async () => reply() } },
});
