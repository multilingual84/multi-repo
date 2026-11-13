import type { UILocale } from '@/lib/ui-copy';

type WalkieCopy = {
  title: string;
  network: string;
  none: string;
  add: string;
  pick: string;
  talk: string;
  stop: string;
  listen: string;
  stopListen: string;
  playing: string;
  sent: string;
  needContact: string;
  error: string;
  permission: string;
  notice: string;
};

const en: WalkieCopy = {
  title: 'Walkie-talkie',
  network: 'Private network',
  none: 'No one in your network yet. Send someone an encrypted message, or add their mailbox address below.',
  add: 'Add mailbox address',
  pick: 'Talk to',
  talk: 'Press to talk',
  stop: 'Stop',
  listen: 'Listen',
  stopListen: 'Stop listening',
  playing: 'Incoming',
  sent: 'Sent',
  needContact: 'Choose who to talk to first.',
  error: 'Could not send that. Try again.',
  permission: 'Allow microphone access for this recording only. The microphone stops when you press Stop.',
  notice: 'Talk to someone in your network; their phone plays it the moment it arrives. Nothing is stored on the site — speech stays encrypted until it reaches the other phone.',
};

const es: WalkieCopy = {
  title: 'Walkie-talkie',
  network: 'Red privada',
  none: 'Aún no hay nadie en tu red. Envía a alguien un mensaje cifrado o añade abajo su dirección de buzón.',
  add: 'Añadir dirección de buzón',
  pick: 'Hablar con',
  talk: 'Pulsa para hablar',
  stop: 'Detener',
  listen: 'Escuchar',
  stopListen: 'Dejar de escuchar',
  playing: 'Entrante',
  sent: 'Enviado',
  needContact: 'Elige primero con quién hablar.',
  error: 'No se pudo enviar. Inténtalo de nuevo.',
  permission: 'Permite el micrófono solo para esta grabación. El micrófono se apaga al pulsar Detener.',
  notice: 'Habla con alguien de tu red; su teléfono lo reproduce en cuanto llega. Nada se guarda en el sitio: el audio sigue cifrado hasta llegar al otro teléfono.',
};

const de: WalkieCopy = {
  title: 'Walkie-Talkie',
  network: 'Privates Netzwerk',
  none: 'Noch ist niemand in deinem Netzwerk. Sende jemandem eine verschlüsselte Nachricht oder füge unten die Postfachadresse hinzu.',
  add: 'Postfachadresse hinzufügen',
  pick: 'Sprechen mit',
  talk: 'Drücken zum Sprechen',
  stop: 'Stopp',
  listen: 'Zuhören',
  stopListen: 'Nicht mehr zuhören',
  playing: 'Eingang',
  sent: 'Gesendet',
  needContact: 'Wähle zuerst, mit wem du sprichst.',
  error: 'Das konnte nicht gesendet werden. Nochmal versuchen.',
  permission: 'Mikrofon nur für diese Aufnahme erlauben. Das Mikrofon stoppt, wenn du Stopp drückst.',
  notice: 'Sprich mit jemandem in deinem Netzwerk; sein Handy spielt es sofort ab, wenn es ankommt. Auf der Site wird nichts gespeichert – Sprache bleibt verschlüsselt, bis sie das andere Handy erreicht.',
};

const tl: WalkieCopy = {
  title: 'Walkie-talkie',
  network: 'Pribadong network',
  none: 'Wala pa nang tao sa iyong network. Magpadala ng naka-encrypt na mensahe, o idagdag sa ibaba ang mailbox address.',
  add: 'Idagdag ang mailbox address',
  pick: 'Kausapin',
  talk: 'Pindutin para magsalita',
  stop: 'Hinto',
  listen: 'Makinig',
  stopListen: 'Humingin',
  playing: 'Papasok',
  sent: 'Naipadala',
  needContact: 'Piliin muna kung kanino kayo magsasalita.',
  error: 'Hindi maipadala iyan. Subukang muli.',
  permission: 'Payagan ang mikropono para sa recording na ito lamang. Hihinto ang mikropono kapag pindutin ang Hinto.',
  notice: 'Kausapin ang isa sa iyong network; i-play ng kanilang telepono agad kapag dumating. Walang iniipon sa site — naka-encrypt ang tinig hanggang sa dumating sa kabilang telepono.',
};

const zh: WalkieCopy = {
  title: '对讲机',
  network: '私人网络',
  none: '你的网络中还没有人。先给对方发一条加密消息，或在下方添加对方的邮箱地址。',
  add: '添加邮箱地址',
  pick: '通话对象',
  talk: '按住说话',
  stop: '停止',
  listen: '收听',
  stopListen: '停止收听',
  playing: '来电',
  sent: '已发送',
  needContact: '请先选择要通话的人。',
  error: '无法发送，请重试。',
  permission: '仅对本次录音允许使用麦克风。按下停止后麦克风即关闭。',
  notice: '对你网络中的人说话；对方的手机一收到就会播放。网站不保存任何内容——语音在到达对方手机前始终保持加密。',
};

const ja: WalkieCopy = {
  title: 'トランシーバー',
  network: 'プライベートネットワーク',
  none: 'ネットワークにまだ誰もいません。暗号化メッセージを送るか、下にメールボックスアドレスを追加してください。',
  add: 'メールボックスアドレスを追加',
  pick: '話す相手',
  talk: '押しながら話す',
  stop: '停止',
  listen: '聞く',
  stopListen: '聞くのをやめる',
  playing: '着信',
  sent: '送信しました',
  needContact: 'まず誰と話すか選んでください。',
  error: '送信できませんでした。もう一度お試しください。',
  permission: 'この録音のみマイクを許可します。停止を押すとマイクは止まります。',
  notice: 'ネットワーク内の相手に話しかけると、相手のスマホは届いた瞬間に再生します。サイトには何も保存されません——音声は相手のスマホに届くまで暗号化されたままです。',
};

export const walkieCopy: Record<UILocale, WalkieCopy> = { en, es, de, tl, zh, ja };
