import type { UILocale } from '@/lib/ui-copy';

export type TalkPairCopy = {
  title: string;
  subtitle: string;
  local: string;
  tourist: string;
  pickLocal: string;
  pickTourist: string;
  modeOne: string;
  modeTwo: string;
  modeOneHint: string;
  modeTwoHint: string;
  yourTurn: string;
  theirTurn: string;
  holdMic: string;
  shareTitle: string;
  steps: string;
};

export const talkPairCopy: Record<UILocale, TalkPairCopy> = {
  en: {
    title: 'Two people, any language',
    subtitle: 'Each person picks any language from all flags (not locked to your country). Then talk — one phone or two.',
    local: 'Local / you',
    tourist: 'Visitor / them',
    pickLocal: 'Your language',
    pickTourist: 'Their language',
    modeOne: '1 phone',
    modeTwo: '2 phones',
    modeOneHint: 'Hand the phone back and forth. Hold the mic on your turn.',
    modeTwoHint: 'Share the QR. Each phone keeps its language and mic.',
    yourTurn: 'Your turn — hold mic and speak',
    theirTurn: 'Their turn — hand them the phone or hold mic for them',
    holdMic: 'Hold the big mic below, speak, release when done',
    shareTitle: 'Share QR so their phone joins',
    steps: '1) Flags  2) 1 or 2 phones  3) Allow mic  4) Talk',
  },
  es: {
    title: 'Dos personas, cualquier idioma',
    subtitle: 'Cada uno elige cualquier idioma en todas las banderas (sin bloqueo por país). Luego hablen — un teléfono o dos.',
    local: 'Local / tú',
    tourist: 'Visitante / ellos',
    pickLocal: 'Tu idioma',
    pickTourist: 'Su idioma',
    modeOne: '1 teléfono',
    modeTwo: '2 teléfonos',
    modeOneHint: 'Pasen el teléfono. Mantén el mic en tu turno.',
    modeTwoHint: 'Comparte el QR. Cada teléfono mantiene su idioma y mic.',
    yourTurn: 'Tu turno — mantén el mic y habla',
    theirTurn: 'Su turno — pásales el teléfono o mantén el mic',
    holdMic: 'Mantén el micrófono grande abajo, habla y suelta',
    shareTitle: 'Comparte el QR para que su teléfono se una',
    steps: '1) Banderas  2) 1 o 2 teléfonos  3) Micrófono  4) Hablar',
  },
  zh: {
    title: '两人，任意语言',
    subtitle: '双方从全部旗帜中任选语言（不按所在地区锁定）。然后对话 — 一部或两部手机。',
    local: '本地 / 你',
    tourist: '访客 / 对方',
    pickLocal: '你的语言',
    pickTourist: '对方的语言',
    modeOne: '1 部手机',
    modeTwo: '2 部手机',
    modeOneHint: '轮流使用手机。轮到你时按住麦克风。',
    modeTwoHint: '分享二维码。每部手机保持自己的语言和麦克风。',
    yourTurn: '轮到你 — 按住麦克风说话',
    theirTurn: '轮到对方 — 把手机给他们或代按麦克风',
    holdMic: '按住下方大麦克风说话，说完松开',
    shareTitle: '分享二维码让对方手机加入',
    steps: '1) 旗帜  2) 1 或 2 部手机  3) 允许麦克风  4) 对话',
  },
  de: {
    title: 'Zwei Personen, jede Sprache',
    subtitle: 'Jede Person wählt eine beliebige Sprache aus allen Flaggen (keine Ländersperre). Dann sprechen — ein oder zwei Telefone.',
    local: 'Lokal / Sie',
    tourist: 'Besucher / Gegenüber',
    pickLocal: 'Ihre Sprache',
    pickTourist: 'Deren Sprache',
    modeOne: '1 Telefon',
    modeTwo: '2 Telefone',
    modeOneHint: 'Telefon weitergeben. Mikrofon im eigenen Zug halten.',
    modeTwoHint: 'QR teilen. Jedes Telefon behält Sprache und Mikrofon.',
    yourTurn: 'Ihr Zug — Mikrofon halten und sprechen',
    theirTurn: 'Deren Zug — Telefon geben oder Mikrofon halten',
    holdMic: 'Großes Mikrofon unten halten, sprechen, loslassen',
    shareTitle: 'QR teilen, damit ihr Telefon beitritt',
    steps: '1) Flaggen  2) 1 oder 2 Telefone  3) Mikrofon  4) Sprechen',
  },
  tl: {
    title: 'Dalawang tao, anumang wika',
    subtitle: 'Pumili ang bawat isa ng anumang wika mula sa lahat ng bandila (hindi naka-lock sa bansa). Tapos mag-usap — isa o dalawang telepono.',
    local: 'Lokal / ikaw',
    tourist: 'Bisita / sila',
    pickLocal: 'Wika mo',
    pickTourist: 'Wika nila',
    modeOne: '1 telepono',
    modeTwo: '2 telepono',
    modeOneHint: 'Palitan ang telepono. Pindutin ang mic sa iyong turn.',
    modeTwoHint: 'Ibahagi ang QR. Bawat telepono may sariling wika at mic.',
    yourTurn: 'Ikaw — pindutin ang mic at magsalita',
    theirTurn: 'Sila — ibigay ang telepono o pindutin ang mic',
    holdMic: 'Pindutin ang malaking mic sa ibaba, magsalita, bitawan',
    shareTitle: 'Ibahagi ang QR para sumali ang telepono nila',
    steps: '1) Bandila  2) 1 o 2 telepono  3) Mic  4) Usap',
  },
  ja: {
    title: '2人・どの言語でも',
    subtitle: '各自がすべての旗から言語を選べます（地域ロックなし）。その後会話 — 1台または2台。',
    local: '現地 / あなた',
    tourist: '来客 / 相手',
    pickLocal: 'あなたの言語',
    pickTourist: '相手の言語',
    modeOne: '1台',
    modeTwo: '2台',
    modeOneHint: '交互に電話を渡す。自分の番はマイクを押す。',
    modeTwoHint: 'QRを共有。各端末が言語とマイクを保持。',
    yourTurn: 'あなたの番 — マイクを押して話す',
    theirTurn: '相手の番 — 電話を渡すかマイクを押す',
    holdMic: '下の大きなマイクを押して話し、離す',
    shareTitle: '相手の端末が参加できるようQRを共有',
    steps: '1) 旗  2) 1台か2台  3) マイク許可  4) 会話',
  },
};
