import { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { flagTypingCopy, flagVoiceCopy } from '@/lib/flag-voice-copy';
import type { FlagSearchLocale } from '@/lib/flag-search-copy';
import { useLocalMicrophone } from '@/hooks/use-local-microphone';
import MicrophonePermissionNotice from '@/components/MicrophonePermissionNotice';

export default function FlagLanguageMic({ locale }: { locale: FlagSearchLocale }) {
  const [noticeVisible, setNoticeVisible] = useState(false);
  const [permission,setPermission]=useState(false);
  const [typing, setTyping] = useState(false);
  useLocalMicrophone(noticeVisible);
  const copy = flagVoiceCopy[locale];
  useEffect(() => {
    if (!noticeVisible) return;
    const timeout = window.setTimeout(() => setTyping(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [noticeVisible]);

  return (
    <div className="mt-2" data-flag-language-mic>
      <Button
        variant="outline"
        aria-expanded={noticeVisible}
        aria-pressed={noticeVisible}
        aria-controls="flag-talking-preview"
        className="flag-mic-ambient h-auto min-h-11 w-full touch-manipulation gap-2 whitespace-normal px-3 py-2 text-sm font-semibold"
        onClick={() => { if(noticeVisible){setNoticeVisible(false);setTyping(false);}else setPermission(true); }}
      >
        <Mic className="h-5 w-5 shrink-0 text-mic-ambient" aria-hidden="true" />
        <span>{copy.label}</span>
      </Button>
      {permission&&<MicrophonePermissionNotice locale={locale} onContinue={()=>{setPermission(false);setTyping(true);setNoticeVisible(true);}} onCancel={()=>setPermission(false)}/>}
      {noticeVisible && <div id="flag-talking-preview" className="mt-2">
        <div data-talking-bar aria-hidden="true" className="h-2 w-full rounded-sm bg-voice-ready" />
        <div data-clara-text-replies className="mt-2 text-center">
          <p className="text-sm font-semibold text-foreground">{copy.replyTitle}</p>
          <p role="status" className={`mt-1 text-xs text-muted-foreground ${typing ? 'motion-safe:animate-pulse' : ''}`}>{typing ? flagTypingCopy[locale] : copy.notice}</p>
        </div>
      </div>}
    </div>
  );
}