export const PREMIUM_MAX_MS = 90 * 60 * 1000;
export const PREMIUM_IDLE_MS = 2 * 60 * 1000;
export const VOICE_BUDGETS = [100, 500, 1000] as const;
export const VOICE_PRICES: Record<number,string> = {100:'price_1UUciERt7sdUtv32DXUhxI1C',500:'price_1UUciFRt7sdUtv32vRrtKR4q',1000:'price_1UUciFRt7sdUtv32SAfoadxq'};
export const PREMIUM_VOICES = ['Kore','Puck','Charon','Fenrir','Aoede'] as const;
export function canUsePremiumVoice(state:{available:number;blocked?:unknown}|null){return Boolean(state&&Number.isFinite(state.available)&&state.available>0&&!state.blocked);}
export function canUseVoiceChanger(account:{verified:boolean;paid:boolean;tier:string}|null){return Boolean(account?.verified&&account.paid&&account.tier!=='none');}
export function presetVoiceForPlayback(changer:boolean,selected:string){return changer&&PREMIUM_VOICES.some(v=>v===selected)?selected:PREMIUM_VOICES[0];}
// Gentle rate adjustment only: this is not identity matching or independent time-stretching.
export function localPremiumPitchRate(enabled:boolean,pitch:number){return enabled&&Number.isFinite(pitch)?Math.min(1.15,Math.max(0.85,pitch)):1;}
export function characterCount(text:string){return Array.from(text).length;}
export function characterCostUsd(characters:number){return characters / 10000;}
export function premiumExpired(start:number,lastActivity:number,now:number){return now-start>=PREMIUM_MAX_MS || now-lastActivity>=PREMIUM_IDLE_MS;}
export function verifiedVoiceCredit(session:Record<string,unknown>,wallet:string,cents:number){const m=session['metadata'] as Record<string,string>|undefined;return session['status']==='complete'&&session['payment_status']==='paid'&&session['mode']==='payment'&&session['currency']==='usd'&&session['client_reference_id']===wallet&&m?.['purpose']==='premium_voice_credit'&&m?.['wallet']===wallet&&m?.['cents']===String(cents)&&session['amount_subtotal']===cents&&VOICE_BUDGETS.some(n=>n===cents);}
