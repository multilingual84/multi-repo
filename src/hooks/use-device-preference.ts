import { useEffect, useState } from 'react';
import { readDevicePreference, saveDevicePreference } from '@/lib/device-preferences';

export function useDevicePreference<T extends string | boolean>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const restore = () => setValue(readDevicePreference(key, fallback));
    const update = (event: Event) => {
      const detail = (event as CustomEvent<{ key: string; value: T }>).detail;
      if (detail?.key === key) setValue(detail.value);
    };
    restore();
    window.addEventListener('storage', restore);
    window.addEventListener('ml-device-preference', update);
    return () => {
      window.removeEventListener('storage', restore);
      window.removeEventListener('ml-device-preference', update);
    };
  }, [key, fallback]);
  return [value, (next: T) => { setValue(next); saveDevicePreference(key, next); }] as const;
}