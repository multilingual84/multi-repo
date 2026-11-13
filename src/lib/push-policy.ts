import { z } from 'zod';
export const pushEndpoint=z.string().url().max(2048).refine(v=>{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='fcm.googleapis.com'||u.hostname==='updates.push.services.mozilla.com'||u.hostname==='web.push.apple.com'||u.hostname.endsWith('.notify.windows.com'));},'Unsupported push service');
export const pushSubscriptionSchema=z.object({endpoint:pushEndpoint,expirationTime:z.number().nullable().optional(),keys:z.object({p256dh:z.string().regex(/^[A-Za-z0-9_-]{87}$/),auth:z.string().regex(/^[A-Za-z0-9_-]{22}$/)})});
export const pushCallPath=(id:string)=>`/?incoming=1#my-code-${z.string().uuid().parse(id)}`;
export function pushContext(c:{embedded:boolean;iphone:boolean;standalone:boolean;supported:boolean}){if(c.embedded)return 'openTab';if(c.iphone&&!c.standalone)return 'iphone';return c.supported?'ready':'unsupported';}
