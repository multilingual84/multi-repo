import { useEffect, useRef } from 'react';
import { LocalMicrophone } from '@/lib/local-microphone';

export function useLocalMicrophone(active: boolean, onError?: () => void, audio: boolean | MediaTrackConstraints = true) {
  const capture = useRef<LocalMicrophone | null>(null);
  const errorCallback = useRef(onError);
  errorCallback.current = onError;
  useEffect(() => {
    const microphone = new LocalMicrophone();
    capture.current = microphone;
    const stop = () => microphone.stop();
    window.addEventListener('pagehide', stop);
    return () => { stop(); capture.current = null; window.removeEventListener('pagehide', stop); };
  }, []);
  useEffect(() => {
    const microphone = capture.current;
    if (!microphone) return;
    let alive = true;
    if (active) void microphone.start(audio).catch(() => { if (alive) errorCallback.current?.(); });
    else microphone.stop();
    return () => { alive = false; microphone.stop(); };
  }, [active]);
}