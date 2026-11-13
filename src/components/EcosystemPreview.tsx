import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { UILocale } from '@/lib/ui-copy';
import { newRoomId } from '@/lib/call-room';
import PhoneQrPairing from '@/components/PhoneQrPairing';
import PublicBroadcast from './PublicBroadcast';
import { broadcastHeading, broadcastStatusCopy, browserTellerLocale, ecosystemCopy, isSampleLogOlderThanSevenDays, logExpiryCopy, tapTabCopy, tellerDirections } from '@/lib/ecosystem-preview';

export function TellerAnnouncement({ locale,onOpen,active=false }: { locale: UILocale;onOpen?:()=>void;active?:boolean }) {
  const [browserLocale, setBrowserLocale] = useState<UILocale | null>(null);
  const [callActive, setCallActive] = useState(false);
  useEffect(() => { setBrowserLocale(browserTellerLocale(navigator.language)); }, []);
  // The tab lights up for as long as the call screen is open, whatever opened it.
  useEffect(() => {
    const onState = (event: Event) => setCallActive((event as CustomEvent<string>).detail !== 'closed');
    window.addEventListener('ml-call-state', onState);
    if (document.querySelector('[data-answer-call]')) setCallActive(true);
    return () => window.removeEventListener('ml-call-state', onState);
  }, []);
  const directionLocale = locale !== 'en' ? locale : browserLocale;
  const label = tapTabCopy[directionLocale ?? 'en'];
  const ariaLabel = label + ' — start now';
  const openCall = () => {
    if(onOpen){onOpen();return;}
    const room = `meeting-${newRoomId()}`;
    // This device started the call, so it gets the outgoing screen, not "Incoming call".
    try { window.localStorage.setItem('ml-call-caller', room); } catch { /* private mode */ }
    window.location.hash = room;
    window.dispatchEvent(new Event('ml-open-call'));
  };
  return <section data-teller-announcement className="ecosystem-console flex items-center gap-1 px-1 py-0">
    <Button type="button" onClick={openCall} aria-label={ariaLabel} aria-pressed={callActive||active}
      className={`tap-glow mx-auto flex w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-0 rounded-md px-3 py-0.5 text-center text-ink ${callActive||active ? 'bg-voice-ready shadow-lg shadow-voice-ready/60 motion-safe:animate-pulse' : 'bg-signal'}`}>
      <p lang={directionLocale ?? 'en'} className="text-[13px] font-bold uppercase leading-[1.1]">{label}</p>
    </Button>
    <PhoneQrPairing locale={locale} />
  </section>;
}

export function PublicBroadcastPreview({ locale }: { locale: UILocale }) {
  return <PublicBroadcast locale={locale} />;
}

export function SampleLogExpiryPreview({ timestamp, locale = 'en' }: { timestamp: string; locale?: UILocale }) {
  const [expired, setExpired] = useState(false);
  const [opened, setOpened] = useState(false);
  useEffect(() => { setExpired(isSampleLogOlderThanSevenDays(timestamp)); }, [timestamp]);
  if (!expired) return null;
  const copy = logExpiryCopy[locale];
  return <div className="col-span-2 min-w-0 border-t border-border pt-3 sm:col-span-3 lg:col-span-5" data-log-expiry-preview>
    <p className="text-xs font-semibold text-signal"><span aria-hidden className="ecosystem-blink mr-2 inline-block size-2 rounded-full bg-signal" />{copy.expired}</p>
    <Button variant="outline" onClick={() => setOpened(value => !value)} aria-expanded={opened} className="mt-2 h-auto max-w-full whitespace-normal border-signal/40 px-3 py-2 text-xs text-signal">{copy.unlock}</Button>
    {opened && <p role="status" className="mt-2 text-xs leading-relaxed text-muted-foreground">{ecosystemCopy[locale].unlockNotice}</p>}
  </div>;
}
