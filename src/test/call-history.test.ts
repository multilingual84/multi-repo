import { afterEach,describe,expect,it } from 'vitest';
import { addCallHistory,callOutcome,callbackRoom,clearCallHistory,readCallHistory } from '@/lib/call-history';
afterEach(clearCallHistory);
describe('local call recents',()=>{it('only marks an unanswered incoming link as missed',()=>{expect(callOutcome(true,false)).toBe('missed');expect(callOutcome(false,false)).toBe('outgoing');expect(callOutcome(true,true)).toBe('answered');});it('callbacks target the existing shared room',()=>{const e={id:crypto.randomUUID(),room:'meeting-abcdef',at:123,video:true,outcome:'answered' as const};addCallHistory(e);expect(callbackRoom(readCallHistory()[0]??e)).toBe('abcdef');clearCallHistory();expect(readCallHistory()).toEqual([]);});});
