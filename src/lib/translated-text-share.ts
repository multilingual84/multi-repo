// No recipient or automatic delivery: the owner chooses where to send the text.
export async function shareTranslatedText(text: string): Promise<'shared' | 'copied' | 'cancelled'> {
  const value = text.trim();
  if (!value) return 'cancelled';
  if (navigator.share) {
    try { await navigator.share({ text: value }); return 'shared'; }
    catch (error) { if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError') return 'cancelled'; }
  }
  await navigator.clipboard.writeText(value);
  return 'copied';
}