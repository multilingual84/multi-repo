// Browser-safe matching for the flag search box: turn whatever the visitor
// types into the flags it could mean, without needing a data file.

export type SearchableFlag = { country: string; label: string; lang: string; locale?: string };

/** English (and common alternate) names for each language code in the flag list. */
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'english',
  es: 'spanish castellano',
  zh: 'chinese mandarin',
  'zh-CN': 'chinese simplified mandarin zhongwen',
  'zh-TW': 'chinese traditional mandarin',
  de: 'german deutsch',
  tl: 'tagalog filipino pilipino',
  ja: 'japanese nihongo',
  fr: 'french francais',
  it: 'italian italiano',
  pt: 'portuguese portugues',
  ru: 'russian',
  uk: 'ukrainian',
  pl: 'polish',
  nl: 'dutch',
  sv: 'swedish',
  no: 'norwegian',
  da: 'danish',
  fi: 'finnish',
  is: 'icelandic',
  ga: 'irish gaelic',
  gd: 'scottish gaelic gaidhlig',
  cy: 'welsh cymraeg',
  el: 'greek',
  tr: 'turkish',
  cs: 'czech',
  sk: 'slovak',
  sl: 'slovenian',
  hu: 'hungarian',
  ro: 'romanian',
  bg: 'bulgarian',
  sr: 'serbian',
  hr: 'croatian',
  bs: 'bosnian',
  mk: 'macedonian',
  sq: 'albanian',
  lt: 'lithuanian',
  lv: 'latvian',
  et: 'estonian',
  be: 'belarusian',
  lb: 'luxembourgish',
  mt: 'maltese',
  ca: 'catalan valencian',
  eu: 'basque euskara',
  gl: 'galician galego',
  ka: 'georgian',
  hy: 'armenian hayeren',
  az: 'azerbaijani azeri',
  ar: 'arabic',
  iw: 'hebrew',
  fa: 'persian farsi',
  ps: 'pashto',
  ur: 'urdu',
  hi: 'hindi',
  bn: 'bengali bangla',
  pa: 'punjabi panjabi gurmukhi shahmukhi',
  ta: 'tamil',
  te: 'telugu',
  mr: 'marathi',
  gu: 'gujarati',
  kn: 'kannada',
  ml: 'malayalam',
  or: 'odia oriya',
  as: 'assamese',
  bho: 'bhojpuri',
  mai: 'maithili',
  sd: 'sindhi',
  jw: 'javanese jawa',
  su: 'sundanese',
  ceb: 'cebuano bisaya',
  ilo: 'ilocano ilokano',
  hil: 'hiligaynon ilonggo',
  om: 'oromo',
  ti: 'tigrinya',
  xh: 'xhosa',
  ln: 'lingala',
  wo: 'wolof',
  ku: 'kurdish kurmanji',
  ckb: 'kurdish sorani',
  yue: 'cantonese',
  jam: 'jamaican patois',
  si: 'sinhala sinhalese',
  ne: 'nepali',
  my: 'burmese myanmar',
  th: 'thai',
  lo: 'lao',
  km: 'khmer cambodian',
  vi: 'vietnamese',
  id: 'indonesian',
  ms: 'malay',
  tg: 'tajik',
  tk: 'turkmen',
  uz: 'uzbek',
  kk: 'kazakh',
  ky: 'kyrgyz',
  mn: 'mongolian',
  ko: 'korean',
  sw: 'swahili kiswahili',
  am: 'amharic',
  rw: 'kinyarwanda',
  mg: 'malagasy',
  ak: 'twi',
  ha: 'hausa',
  ig: 'igbo',
  yo: 'yoruba yoruba language',
  sn: 'shona',
  so: 'somali',
  zu: 'zulu',
  ht: 'haitian creole kreyol',
  qu: 'quechua',
  gn: 'guarani',
  mi: 'maori te reo',
  sm: 'samoan gagana',
};

/** Lowercase and drop accent marks so "Français" matches "francais". */
function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function flagMatches(flag: SearchableFlag, query: string) {
  const needle = fold(query);
  if (!needle) return true;
  const base = flag.lang.split('-')[0] ?? flag.lang;
  const names = `${LANGUAGE_NAMES[flag.lang] ?? ''} ${LANGUAGE_NAMES[base] ?? ''}`;
  return (
    fold(flag.label).includes(needle) ||
    flag.country.toLowerCase().includes(needle) ||
    flag.lang.toLowerCase().includes(needle) ||
    fold(names).includes(needle)
  );
}

/** Flags a visitor could be looking for, in the order they already appear. */
export function filterFlags(flags: SearchableFlag[], query: string) {
  const needle = query.trim();
  if (!needle) return flags;
  return flags.filter((flag) => flagMatches(flag, needle));
}
