export const WALLET_PRIVACY_KEY='ml-wallet-privacy-v1';
export const WALLET_SETTINGS_EVENT='ml-wallet-settings-change';
export const defaultWalletPrivacy={hide:false,autoLock:false,alerts:true,threshold:0.10};
export function readWalletPrivacy(){
 try{const saved=JSON.parse(localStorage.getItem(WALLET_PRIVACY_KEY)||'{}');return {hide:saved.hide===true,autoLock:saved.autoLock===true,alerts:typeof saved.alerts==='boolean'?saved.alerts:true,threshold:typeof saved.threshold==='number'&&Number.isFinite(saved.threshold)&&saved.threshold>=0?saved.threshold:defaultWalletPrivacy.threshold};}catch{return {...defaultWalletPrivacy};}
}
export function saveWalletPrivacy(next:typeof defaultWalletPrivacy){
 localStorage.setItem(WALLET_PRIVACY_KEY,JSON.stringify(next));
 window.dispatchEvent(new Event(WALLET_SETTINGS_EVENT));
}
export function voiceCreditAlert(available:number,threshold:number){if(!Number.isFinite(available)||available<=0)return 'zero';return available/10000<Math.max(0,threshold)?'low':null;}