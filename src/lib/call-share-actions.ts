export function cleanCallShareLink(link:string){const u=new URL(link);if(!/^https?:$/.test(u.protocol))throw new Error('Invalid link');u.search='';return u.href;}
export async function shareCallLink(link:string):Promise<'shared'|'cancelled'|'fallback'>{
 if(!navigator.share)return 'fallback';try{await navigator.share({url:cleanCallShareLink(link)});return 'shared';}catch(e){return e instanceof Error&&e.name==='AbortError'?'cancelled':'fallback';}
}
