// Free users: messaging, QR translator (incl. voice-to-text) free for life.
// Calls, video and 1-phone translation: 30 minutes per rolling 24 hours, then the $0.99 paywall.
export const FREE_DAILY_MINUTES = 30;
export const FREE_DAILY_SECONDS = FREE_DAILY_MINUTES * 60;
export const ALLOWANCE_WINDOW_HOURS = 24;
export const PAYWALL_USD = 0.99;
export const allowanceTopUpCopy: Record<string, string> = {
  en: 'Top up', es: 'Recargar', zh: '充值', de: 'Aufladen', tl: 'Magdagdag', ja: '追加する',
};
export type MeteredFeature = 'call' | 'video' | 'one-phone';
export function isFreeForLife(feature: string) { return feature === 'messaging' || feature === 'qr-translator' || feature === 'two-phone'; }
export function minutesLeft(usedMs: number, bonusMinutes=0) { return Math.max(0, FREE_DAILY_MINUTES + bonusMinutes - usedMs / 60000); }
export function hitsPaywall(paid: boolean, usedMs: number, bonusMinutes=0, passLive=false) { return !paid && !passLive && minutesLeft(usedMs,bonusMinutes) <= 0; }

// Rolling window: the 24h clock starts at first metered use and resets after it passes.
export type AllowanceUsage = { windowStart: number; usedMs: number };
export function currentUsage(saved: AllowanceUsage | null, now: number): AllowanceUsage {
  if (!saved || now - saved.windowStart >= ALLOWANCE_WINDOW_HOURS * 3600000) return { windowStart: now, usedMs: 0 };
  return saved;
}
export function resetsAt(u: AllowanceUsage) { return u.windowStart + ALLOWANCE_WINDOW_HOURS * 3600000; }
const KEY = 'ml-free-allowance';
export function addUsage(ms: number, now = Date.now()): AllowanceUsage {
  let saved: AllowanceUsage | null = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { /* storage optional */ }
  const u = currentUsage(saved, now); const next = { ...u, usedMs: u.usedMs + ms };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage optional */ }
  return next;
}

export const paywallCopy: {en:{title:string;body:string;resets:string};[language:string]:{title:string;body:string;resets:string}} = {
  en: { title: 'Your free 30 minutes are used up', body: 'You get 30 free minutes every day. Your allowance renews automatically 24 hours after you start, which keeps the platform lean so we can offer a free tier. Want more? Our unlimited plans are priced to be among the lowest on the market.', resets: 'Your free minutes reset at' },
  es: { title: 'Se agotaron tus 30 minutos gratis', body: 'Tienes 30 minutos gratis cada día. Se renuevan automáticamente 24 horas después de empezar, para mantener la plataforma ligera y ofrecer un nivel gratuito. ¿Quieres más? Nuestros planes ilimitados tienen precios de los más bajos del mercado.', resets: 'Tus minutos gratis se renuevan a las' },
  zh: { title: '您的30分钟免费时长已用完', body: '您每天有30分钟免费时长，开始使用24小时后自动续期，让平台保持精简并提供免费档。需要更多？我们的无限套餐价格属市场最低之列。', resets: '免费时长将重置于' },
  de: { title: 'Ihre 30 Gratisminuten sind aufgebraucht', body: 'Sie erhalten täglich 30 Gratisminuten. Sie erneuern sich automatisch 24 Stunden nach Beginn – so bleibt die Plattform schlank und wir können einen Gratistarif anbieten. Mehr gewünscht? Unsere unbegrenzten Tarife gehören zu den günstigsten am Markt.', resets: 'Ihre Gratisminuten werden erneuert um' },
  tl: { title: 'Naubos na ang iyong libreng 30 minuto', body: 'May 30 libreng minuto ka araw-araw. Awtomatikong nare-renew ito 24 oras pagkatapos mong magsimula para manatiling magaan ang platform at may libreng tier. Gusto mo pa? Ang aming unlimited plans ay kabilang sa pinakamura sa merkado.', resets: 'Babalik ang iyong libreng minuto sa' },
  ja: { title: '無料の30分を使い切りました', body: '毎日30分無料で使えます。開始から24時間後に自動で更新され、プラットフォームを軽く保ち無料プランを提供できます。もっと使いたい方へ、無制限プランは市場最安水準です。', resets: '無料時間のリセット時刻' },
};

// Shown on the one-phone translator so free users can see their remaining daily minutes.
export const allowanceCopy: Record<string, { left: string }> = {
  en: { left: 'Free minutes left today' },
  es: { left: 'Minutos gratis restantes hoy' },
  zh: { left: '今日剩余免费分钟' },
  de: { left: 'Heute verbleibende Gratisminuten' },
  tl: { left: 'Natitirang libreng minuto ngayong araw' },
  ja: { left: '本日の残り無料分数' },
};
