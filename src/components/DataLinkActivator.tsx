import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dataLinkCopy } from '@/lib/data-link-copy';
import { createLiveVoiceLink, parseDataRecipients, type DataLinkOption } from '@/lib/data-link';

export default function DataLinkActivator({ locale }: { locale: keyof typeof dataLinkCopy }) {
  const [option, setOption] = useState<DataLinkOption>('carrier');
  const [input, setInput] = useState('');
  const [links, setLinks] = useState<{ recipient: string; url: string }[]>([]);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = dataLinkCopy[locale];
  const recipients = parseDataRecipients(input);
  const options: DataLinkOption[] = ['carrier', 'outbound', 'virtual'];
  const index = options.indexOf(option);

  function activate() {
    if (!links.length) {
      setLinks(recipients.map(recipient => ({ recipient, url: createLiveVoiceLink(window.location.origin) })));
      setCopyState('idle');
      return;
    }
    void copyAll();
  }

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(links.map(l => `${l.recipient}\n${l.url}`).join('\n\n'));
      setCopyState('copied');
    } catch { setCopyState('failed'); }
  }

  async function copyOne(url: string) {
    try { await navigator.clipboard.writeText(url); setCopyState('copied'); }
    catch { setCopyState('failed'); }
  }

  return (
    <div className="mt-8 min-w-0 rounded-2xl border border-border bg-background p-6" data-data-link>
      <h3 className="text-lg font-black break-words">{copy.heading}</h3>
      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-card p-1 sm:flex-row">
        {options.map((id, i) => (
          <Button key={id} variant="ghost" aria-pressed={option === id} onClick={() => { setOption(id); setLinks([]); setCopyState('idle'); }} className={`h-auto min-w-0 flex-1 whitespace-normal break-words rounded-lg py-2 text-xs font-bold uppercase transition ${option === id ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{copy.tabs[i]}</Button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-black break-words">{copy.titles[index]}</p>
        <p className="mt-1 text-sm text-muted-foreground break-words">{copy.body}</p>
        <p className="mt-1 text-xs text-muted-foreground break-words">{copy.notice}</p>
      </div>
      <textarea value={input} onChange={e => { setInput(e.target.value); setLinks([]); setCopyState('idle'); }} aria-label={copy.placeholder} placeholder={copy.placeholder} rows={4} className="mt-4 w-full resize-none rounded-2xl border border-border bg-background p-4 font-mono text-xs leading-relaxed placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
      <p className="mt-2 break-words text-xs font-bold text-accent" role="status">
        ● {copy.count}: {recipients.length}
        {links.length > 0 && <><br />{copyState === 'copied' ? copy.copied : copyState === 'failed' ? copy.copyFailed : copy.generated}</>}
      </p>
      {links.length > 0 && <ul className="mt-3 space-y-2" data-data-link-list>
        {links.map(l => <li key={l.url} className="rounded-xl border border-border bg-card p-3 text-left">
          <p className="break-all text-xs font-black">{l.recipient}</p>
          <p className="notranslate mt-1 break-all text-[11px]" translate="no">{l.url}</p>
          <Button variant="outline" className="mt-2 h-auto min-h-9 text-xs" onClick={() => void copyOne(l.url)}>{copy.copyOne}</Button>
        </li>)}
      </ul>}
      <Button disabled={!recipients.length} onClick={activate} className="mt-3 h-auto w-full whitespace-normal break-words rounded-xl bg-primary py-3 text-xs font-black uppercase tracking-widest text-primary-foreground transition hover:opacity-90">{links.length ? copy.copy : copy.generate}</Button>
    </div>
  );
}
