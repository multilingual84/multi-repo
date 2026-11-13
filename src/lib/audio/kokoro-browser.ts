type Engine = { generate: (text: string, options: { voice: string; speed: number }) => Promise<{ audio: Float32Array; sampling_rate: number }> };
// Serve the upstream browser bundle unchanged: tree-shaking its embedded eSpeak
// filesystem produces an empty language registry. Loaded only after a speech tap.
export async function loadKokoroBrowser(model: string): Promise<Engine> {
  const url = new URL('/vendor/kokoro.web.js', window.location.origin).href;
  const module = await import(/* @vite-ignore */ url) as { KokoroTTS: { from_pretrained: (id: string, options: { dtype: string; device: string }) => Promise<Engine> } };
  return module.KokoroTTS.from_pretrained(model, { dtype: 'q8', device: 'wasm' });
}