import type {UILocale} from '@/lib/ui-copy';
// Free local voice matching: shapes device speech toward the speaker's own sentence pitch.
// Pitch is estimated on this device only; it is never sent or saved, and it is not identity matching.
const KEY='ml_voice_match';
export function voiceMatchOn():boolean{try{return localStorage.getItem(KEY)!=='off';}catch{return true;}}
export function setVoiceMatch(on:boolean){try{localStorage.setItem(KEY,on?'on':'off');}catch{}window.dispatchEvent(new Event('ml-voice-match'));}
export function matchedPitch(pitch:number|undefined):number{return voiceMatchOn()&&Number.isFinite(pitch)?(pitch as number):1;}
export const voiceMatchCopy:Record<UILocale,{label:string;note:string}>={
 en:{label:'Match my voice · Free',note:'A temporary voice signature follows your pitch on this phone. Not an exact copy; cleared when the conversation ends.'},
 es:{label:'Igualar mi voz · Gratis',note:'Una firma de voz temporal sigue tu tono en este teléfono. No es una copia exacta; se borra al terminar.'},
 tl:{label:'Itugma ang boses ko · Libre',note:'Pansamantalang voice signature batay sa taas ng boses sa device. Hindi eksaktong kopya; binubura pagkatapos ng usapan.'},
 zh:{label:'匹配我的声音 · 免费',note:'本机临时声音特征跟随您的音高，并非原声复制；对话结束后清除。'},
 de:{label:'Meine Stimme angleichen · Gratis',note:'Ein temporäres Stimmprofil folgt Ihrer Tonhöhe auf diesem Telefon. Keine exakte Kopie; nach dem Gespräch gelöscht.'},
 ja:{label:'自分の声に合わせる · 無料',note:'端末内の一時的な声の特徴で音高に合わせます。完全なコピーではなく、会話終了時に消去します。'},
};
