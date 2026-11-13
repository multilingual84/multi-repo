// Device-local preferences are advisory, never permission or paid-access authority.
export function readDevicePreference<T extends string | boolean>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    if (typeof fallback === 'boolean') {
      if (raw === '1' || raw === 'true') return true as T;
      if (raw === '0' || raw === 'false') return false as T;
      return fallback;
    }
    return raw as T;
  } catch { return fallback; }
}
export function saveDevicePreference(key: string, value: string | boolean) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, typeof value === 'boolean' ? (value ? '1' : '0') : value); } catch { /* session still works */ }
  window.dispatchEvent(new CustomEvent('ml-device-preference', { detail: { key, value } }));
}
export function readAudioRoute(): 'speaker' | 'headset' {
  return readDevicePreference<string>('ml-audio-route', 'speaker') === 'headset' ? 'headset' : 'speaker';
}