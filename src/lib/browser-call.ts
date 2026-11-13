// Explicitly opens the existing call screen; media still waits for Continue.
export function openBrowserCall(roomId: string, video: boolean, immediate = false) {
  if (!/^[a-zA-Z0-9_-]{6,64}$/.test(roomId)) throw new Error('Invalid room');
  const room = `meeting-${roomId}`;
  try { window.sessionStorage.setItem('ml-call-caller', room); } catch { /* storage unavailable */ }
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#${room}`);
  window.dispatchEvent(new CustomEvent('ml-open-call', { detail: { video, ...(immediate ? { immediate: true } : {}) } }));
}

// Called from a direct sound gesture. No microphone/camera or downloaded media.
export async function startRingtone(): Promise<() => void> {
  const context = new AudioContext();
  let stopped = false;
  const pulse = () => {
    if (stopped || context.state !== 'running') return;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, context.currentTime + 0.02);
    gain.gain.setValueAtTime(0.08, context.currentTime + 0.65);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.7);
    gain.connect(context.destination);
    for (const frequency of [440, 480]) {
      const tone = context.createOscillator();
      tone.frequency.value = frequency;
      tone.connect(gain); tone.start(); tone.stop(context.currentTime + 0.72);
      tone.onended = () => tone.disconnect();
    }
  };
  try { await context.resume(); }
  catch (error) { void context.close().catch(() => {}); throw error; }
  if (context.state !== 'running') { void context.close().catch(() => {}); throw new Error('Sound unavailable'); }
  pulse();
  const interval = window.setInterval(pulse, 2400);
  return () => { if (stopped) return; stopped = true; window.clearInterval(interval); void context.close().catch(() => {}); };
}