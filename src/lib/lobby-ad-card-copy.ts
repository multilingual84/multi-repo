// Native-locale copy for the lobby ad card's call-back history and gate
// overlay. Other flag languages fall back to the whole-page translation flow.
import type { UILocale } from '@/lib/ui-copy';

export const lobbyAdCardCopy: Record<UILocale, {
  historyTitle: string;
  historyNote: string;
  callBack: string;
  previewOnly: string;
  gateTitle: string;
  gateBody: string;
  close: string;
}> = {
  en: {
    historyTitle: 'Connection History',
    historyNote: 'Sample log · No live calls connected',
    callBack: '[ Call Back ]',
    previewOnly: 'Preview only — no return call is placed from this screen.',
    gateTitle: '⚠️ Return Call Gated.',
    gateBody: 'Your complimentary 1-week pass has expired for this connection link. To immediately initiate this return call and unlock infinite real-time translation routing to this specific number, activate your Single-Operation Pass for just $0.99/year. Please note: This pass is good for your line, and whoever you share your link with receives a free week to speak back with you. Alternatively, unlock unlimited multi-seat lines with our Solo Trader Pack for $0.99/month.',
    close: 'Close',
  },
  es: {
    historyTitle: 'Historial de conexiones',
    historyNote: 'Registro de muestra · Sin llamadas en vivo conectadas',
    callBack: '[ Devolver llamada ]',
    previewOnly: 'Solo vista previa: no se realiza ninguna llamada desde esta pantalla.',
    gateTitle: '⚠️ Llamada de retorno bloqueada.',
    gateBody: 'Su pase gratuito de 1 semana ha caducado para este enlace de conexión. Para iniciar de inmediato esta llamada de retorno y desbloquear el enrutamiento de traducción en tiempo real ilimitado hacia este número específico, active su Pase de Operación Individual por solo $0.99/año. Tenga en cuenta: este pase es válido para su línea, y quien reciba su enlace obtiene una semana gratis para hablar con usted. Como alternativa, desbloquee líneas ilimitadas con múltiples asientos con nuestro Paquete Solo Trader por $0.99/mes.',
    close: 'Cerrar',
  },
  tl: {
    historyTitle: 'Kasaysayan ng mga Koneksyon',
    historyNote: 'Sample na tala · Walang live na tawag na konektado',
    callBack: '[ Tatawag Muli ]',
    previewOnly: 'Preview lamang — walang tawag na ginagawa mula sa screen na ito.',
    gateTitle: '⚠️ Naka-gate ang Return Call.',
    gateBody: 'Nag-expire na ang iyong libreng 1-week pass para sa connection link na ito. Upang agad masimulan ang return call na ito at ma-unlock ang walang hanggang real-time na translation routing papunta sa partikular na numerong ito, i-activate ang iyong Single-Operation Pass sa halagang $0.99/taon lamang. Paalala: ang pass na ito ay para sa iyong linya, at sinumang makatanggap ng iyong link ay makakakuha ng libreng isang linggo upang makipag-usap pabalik sa iyo. Bilang alternatibo, i-unlock ang walang limitasyong multi-seat na mga linya sa aming Solo Trader Pack sa $0.99/buwan.',
    close: 'Isara',
  },
  zh: {
    historyTitle: '连接记录',
    historyNote: '示例日志 · 未连接实时通话',
    callBack: '[ 回拨 ]',
    previewOnly: '仅限预览 — 此屏幕不会发起回拨。',
    gateTitle: '⚠️ 回拨已被限制。',
    gateBody: '您此连接链接的免费 1 周通行证已过期。如需立即发起此回拨并解锁通往该特定号码的无限实时翻译路由，请激活您的单次操作通行证，每年仅需 $0.99。请注意：此通行证适用于您的线路，任何收到您链接的人都可免费获得一周时间与您通话。或者，选择我们的 Solo Trader 套餐，每月 $0.99，解锁无限多席位线路。',
    close: '关闭',
  },
  de: {
    historyTitle: 'Verbindungsverlauf',
    historyNote: 'Beispielprotokoll · Keine Live-Anrufe verbunden',
    callBack: '[ Zurückrufen ]',
    previewOnly: 'Nur Vorschau — von diesem Bildschirm wird kein Rückruf getätigt.',
    gateTitle: '⚠️ Rückruf gesperrt.',
    gateBody: 'Ihr kostenloser 1-Wochen-Pass ist für diesen Verbindungslink abgelaufen. Um diesen Rückruf sofort zu starten und das unbegrenzte Echtzeit-Übersetzungsrouting zu dieser Nummer freizuschalten, aktivieren Sie Ihren Single-Operation-Pass für nur $0.99/Jahr. Hinweis: Dieser Pass gilt für Ihre Leitung, und jeder, dem Sie Ihren Link teilen, erhält eine kostenlose Woche, um mit Ihnen zu sprechen. Alternativ schalten Sie unbegrenzte Multi-Seat-Leitungen mit unserem Solo Trader Pack für $0.99/Monat frei.',
    close: 'Schließen',
  },
  ja: {
    historyTitle: '接続履歴',
    historyNote: 'サンプルログ · ライブ通話は接続されていません',
    callBack: '[ 折り返し電話 ]',
    previewOnly: 'プレビューのみ — この画面から折り返し電話は発信されません。',
    gateTitle: '⚠️ 折り返し電話はゲートされています。',
    gateBody: 'この接続リンクの無料1週間パスは期限切れです。この折り返し電話を直ちに開始し、この特定の番号への無制限のリアルタイム翻訳ルーティングを解除するには、年額わずか$0.99のシングルオペレーションパスを有効化してください。ご注意：このパスはお客様の回線に有効で、リンクを共有された相手は1週間無料でお客様と話すことができます。または、月額$0.99のSolo Traderパックで無制限のマルチシート回線を解除できます。',
    close: '閉じる',
  },
};
