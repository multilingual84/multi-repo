import {currentUsage, resetsAt, type AllowanceUsage} from './free-allowance-policy';
export const QR_SHARE_BONUS_MINUTES = 0;
const KEY = 'ml-qr-minute-bonus';
export function bonusForWindow(expiresAt:number|null, now:number):number {
 return expiresAt!==null&&expiresAt>now ? QR_SHARE_BONUS_MINUTES : 0;
}
export function readQrBonus(now=Date.now()):number {
 if(typeof window==='undefined')return 0;
 try{return bonusForWindow(Number(localStorage.getItem(KEY))||null,now);}catch{return 0;}
}
export function awardQrBonus(usage:AllowanceUsage|null,now=Date.now()):{minutes:number;expiresAt:number}{
 const expiresAt=resetsAt(currentUsage(usage,now));
 try{if(!readQrBonus(now))localStorage.setItem(KEY,String(expiresAt));}catch{}
 return {minutes:readQrBonus(now),expiresAt};
}