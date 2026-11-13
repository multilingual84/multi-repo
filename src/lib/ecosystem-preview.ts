import type { UILocale } from '@/lib/ui-copy';

export const tellerDirections: Record<UILocale, string> = {
  en: '👉 Show this screen to the teller to begin talking',
  es: '👉 Muestre esta pantalla al cajero para comenzar a hablar',
  tl: '👉 Ipakita ang screen na ito sa teller para magsimula',
  zh: '👉 请向柜员出示此屏幕，开始交谈',
  de: '👉 Zeigen Sie dem Schalterpersonal diesen Bildschirm, um zu sprechen',
  ja: '👉 この画面を窓口の担当者に見せて会話を始めてください',
};

export const tapTabCopy: Record<UILocale, string> = {
  en: 'TAP HERE TO START TALKING',
  es: 'TOCA AQUÍ PARA EMPEZAR A HABLAR',
  tl: 'I-TAP DITO PARA MAGSIMULANG MAG-USAP',
  zh: '点按此处开始交谈',
  de: 'HIER ANTIPPEN UND SPRECHEN',
  ja: 'ここをタップして話しましょう',
};

export function browserTellerLocale(language: string): UILocale | null {
  const base = language.toLowerCase().split('-')[0];
  if (base === 'fil') return 'tl';
  return base && base in tellerDirections ? base as UILocale : null;
}

export const broadcastHeading: Record<UILocale, string> = {
  en: 'SPEAK IN PUBLIC IN ANY LANGUAGE',
  es: 'HABLA EN PÚBLICO EN CUALQUIER IDIOMA',
  tl: 'MAGSALITA SA PUBLIKO SA ANUMANG WIKA',
  zh: '用任何语言当众发言',
  de: 'SPRECHEN SIE ÖFFENTLICH IN JEDER SPRACHE',
  ja: 'どんな言語でも人前で話せます',
};

export const broadcastStatusCopy: Record<UILocale, { transmitting: string; offAir: string; activeListeners: string; openBroadcast: string }> = {
  en: { transmitting: '📡 TRANSMITTING', offAir: '🔒 OFF AIR', activeListeners: 'Active Listeners: 0', openBroadcast: '🌐 Open Public Setting Broadcast' },
  es: { transmitting: '📡 TRANSMITIENDO', offAir: '🔒 FUERA DEL AIRE', activeListeners: 'Oyentes activos: 0', openBroadcast: '🌐 Abrir transmisión pública' },
  tl: { transmitting: '📡 NAGBIBROADCAST', offAir: '🔒 WALA SA ERE', activeListeners: 'Aktibong tagapakinig: 0', openBroadcast: '🌐 Buksan ang pampublikong broadcast' },
  zh: { transmitting: '📡 正在广播', offAir: '🔒 未开播', activeListeners: '当前听众：0', openBroadcast: '🌐 打开公共广播' },
  de: { transmitting: '📡 SENDUNG LÄUFT', offAir: '🔒 NICHT AUF SENDUNG', activeListeners: 'Aktive Zuhörer: 0', openBroadcast: '🌐 Öffentliche Sendung öffnen' },
  ja: { transmitting: '📡 放送中', offAir: '🔒 オフエア', activeListeners: 'アクティブなリスナー: 0', openBroadcast: '🌐 公開ブロードキャストを開く' },
};

export const logExpiryCopy: Record<UILocale, { expired: string; unlock: string }> = {
  en: { expired: '⏳ 7-Day Pass Expired', unlock: '⚠️ Unlock Past Log ($0.99 Warning)' },
  es: { expired: '⏳ Pase de 7 días vencido', unlock: '⚠️ Desbloquear registro anterior (aviso de $0.99)' },
  tl: { expired: '⏳ Nag-expire ang 7-Day Pass', unlock: '⚠️ I-unlock ang lumang tala (babala: $0.99)' },
  zh: { expired: '⏳ 7天通行证已过期', unlock: '⚠️ 解锁历史记录（$0.99 提醒）' },
  de: { expired: '⏳ 7-Tage-Pass abgelaufen', unlock: '⚠️ Altes Protokoll freischalten (Hinweis: 0,99 $)' },
  ja: { expired: '⏳ 7日間パスの有効期限切れ', unlock: '⚠️ 過去の記録をアンロック（$0.99 の注意）' },
};

export const ecosystemCopy: Record<UILocale, { notice: string; broadcastNotice: string; unlockNotice: string }> = {
  en: { notice: 'Conversation preview only · Live translation is not connected.', broadcastNotice: 'Broadcast preview only · No audio is sent and no listeners are connected.', unlockNotice: 'Sample log only · Unlocking and payment are not connected. No charge was made.' },
  es: { notice: 'Solo vista previa · La traducción en vivo no está conectada.', broadcastNotice: 'Solo vista previa · No se envía audio ni hay oyentes conectados.', unlockNotice: 'Registro de ejemplo · El desbloqueo y el pago no están conectados. No se realizó ningún cargo.' },
  tl: { notice: 'Preview lamang · Hindi nakakonekta ang live na pagsasalin.', broadcastNotice: 'Preview lamang · Walang ipinapadalang audio o nakakonektang tagapakinig.', unlockNotice: 'Halimbawang tala lamang · Hindi nakakonekta ang pag-unlock at pagbabayad. Walang siningil.' },
  zh: { notice: '仅为对话预览 · 尚未连接实时翻译。', broadcastNotice: '仅为广播预览 · 不发送音频，未连接听众。', unlockNotice: '仅为示例记录 · 解锁和付款尚未连接，未收取费用。' },
  de: { notice: 'Nur Gesprächsvorschau · Live-Übersetzung ist nicht verbunden.', broadcastNotice: 'Nur Vorschau · Kein Audio wird gesendet, keine Zuhörer sind verbunden.', unlockNotice: 'Nur Beispielprotokoll · Freischaltung und Zahlung sind nicht verbunden. Es wurde nichts berechnet.' },
  ja: { notice: '会話プレビューのみ · リアルタイム翻訳は未接続です。', broadcastNotice: '放送プレビューのみ · 音声は送信されず、リスナーは接続されていません。', unlockNotice: 'サンプル記録のみ · ロック解除と決済は未接続です。請求はありません。' },
};

export function isSampleLogOlderThanSevenDays(timestamp: string, now = new Date()): boolean {
  const created = Date.parse(timestamp);
  return Number.isFinite(created) && now.getTime() - created > 7 * 24 * 60 * 60 * 1000;
}

// The ledger is fictional; dated entries use a fixed sample year, not real activity.
export const sampleLedgerDates: Record<string, string> = {
  '2': '2025-10-19T09:14:00Z',
  '3': '2025-10-18T11:05:00Z',
};