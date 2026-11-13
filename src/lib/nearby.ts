// Browser-safe helpers for "nearby phones": opted-in phones can see each other and tap
// to start a shared-link call. Same-Wi-Fi phones are found automatically on a network
// key; phones on different Wi-Fi or mobile data join the same list with a meet code.
export type NearbyPeer = { id: string; name: string; lang: string };
export type NearbyInvite = { to: string; from: string; name: string; lang: string; room: string };

export function nearbyChannelName(key: string): string {
  return `ml-nearby-${key.replace(/[^a-f0-9]/g, '').slice(0, 32)}`;
}

/** A meet code is 3-8 letters/digits the two people agree on; typing it on both phones
 *  puts them in the same list no matter which network each phone is on. */
export function normalizeMeetCode(raw: string): string {
  return String(raw ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function meetCodeChannel(code: string): string | null {
  const c = normalizeMeetCode(code);
  return c.length >= 3 ? `ml-nearby-code-${c}` : null;
}

/** Other opted-in phones from a presence snapshot, excluding this phone, one entry each. */
export function peersFromPresence(state: Record<string, Array<Partial<NearbyPeer>>>, selfId: string): NearbyPeer[] {
  return Object.entries(state)
    .filter(([id]) => id !== selfId)
    .map(([id, metas]) => ({ id, name: String(metas[0]?.name ?? '').slice(0, 24) || 'Phone', lang: String(metas[0]?.lang ?? 'en').slice(0, 12) }));
}

/** One entry per phone even when it is listed by several channels at once. */
export function mergePeers(lists: NearbyPeer[][]): NearbyPeer[] {
  const seen = new Map<string, NearbyPeer>();
  for (const list of lists) for (const p of list) if (!seen.has(p.id)) seen.set(p.id, p);
  return [...seen.values()];
}

/** Accept only well-formed invites addressed to this phone. */
export function validInvite(raw: unknown, selfId: string): NearbyInvite | null {
  const v = raw as Partial<NearbyInvite> | null;
  if (!v || v.to !== selfId || typeof v.from !== 'string' || typeof v.room !== 'string') return null;
  if (!/^meeting-[a-zA-Z0-9]{6,64}$/.test(v.room)) return null;
  return { to: v.to, from: v.from, name: String(v.name ?? 'Phone').slice(0, 24), lang: String(v.lang ?? 'en').slice(0, 12), room: v.room };
}

export const nearbyCopy: Record<string, { title: string; toggle: string; hint: string; none: string; name: string; code: string; codeHint: string; join: string; wants: string; accept: string; decline: string; calling: string; declined: string }> = {
  en: { title: '📡 Nearby phones', toggle: 'Let phones on this Wi-Fi find me', hint: 'Phones on the same Wi-Fi with this switched on appear here. Tap one to talk — they must accept.', none: 'No nearby phones yet.', name: 'Your name', code: 'Meet code', codeHint: 'Type the same code on both phones to find each other on any Wi-Fi or mobile data.', join: 'Join', wants: 'wants to talk', accept: 'Accept', decline: 'Decline', calling: 'Calling… waiting for them to accept.', declined: 'They declined.' },
  es: { title: '📡 Teléfonos cercanos', toggle: 'Permitir que teléfonos en este Wi-Fi me encuentren', hint: 'Aparecen los teléfonos en el mismo Wi-Fi con esto activado. Toca uno para hablar; debe aceptar.', none: 'Aún no hay teléfonos cercanos.', name: 'Tu nombre', code: 'Código de encuentro', codeHint: 'Escribe el mismo código en los dos teléfonos para encontrarse en cualquier Wi-Fi o datos móviles.', join: 'Unirse', wants: 'quiere hablar', accept: 'Aceptar', decline: 'Rechazar', calling: 'Llamando… esperando que acepte.', declined: 'Rechazó la llamada.' },
  zh: { title: '📡 附近的手机', toggle: '允许同一 Wi-Fi 的手机找到我', hint: '同一 Wi-Fi 且已开启此开关的手机会显示在这里。点按即可通话——对方需接受。', none: '暂无附近的手机。', name: '你的名字', code: '会面代码', codeHint: '在两台手机上输入相同的代码，即可在任何 Wi-Fi 或移动数据下互相找到。', join: '加入', wants: '想与你通话', accept: '接受', decline: '拒绝', calling: '正在呼叫……等待对方接受。', declined: '对方已拒绝。' },
  de: { title: '📡 Telefone in der Nähe', toggle: 'Telefone in diesem WLAN dürfen mich finden', hint: 'Telefone im selben WLAN mit aktiviertem Schalter erscheinen hier. Tippen zum Sprechen – die andere Person muss annehmen.', none: 'Noch keine Telefone in der Nähe.', name: 'Dein Name', code: 'Treffcode', codeHint: 'Gib auf beiden Telefonen denselben Code ein, um euch in jedem WLAN oder Mobilfunk zu finden.', join: 'Beitreten', wants: 'möchte sprechen', accept: 'Annehmen', decline: 'Ablehnen', calling: 'Rufe an… warte auf Annahme.', declined: 'Abgelehnt.' },
  tl: { title: '📡 Mga kalapit na telepono', toggle: 'Hayaang mahanap ako ng mga telepono sa Wi-Fi na ito', hint: 'Lalabas dito ang mga telepono sa parehong Wi-Fi na naka-on ito. I-tap ang isa para makipag-usap — kailangan nilang tanggapin.', none: 'Wala pang kalapit na telepono.', name: 'Pangalan mo', code: 'Code ng pagkikita', codeHint: 'I-type ang parehong code sa parehong telepono para makita ang isa’t isa sa anumang Wi-Fi o mobile data.', join: 'Sumali', wants: 'gustong makipag-usap', accept: 'Tanggapin', decline: 'Tanggihan', calling: 'Tumatawag… hinihintay na tanggapin.', declined: 'Tinanggihan nila.' },
  ja: { title: '📡 近くのスマホ', toggle: '同じWi-Fiのスマホに見つけてもらう', hint: '同じWi-Fiでこのスイッチをオンにしたスマホがここに表示されます。タップして通話（相手の承諾が必要）。', none: '近くのスマホはまだありません。', name: 'あなたの名前', code: '出会うコード', codeHint: '両方のスマホに同じコードを入力すると、どのWi-Fiやモバイル回線でも互いが見つかります。', join: '参加', wants: 'が話したいそうです', accept: '承諾', decline: '拒否', calling: '発信中…相手の承諾を待っています。', declined: '拒否されました。' },
};
