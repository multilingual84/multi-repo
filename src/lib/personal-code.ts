// Browser-safe personal free-for-life code.
//
// Every visitor gets one code of their own the moment the translator opens — no
// sign-up. The code is a random address kept only in this phone's own storage;
// the site holds nothing about it, which is why the card tells the visitor to
// keep or print a copy. A PIN can be put on the code: the PIN is checked by the
// backend, so the code can be carried to another phone and claimed there by the
// person who knows it. Someone who merely scans the code still talks instantly.

const CODE_KEY = 'ml-personal-code';
const WALLET_KEY = 'ml-device-wallet-v1';

/** Codes that belong to a person carry this marker in the address. */
export const PERSONAL_CODE_PREFIX = '#my-code-';

// Whose code this phone was opened from. Kept for the visit because opening a
// code clears the address as soon as the call screen is closed.
const OPENED_KEY = 'ml-personal-code-opened';


export type PersonalCodeCopy = {
  heading: string; codeLine: string; notice: string;
  print: string; copy: string; copied: string; share: string; exit: string;
  pinHeading: string; pinHint: string; pinButton: string; nickname: string; pin: string;
  protectedLine: string; useElsewhere: string;
  claimHeading: string; claimHint: string; claimButton: string; wrong: string;
};

function newCode(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // UUID-shaped fallback so the address is accepted wherever a code is checked.
  const hex = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  return `${hex()}${hex()}-${hex()}-4${hex().slice(1)}-a${hex().slice(1)}-${hex()}${hex()}${hex()}`;
}

/**
 * This visitor's own lifetime code. Once a PIN is put on it the code becomes the
 * wallet's own identifier, so one code and one PIN serve the whole account.
 */
export function getPersonalCode(): string {
  if (typeof window === 'undefined') return '';
  try {
    const credential=window.localStorage.getItem('ml-private-qr-access-v2');
    if(credential){const id=JSON.parse(credential)?.id;if(typeof id==='string')return id;}
    const envelope = window.localStorage.getItem(WALLET_KEY);
    if (envelope) {
      const id = (JSON.parse(envelope) as { id?: string }).id;
      if (id) { window.localStorage.setItem(CODE_KEY, id); return id; }
    }
    let code = window.localStorage.getItem(CODE_KEY);
    if (!code) { code = newCode(); window.localStorage.setItem(CODE_KEY, code); }
    return code;
  } catch {
    return '';
  }
}

/** A same-origin address that opens this person's own room when scanned. */
export function personalCodeLink(origin: string, code: string): string {
  if (!code) return '';
  return `${origin.replace(/\/$/, '')}/${PERSONAL_CODE_PREFIX}${code}`;
}

/** The code a just-opened address points at, or '' when it points at none. */
export function personalCodeIdFromHash(hash: string): string {
  const h = hash || '';
  return h.toLowerCase().startsWith(PERSONAL_CODE_PREFIX) ? h.slice(PERSONAL_CODE_PREFIX.length) : '';
}

/** Notes the code this phone was opened from, while the address is still there. */
export function rememberOpenedPersonalCode(hash: string): string {
  const id = personalCodeIdFromHash(hash);
  if (!id) return '';
  try { window.sessionStorage.setItem(OPENED_KEY, id); } catch { /* storage unavailable */ }
  return id;
}

/** The code this phone was opened from, even after the address was cleared. */
export function openedPersonalCode(): string {
  if (typeof window === 'undefined') return '';
  try {
    const now = personalCodeIdFromHash(window.location.hash);
    if (now) { window.sessionStorage.setItem(OPENED_KEY, now); return now; }
    return window.sessionStorage.getItem(OPENED_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Stops asking once the code has been claimed on this phone. */
export function clearOpenedPersonalCode() {
  try { window.sessionStorage.removeItem(OPENED_KEY); } catch { /* storage unavailable */ }
}


export const personalCodeCopy: Record<string, PersonalCodeCopy> = {
  en: { heading: 'Your own free-for-life code', codeLine: 'Scan this to reach me instantly, in any language.', notice: 'Keep this code or print it. We keep no user information, so if this phone is cleared or lost, only your saved copy can bring your code back.', print: 'Print my code', copy: 'Copy my link', copied: 'Link copied', share: 'Share', exit: 'Exit',
    pinHeading: 'Put a PIN on my code', pinHint: 'Your code keeps working everywhere. On a new phone it asks for this PIN before it becomes yours again.', pinButton: 'Lock my code with a PIN', nickname: 'Nickname', pin: '4-digit PIN',
    protectedLine: 'PIN-protected', useElsewhere: 'Open your code on another phone and enter your PIN there to use it as yours.',
    claimHeading: 'Is this your code?', claimHint: 'Enter your PIN to use this code on this phone. Someone who only scans it can still talk to you without a PIN.', claimButton: 'Use my code here', wrong: 'That PIN did not match. Try again.' },
  es: { heading: 'Tu código gratis de por vida', codeLine: 'Escanea esto para hablar conmigo al instante, en cualquier idioma.', notice: 'Guarda este código o imprímelo. No guardamos información del usuario, así que si este teléfono se borra o se pierde, solo tu copia guardada podrá recuperar tu código.', print: 'Imprimir mi código', copy: 'Copiar mi enlace', copied: 'Enlace copiado', share: 'Compartir', exit: 'Salir',
    pinHeading: 'Pon un PIN a mi código', pinHint: 'Tu código sigue funcionando en todas partes. En un teléfono nuevo pide este PIN antes de volver a ser tuyo.', pinButton: 'Bloquear mi código con un PIN', nickname: 'Apodo', pin: 'PIN de 4 dígitos',
    protectedLine: 'Protegido con PIN', useElsewhere: 'Abre tu código en otro teléfono y escribe allí tu PIN para usarlo como tuyo.',
    claimHeading: '¿Es este tu código?', claimHint: 'Escribe tu PIN para usar este código en este teléfono. Quien solo lo escanea puede seguir hablando contigo sin PIN.', claimButton: 'Usar mi código aquí', wrong: 'Ese PIN no coincide. Inténtalo de nuevo.' },
  de: { heading: 'Ihr lebenslanger Gratis-Code', codeLine: 'Scannen Sie diesen Code, um mich sofort in jeder Sprache zu erreichen.', notice: 'Bewahren Sie diesen Code auf oder drucken Sie ihn aus. Wir speichern keine Nutzerdaten – wenn dieses Telefon gelöscht oder verloren geht, kann nur Ihre gespeicherte Kopie Ihren Code zurückbringen.', print: 'Meinen Code drucken', copy: 'Link kopieren', copied: 'Link kopiert', share: 'Teilen', exit: 'Beenden',
    pinHeading: 'Meinen Code mit einer PIN sichern', pinHint: 'Ihr Code funktioniert überall. Auf einem neuen Telefon wird zuerst diese PIN gefragt, bevor der Code wieder Ihnen gehört.', pinButton: 'Code mit PIN sperren', nickname: 'Spitzname', pin: '4-stellige PIN',
    protectedLine: 'Mit PIN geschützt', useElsewhere: 'Öffnen Sie Ihren Code auf einem anderen Telefon und geben Sie dort Ihre PIN ein, um ihn als Ihren zu nutzen.',
    claimHeading: 'Ist das Ihr Code?', claimHint: 'Geben Sie Ihre PIN ein, um diesen Code auf diesem Telefon zu nutzen. Wer ihn nur scannt, spricht weiterhin ohne PIN mit Ihnen.', claimButton: 'Meinen Code hier nutzen', wrong: 'Diese PIN passt nicht. Bitte erneut versuchen.' },
  tl: { heading: 'Ang iyong sariling libreng code habambuhay', codeLine: 'I-scan ito para agad makipag-usap sa akin, sa anumang wika.', notice: 'Itago o i-print ang code na ito. Hindi kami nag-iimbak ng impormasyon ng user, kaya kung mabura o mawala ang telefonong ito, ang iyong naitagong kopya lamang ang makapagbabalik ng iyong code.', print: 'I-print ang aking code', copy: 'Kopyahin ang aking link', copied: 'Nakopya ang link', share: 'Ibahagi', exit: 'Lumabas',
    pinHeading: 'Maglagay ng PIN sa aking code', pinHint: 'Patuloy na gumagana ang code mo sa kahit saan. Sa bagong telepono, hinihiling muna ang PIN na ito bago ito maging sa iyo muli.', pinButton: 'I-lock ang code gamit ang PIN', nickname: 'Palayaw', pin: '4-numerong PIN',
    protectedLine: 'Protektado ng PIN', useElsewhere: 'Buksan ang code mo sa ibang telepono at ilagay doon ang PIN mo para gamitin ito bilang sa iyo.',
    claimHeading: 'Ito ba ang code mo?', claimHint: 'Ilagay ang PIN mo para gamitin ang code na ito sa telefonong ito. Ang basta nag-scan nito ay kayang kausapin ka nang walang PIN.', claimButton: 'Gamitin ang code ko rito', wrong: 'Hindi tumugma ang PIN na iyan. Subukang muli.' },
  zh: { heading: '您专属的终身免费代码', codeLine: '扫描此码，即可用任何语言立即与我通话。', notice: '请保存或打印此代码。我们不保留任何用户信息，因此如果这台手机被清除或丢失，只有您留存的副本才能找回您的代码。', print: '打印我的代码', copy: '复制我的链接', copied: '链接已复制', share: '分享', exit: '退出',
    pinHeading: '为我的代码设置密码', pinHint: '您的代码到处都能用。在新手机上，它会先询问这个密码，才重新归您使用。', pinButton: '用密码锁定我的代码', nickname: '昵称', pin: '4位密码',
    protectedLine: '已用密码保护', useElsewhere: '在另一台手机上打开您的代码，在那里输入密码即可作为您自己的代码使用。',
    claimHeading: '这是您的代码吗？', claimHint: '输入密码即可在此手机上使用此代码。只是扫描它的人无需密码也能与您通话。', claimButton: '在此使用我的代码', wrong: '密码不符，请重试。' },
  ja: { heading: 'あなただけの永久無料コード', codeLine: 'これを読み取ると、どの言語でもすぐに私と話せます。', notice: 'このコードを保存するか印刷してください。当サイトはユーザー情報を保持していないため、この端末が消去されるか紛失した場合、コードを戻せるのはお手元のコピーだけです。', print: 'マイコードを印刷', copy: 'リンクをコピー', copied: 'リンクをコピーしました', share: '共有', exit: '終了',
    pinHeading: 'マイコードにPINを設定', pinHint: 'コードはどの場所でも使えます。新しいスマホでは、あなたのものになる前にこのPINをたずねます。', pinButton: 'PINでマイコードをロック', nickname: 'ニックネーム', pin: '4桁のPIN',
    protectedLine: 'PINで保護中', useElsewhere: '別のスマホでコードを開き、そこでPINを入力すると、自分のコードとして使えます。',
    claimHeading: 'あなたのコードですか？', claimHint: 'このスマホで使うにはPINを入力してください。読み取るだけで話す人はPINなしでかまいません。', claimButton: 'ここでマイコードを使う', wrong: 'PINが一致しません。もう一度お試しください。' },
};
