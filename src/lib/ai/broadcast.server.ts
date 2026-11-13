import { transcribe, translate } from './interpret.server';
export async function interpretBroadcast(audio:string,mime:string,languages:string[]){
 const key=process.env['LOVABLE_API_KEY'];if(!key)throw new Error('Speech unavailable');
 const bytes=Uint8Array.from(atob(audio),c=>c.charCodeAt(0));const heard=await transcribe(key,new Blob([bytes],{type:mime}),mime);
 const translations:Record<string,string>={};if(heard)for(const language of languages)translations[language]=await translate(key,heard,language);
 return {heard,translations};
}
