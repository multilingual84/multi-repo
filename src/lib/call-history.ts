import { z } from 'zod';
const entrySchema=z.object({id:z.string().uuid(),room:z.string().regex(/^meeting-[a-zA-Z0-9_-]{6,64}$/),at:z.number().finite(),video:z.boolean(),outcome:z.enum(['outgoing','answered','missed']),nickname:z.string().max(40).optional()});
export type CallHistoryEntry=z.infer<typeof entrySchema>;
const key='ml-local-call-history';
export function callOutcome(incoming:boolean,connected:boolean):CallHistoryEntry['outcome']{return incoming?(connected?'answered':'missed'):'outgoing';}
export function readCallHistory():CallHistoryEntry[]{try{return z.array(entrySchema).max(50).parse(JSON.parse(localStorage.getItem(key)??'[]'));}catch{return [];}}
export function addCallHistory(entry:CallHistoryEntry){const clean=entrySchema.parse(entry);localStorage.setItem(key,JSON.stringify([clean,...readCallHistory().filter(e=>e.id!==clean.id)].slice(0,50)));window.dispatchEvent(new Event('ml-call-history'));}
export function clearCallHistory(){localStorage.removeItem(key);window.dispatchEvent(new Event('ml-call-history'));}
export function callbackRoom(entry:CallHistoryEntry){return entrySchema.parse(entry).room.slice('meeting-'.length);}
