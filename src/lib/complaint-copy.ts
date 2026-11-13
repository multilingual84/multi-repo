import type { UILocale } from './ui-copy';

export type ComplaintCopy = {
  footer: string;
  title: string;
  intro: string;
  contactLabel: string;
  contactPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submit: string;
  submitting: string;
  sentTitle: string;
  yourReference: string;
  sentNotice: string;
  checkTitle: string;
  checkLabel: string;
  checkButton: string;
  pending: string;
  approved: string;
  declined: string;
  notFound: string;
  error: string;
};

export const complaintCopy: Record<UILocale, ComplaintCopy> = {
  en: {
    footer: 'File a complaint',
    title: 'File a complaint',
    intro: 'Tell us what went wrong so we can try to fix it first. Only after the owner reviews the cause and gives final approval may a last-resort 60-day waiver of future service charges be offered. Nothing happens automatically.',
    contactLabel: 'How we can reach you',
    contactPlaceholder: 'Email or phone',
    messageLabel: 'What went wrong?',
    messagePlaceholder: 'Describe the problem…',
    submit: 'Send complaint',
    submitting: 'Sending…',
    sentTitle: 'Complaint received',
    yourReference: 'Your reference code',
    sentNotice: 'Keep this code to check your complaint. We try to fix the issue first; only the owner can finally approve a last-resort 60-day waiver.',
    checkTitle: 'Check your complaint',
    checkLabel: 'Reference code',
    checkButton: 'Check status',
    pending: 'Under review — an admin has not approved this complaint yet.',
    approved: 'Approved',
    declined: 'Declined',
    notFound: 'No complaint found for that code.',
    error: 'Could not send your complaint. Please try again.',
  },
  es: {
    footer: 'Presentar una queja',
    title: 'Presentar una queja',
    intro: 'Cuéntenos qué salió mal para intentar solucionarlo primero. Solo el propietario, tras revisar la causa, puede aprobar como último recurso 60 días sin cargos futuros de servicio. Nada es automático.',
    contactLabel: 'Cómo podemos contactarlo',
    contactPlaceholder: 'Correo o teléfono',
    messageLabel: '¿Qué salió mal?',
    messagePlaceholder: 'Describa el problema…',
    submit: 'Enviar queja',
    submitting: 'Enviando…',
    sentTitle: 'Queja recibida',
    yourReference: 'Su código de referencia',
    sentNotice: 'Guarde este código para consultar su queja. Primero intentamos solucionar el problema; solo el propietario puede aprobar 60 días sin cargos como último recurso.',
    checkTitle: 'Consulte su queja',
    checkLabel: 'Código de referencia',
    checkButton: 'Consultar estado',
    pending: 'En revisión — un administrador aún no aprueba esta queja.',
    approved: 'Aprobada',
    declined: 'Rechazada',
    notFound: 'No se encontró ninguna queja con ese código.',
    error: 'No pudimos enviar su queja. Inténtelo de nuevo.',
  },
  zh: {
    footer: '提交投诉',
    title: '提交投诉',
    intro: '请说明问题，让我们先尝试修复。只有所有者审查原因并最终批准后，才可作为最后手段免除未来60天的服务费用。不会自动执行。',
    contactLabel: '联系方式',
    contactPlaceholder: '邮箱或电话',
    messageLabel: '出了什么问题？',
    messagePlaceholder: '请描述问题…',
    submit: '发送投诉',
    submitting: '发送中…',
    sentTitle: '已收到投诉',
    yourReference: '您的参考码',
    sentNotice: '请保存此参考码以查询投诉。我们先尝试修复；只有所有者可最终批准作为最后手段的60天费用减免。',
    checkTitle: '查询您的投诉',
    checkLabel: '参考码',
    checkButton: '查询状态',
    pending: '审查中——管理员尚未批准此投诉。',
    approved: '已批准',
    declined: '已拒绝',
    notFound: '未找到该参考码对应的投诉。',
    error: '无法发送您的投诉，请重试。',
  },
  de: {
    footer: 'Beschwerde einreichen',
    title: 'Beschwerde einreichen',
    intro: 'Beschreiben Sie das Problem, damit wir zuerst eine Lösung versuchen. Erst nach Ursachenprüfung und endgültiger Zustimmung des Inhabers können als letzter Ausweg künftige Servicegebühren für 60 Tage entfallen. Nichts geschieht automatisch.',
    contactLabel: 'So erreichen wir Sie',
    contactPlaceholder: 'E-Mail oder Telefon',
    messageLabel: 'Was ist schiefgelaufen?',
    messagePlaceholder: 'Beschreiben Sie das Problem…',
    submit: 'Beschwerde senden',
    submitting: 'Wird gesendet…',
    sentTitle: 'Beschwerde eingegangen',
    yourReference: 'Ihr Referenzcode',
    sentNotice: 'Bewahren Sie den Code zur Statusprüfung auf. Zuerst versuchen wir eine Lösung; nur der Inhaber kann als letzten Ausweg 60 Tage Gebührenbefreiung genehmigen.',
    checkTitle: 'Beschwerde prüfen',
    checkLabel: 'Referenzcode',
    checkButton: 'Status prüfen',
    pending: 'In Prüfung – ein Administrator hat diese Beschwerde noch nicht genehmigt.',
    approved: 'Genehmigt',
    declined: 'Abgelehnt',
    notFound: 'Keine Beschwerde zu diesem Code gefunden.',
    error: 'Ihre Beschwerde konnte nicht gesendet werden. Bitte erneut versuchen.',
  },
  tl: {
    footer: 'Magsumite ng reklamo',
    title: 'Magsumite ng reklamo',
    intro: 'Sabihin ang problema para subukan muna naming ayusin. Pagkatapos suriin ang sanhi, ang may-ari lamang ang maaaring magbigay ng pinal na pahintulot sa 60 araw na walang singil sa serbisyo bilang huling paraan. Walang awtomatiko.',
    contactLabel: 'Paano kami makakausap sa iyo',
    contactPlaceholder: 'Email o telepono',
    messageLabel: 'Ano ang mali?',
    messagePlaceholder: 'Ilarawan ang problema…',
    submit: 'Ipadala ang reklamo',
    submitting: 'Ipinadala…',
    sentTitle: 'Natanggap ang reklamo',
    yourReference: 'Ang iyong reference code',
    sentNotice: 'Itago ang code para tingnan ang reklamo. Aayusin muna namin; ang may-ari lamang ang maaaring pumayag sa 60 araw na walang singil bilang huling paraan.',
    checkTitle: 'Suriin ang iyong reklamo',
    checkLabel: 'Reference code',
    checkButton: 'Suriin ang status',
    pending: 'Sinusuri pa — hindi pa pinapayagan ng admin ang reklamong ito.',
    approved: 'Pinapayagan',
    declined: 'Tinanggihan',
    notFound: 'Walang reklamong nakita para sa kodeng iyon.',
    error: 'Hindi maipadala ang iyong reklamo. Pakisubukang muli.',
  },
  ja: {
    footer: '苦情を申し立てる',
    title: '苦情を申し立てる',
    intro: '問題をお知らせください。まず修復を試みます。原因を確認した所有者の最終承認後にのみ、最後の手段として今後60日間のサービス料金を免除できます。自動ではありません。',
    contactLabel: '連絡先',
    contactPlaceholder: 'メールまたは電話',
    messageLabel: '何が問題でしたか？',
    messagePlaceholder: '問題を説明してください…',
    submit: '苦情を送信',
    submitting: '送信中…',
    sentTitle: '苦情を受け付けました',
    yourReference: '参照コード',
    sentNotice: '状況確認用にコードを保管してください。まず修復を試み、最後の手段として60日間の料金免除を最終承認できるのは所有者だけです。',
    checkTitle: '苦情を確認する',
    checkLabel: '参照コード',
    checkButton: '状況を確認',
    pending: '審査中 — 管理者はまだこの苦情を承認していません。',
    approved: '承認済み',
    declined: '却下',
    notFound: 'そのコードの苦情は見つかりませんでした。',
    error: '苦情を送信できませんでした。もう一度お試しください。',
  },
};
