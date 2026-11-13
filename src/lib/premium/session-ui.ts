import {countryCurrencies,currencyPlans} from '@/lib/country-currency';
import {characterCostUsd} from './policy';
export const SPEND_REMINDER_KEY='ml-premium-minute-spend-reminder-v2';
export function shouldConfirmPremiumSpend(consent:boolean,skipReminder:boolean){return !consent||!skipReminder;}
export function sessionUsage(characters:number,elapsedMs:number){
 return {characters:Math.max(0,characters),usd:characterCostUsd(Math.max(0,characters)),minutes:Math.max(0,elapsedMs)/60000};
}
export function localVoiceAmount(usd:number,country:string){
 const code=countryCurrencies[country.toLowerCase()],plan=code?currencyPlans[code]:undefined;
 return plan?{amount:usd*plan.factor,code:plan.code}:null;
}