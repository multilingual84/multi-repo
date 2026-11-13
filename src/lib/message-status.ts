export function deliveryStage(value:{received_at:string|null;replied_at:string|null}) {
 return value.replied_at?'replied':value.received_at?'received':'delivered';
}
const copy={
 en:{title:'Delivery & replies',delivered:'Delivered to inbox',received:'Received on device',replied:'Recipient responded',notice:'Content-free status expires after 24 hours. “Received” means the inbox loaded, not that the message was read.',sandbox:'Sandbox · No purchase'},
 es:{title:'Entrega y respuestas',delivered:'Entregado al buzón',received:'Recibido en el dispositivo',replied:'El destinatario respondió',notice:'El estado sin contenido caduca en 24 horas. «Recibido» significa que se cargó el buzón, no que se leyó el mensaje.',sandbox:'Prueba · Sin compra'},
 zh:{title:'送达与回复',delivered:'已送达信箱',received:'设备已接收',replied:'收件人已回复',notice:'不含内容的状态24小时后过期。“已接收”表示信箱已加载，并不表示消息已读。',sandbox:'测试 · 无购买'},
 de:{title:'Zustellung und Antworten',delivered:'Im Postfach zugestellt',received:'Auf Gerät empfangen',replied:'Empfänger hat geantwortet',notice:'Inhaltsfreier Status läuft nach 24 Stunden ab. „Empfangen“ bedeutet geladenes Postfach, nicht gelesen.',sandbox:'Test · Kein Kauf'},
 tl:{title:'Paghahatid at mga sagot',delivered:'Naihatid sa inbox',received:'Natanggap sa device',replied:'Sumagot ang tatanggap',notice:'Walang laman ang status at mawawala pagkalipas ng 24 oras. Ang natanggap ay na-load ang inbox, hindi nabasa ang mensahe.',sandbox:'Pagsubok · Walang pagbili'},
 ja:{title:'配信と返信',delivered:'受信箱に配信済み',received:'端末で受信済み',replied:'相手が返信しました',notice:'本文を含まない状態は24時間で期限切れです。「受信」は受信箱の読み込みを示し、既読ではありません。',sandbox:'テスト · 購入なし'},
};
export function messageStatusCopy(locale:string){return copy[locale.replace(/^gt:/,'').split('-')[0] as keyof typeof copy]??copy.en;}