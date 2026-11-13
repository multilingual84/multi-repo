import type {UILocale} from '@/lib/ui-copy';
export const walletCheckoutCopy:Record<UILocale,{error:string;guidance:string;retry:string}>={
 en:{error:'Stripe checkout couldn’t open.',guidance:'Check your connection, then try again. If Stripe already charged you, don’t pay again—refresh your wallet and check Top-up status first.',retry:'Try checkout again'},
 es:{error:'No se pudo abrir el pago de Stripe.',guidance:'Comprueba tu conexión y vuelve a intentarlo. Si Stripe ya te cobró, no pagues otra vez: actualiza tu cartera y revisa el estado de recargas primero.',retry:'Reintentar el pago'},
 de:{error:'Stripe-Checkout konnte nicht geöffnet werden.',guidance:'Prüfe deine Verbindung und versuche es erneut. Falls Stripe bereits abgebucht hat, zahle nicht erneut: Aktualisiere deine Wallet und prüfe zuerst den Aufladestatus.',retry:'Checkout erneut versuchen'},
 tl:{error:'Hindi mabuksan ang Stripe checkout.',guidance:'Tingnan ang koneksiyon at subukan muli. Kung nasingil ka na ng Stripe, huwag magbayad ulit—i-refresh ang wallet at tingnan muna ang katayuan ng pagdagdag.',retry:'Subukan muli ang checkout'},
 zh:{error:'无法打开Stripe付款页面。',guidance:'请检查网络连接后重试。如果Stripe已经扣款，请勿重复付款：先刷新钱包并查看充值状态。',retry:'重试付款'},
 ja:{error:'Stripeの支払い画面を開けませんでした。',guidance:'接続を確認して再試行してください。すでにStripeで請求された場合は再度支払わず、ウォレットを更新してチャージ状況を先に確認してください。',retry:'支払いを再試行'}
};