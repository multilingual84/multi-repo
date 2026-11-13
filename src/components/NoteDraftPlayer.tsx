import { useEffect, useState } from 'react';

/** Plays back a recorded voice-note draft inside the compose box before it is sent encrypted. */
export default function NoteDraftPlayer({ draft, label }: { draft: string; label: string }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    let made = '';
    try {
      const p = JSON.parse(draft) as { mime: string; audio: string };
      const bytes = Uint8Array.from(atob(p.audio), x => x.charCodeAt(0));
      made = URL.createObjectURL(new Blob([bytes], { type: p.mime }));
      setUrl(made);
    } catch { setUrl(''); }
    return () => { if (made) URL.revokeObjectURL(made); };
  }, [draft]);
  if (!url) return null;
  return <div data-voice-note-draft className="space-y-1 rounded-md border border-input bg-background p-2"><audio controls src={url} className="w-full" /><p className="text-xs font-bold">{label}</p></div>;
}
