// Browser-safe audio output selection.
//
// A headset the phone has already paired shows up in the browser's own device
// list. The site can then send the audio *it* plays through that device. Nothing
// here scans for or pairs Bluetooth hardware — the phone's own settings do that,
// and the phone still decides where its built-in voice plays.

export type AudioOutput = { deviceId: string; label: string; bluetooth: boolean };

const SINK_KEY = 'ml-audio-sink';
const SINK_EVENT = 'ml-audio-sink';
const BLUETOOTH_WORDS = [
  'bluetooth', 'bt-', 'bt ', 'airpods', 'buds', 'earbud', 'earphone',
  'headphone', 'headset', 'jbl', 'sony', 'bose', 'beats', 'hearphone',
];

/** True when the browser's own device name reads like a wireless headset. */
export function isBluetoothLabel(label: string) {
  const l = (label || '').toLowerCase();
  return BLUETOOTH_WORDS.some(word => l.includes(word));
}

/** The outputs the browser can see. Empty when the browser offers no device list. */
export async function listAudioOutputs(): Promise<AudioOutput[]> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter(device => device.kind === 'audiooutput')
      .map(device => ({
        deviceId: device.deviceId,
        label: device.label || '',
        bluetooth: isBluetoothLabel(device.label || ''),
      }));
  } catch {
    return [];
  }
}

export function getPreferredSink(): string {
  try { return localStorage.getItem(SINK_KEY) ?? ''; } catch { return ''; }
}

/** Remember the visitor's output. An empty id means "the phone's own speaker". */
export function setPreferredSink(deviceId: string) {
  try {
    if (deviceId) localStorage.setItem(SINK_KEY, deviceId);
    else localStorage.removeItem(SINK_KEY);
  } catch { /* storage unavailable */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(SINK_EVENT));
}

/** Send one playing element through the chosen output when the browser allows it. */
export function applyPreferredSink(element: HTMLMediaElement) {
  const sink = getPreferredSink();
  const withSink = element as HTMLMediaElement & { setSinkId?: (id: string) => Promise<void> };
  if (!sink || typeof withSink.setSinkId !== 'function') return;
  try { void withSink.setSinkId(sink).catch(() => { /* browser refused the device */ }); }
  catch { /* browser refused the device */ }
}

export const audioOutputCopy: Record<string, {
  tab: string; heading: string; none: string; names: string; speaker: string; note: string; exit: string;
}> = {
  en: { tab: 'Bluetooth', heading: 'Audio devices', none: 'No headset found. Pair it in your phone settings, then tap again.', names: 'Tap the mic once so the site can see your device names.', speaker: 'Phone speaker', note: 'The site speaks through your choice. Your phone decides where its own voice plays.', exit: 'Exit' },
  es: { tab: 'Bluetooth', heading: 'Dispositivos de audio', none: 'No se encontró ningún auricular. Emparéjalo en los ajustes del teléfono y vuelve a tocar.', names: 'Toca el micrófono una vez para que el sitio vea los nombres de tus dispositivos.', speaker: 'Altavoz del teléfono', note: 'El sitio habla a través de tu elección. Tu teléfono decide dónde suena su propia voz.', exit: 'Salir' },
  de: { tab: 'Bluetooth', heading: 'Audiogeräte', none: 'Kein Headset gefunden. Koppeln Sie es in den Telefoneinstellungen und tippen Sie erneut.', names: 'Tippen Sie einmal auf das Mikrofon, damit die Site die Gerätenamen anzeigt.', speaker: 'Telefonlautsprecher', note: 'Die Site spricht über Ihre Auswahl. Ihr Telefon entscheidet, wo seine eigene Stimme klingt.', exit: 'Beenden' },
  tl: { tab: 'Bluetooth', heading: 'Mga audio device', none: 'Walang nahanap na headset. I-pair ito sa settings ng telepono, pagkatapos ay i-tap muli.', names: 'I-tap ang mic nang isang beses para makita ng site ang mga pangalan ng iyong device.', speaker: 'Speaker ng telepono', note: 'Nagsasalita ang site sa pamamagitan ng iyong pinili. Ang iyong telepono ang nagdedesisyon kung saan maglalaro ang sarili nitong boses.', exit: 'Lumabas' },
  zh: { tab: '蓝牙', heading: '音频设备', none: '未找到耳机。请在手机设置中配对，然后再点一次。', names: '请先点一次麦克风，网站才能看到您的设备名称。', speaker: '手机扬声器', note: '网站会通过您选择的设备发声。手机自带语音的播放位置由手机决定。', exit: '退出' },
  ja: { tab: 'Bluetooth', heading: '音声デバイス', none: 'ヘッドセットが見つかりません。スマホの設定でペアリングしてから、もう一度タップしてください。', names: 'マイクを一度タップすると、デバイスの名前が表示されます。', speaker: 'スマホのスピーカー', note: 'サイトは選択したデバイスで発声します。スマホ自身の音声の再生先はスマホが決めます。', exit: '終了' },
};
