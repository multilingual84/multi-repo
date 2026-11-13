import type { UILocale } from '../ui-copy';

// Draft-only outreach composer. No sending, tracking or storage; the user copies
// and delivers each draft themselves.
export type ReachoutSector = 'general' | 'retail' | 'airport' | 'taxi';

export type ReachoutCopy = {
  title: string;
  intro: string;
  notice: string;
  sectorLabel: string;
  sectors: Record<ReachoutSector, string>;
  languageLabel: string;
  codeLabel: string;
  codeHint: string;
  generate: string;
  generating: string;
  draftTitle: string;
  subject: string;
  to: string;
  cc: string;
  copyDraft: string;
  copied: string;
  error: string;
};

export const reachoutCopy: Record<UILocale, ReachoutCopy> = {
  en: {
    title: 'Reachout email drafts',
    intro: 'Pick the audience and the language, then copy the draft into your own email and send it yourself.',
    notice: 'Drafts only: nothing is sent, tracked or saved here. You deliver every draft yourself.',
    sectorLabel: 'Audience',
    sectors: { general: 'Organization (general)', retail: 'Retail counter', airport: 'Airport & transit', taxi: 'Driver / taxi' },
    languageLabel: 'Draft language',
    codeLabel: 'Your reference code',
    codeHint: 'The code from your QR or share link; it appears in the subject line and inside the draft.',
    generate: 'Prepare the draft',
    generating: 'Preparing…',
    draftTitle: 'Draft ready to copy',
    subject: 'Subject',
    to: 'To',
    cc: 'CC',
    copyDraft: 'Copy full draft',
    copied: 'Draft copied.',
    error: 'Could not prepare the draft. Check the reference code (letters, numbers or hyphens).',
  },
  es: {
    title: 'Borradores de correos de alcance',
    intro: 'Elija el público y el idioma, luego copie el borrador en su propio correo y envíelo usted mismo.',
    notice: 'Solo borradores: aquí no se envía, rastrea ni guarda nada. Usted entrega cada borrador personalmente.',
    sectorLabel: 'Público',
    sectors: { general: 'Organización (general)', retail: 'Mostrador de retail', airport: 'Aeropuerto y tránsito', taxi: 'Conductor / taxi' },
    languageLabel: 'Idioma del borrador',
    codeLabel: 'Su código de referencia',
    codeHint: 'El código de su QR o enlace de compartir; aparece en el asunto y dentro del borrador.',
    generate: 'Preparar el borrador',
    generating: 'Preparando…',
    draftTitle: 'Borrador listo para copiar',
    subject: 'Asunto',
    to: 'Para',
    cc: 'CC',
    copyDraft: 'Copiar el borrador completo',
    copied: 'Borrador copiado.',
    error: 'No se pudo preparar el borrador. Revise el código de referencia (letras, números o guiones).',
  },
  tl: {
    title: 'Mga draft ng outreach email',
    intro: 'Piliin ang audience at wika, pagkatapos kopyahin ang draft sa sarili mong email at ikaw mismo ang magpadala.',
    notice: 'Draft lamang: walang ipinapadala, tinatrack o sine-save dito. Ikaw ang maghahatid ng bawat draft.',
    sectorLabel: 'Audience',
    sectors: { general: 'Samahan (pangkalahatan)', retail: 'Tindahan / counter', airport: 'Paliparan at transit', taxi: 'Driver / taxi' },
    languageLabel: 'Wika ng draft',
    codeLabel: 'Ang reference code mo',
    codeHint: 'Ang code mula sa QR o share link mo; lalabas ito sa subject line at loob ng draft.',
    generate: 'Ihanda ang draft',
    generating: 'Ihinahanda…',
    draftTitle: 'Handa nang kopyahin ang draft',
    subject: 'Subject',
    to: 'Para sa',
    cc: 'CC',
    copyDraft: 'Kopyahin ang buong draft',
    copied: 'Nakopya ang draft.',
    error: 'Hindi maihanda ang draft. Suriin ang reference code (mga titik, numero o gitling).',
  },
  zh: {
    title: '外联邮件草稿',
    intro: '选择受众和语言，然后把草稿复制到您自己的邮箱中自行发送。',
    notice: '仅限草稿：此处不发送、不追踪、不保存任何内容。每封草稿都由您自己发送。',
    sectorLabel: '受众',
    sectors: { general: '组织（通用）', retail: '零售柜台', airport: '机场与交通', taxi: '司机／出租车' },
    languageLabel: '草稿语言',
    codeLabel: '您的参考代码',
    codeHint: '来自您的二维码或分享链接的代码；会出现在主题行和草稿正文中。',
    generate: '生成草稿',
    generating: '正在生成…',
    draftTitle: '草稿已就绪，可复制',
    subject: '主题',
    to: '收件人',
    cc: '抄送',
    copyDraft: '复制完整草稿',
    copied: '草稿已复制。',
    error: '无法生成草稿。请检查参考代码（字母、数字或连字符）。',
  },
  de: {
    title: 'Ansprache-E-Mail-Entwürfe',
    intro: 'Wählen Sie Zielgruppe und Sprache, kopieren Sie den Entwurf in Ihr eigenes Postfach und senden Sie ihn selbst.',
    notice: 'Nur Entwürfe: Hier wird nichts gesendet, nachverfolgt oder gespeichert. Jeden Entwurf versenden Sie selbst.',
    sectorLabel: 'Zielgruppe',
    sectors: { general: 'Organisation (allgemein)', retail: 'Verkaufstresen', airport: 'Flughafen & Transit', taxi: 'Fahrer / Taxi' },
    languageLabel: 'Entwurfssprache',
    codeLabel: 'Ihr Referenzcode',
    codeHint: 'Der Code aus Ihrem QR-Code oder Teilen-Link; er erscheint in der Betreffzeile und im Entwurf.',
    generate: 'Entwurf erstellen',
    generating: 'Wird erstellt…',
    draftTitle: 'Entwurf bereit zum Kopieren',
    subject: 'Betreff',
    to: 'An',
    cc: 'CC',
    copyDraft: 'Gesamten Entwurf kopieren',
    copied: 'Entwurf kopiert.',
    error: 'Entwurf konnte nicht erstellt werden. Prüfen Sie den Referenzcode (Buchstaben, Zahlen oder Bindestriche).',
  },
  ja: {
    title: 'アウトリーチメールの下書き',
    intro: '対象と言語を選び、下書きをご自身のメールにコピーしてご自身で送信してください。',
    notice: '下書きのみ：ここで送信・追跡・保存されるものはありません。各下書きはご自身で送ります。',
    sectorLabel: '対象',
    sectors: { general: '組織（一般）', retail: '小売カウンター', airport: '空港・交通機関', taxi: 'ドライバー／タクシー' },
    languageLabel: '下書きの言語',
    codeLabel: 'あなたの参照コード',
    codeHint: 'QRコードやシェアリンクのコード。件名と下書き本文に表示されます。',
    generate: '下書きを作成',
    generating: '作成中…',
    draftTitle: '下書きをコピーできます',
    subject: '件名',
    to: '宛先',
    cc: 'CC',
    copyDraft: '下書き全体をコピー',
    copied: '下書きをコピーしました。',
    error: '下書きを作成できませんでした。参照コード（英数字またはハイフン）を確認してください。',
  },
};

export const reachoutLocaleNames: Record<UILocale, string> = {
  en: 'English', es: 'Español', tl: 'Tagalog', zh: '中文', de: 'Deutsch', ja: '日本語',
};

export function reachoutText(locale: string): ReachoutCopy {
  return reachoutCopy[locale.replace(/^gt:/, '').split('-')[0] as UILocale] ?? reachoutCopy.en;
}
