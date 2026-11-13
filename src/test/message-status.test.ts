import {expect,it} from 'vitest';
import {deliveryStage} from '@/lib/message-status';
it('does not claim device receipt on inbox delivery',()=>expect(deliveryStage({received_at:null,replied_at:null})).toBe('delivered'));
it('records recipient inbox receipt separately',()=>expect(deliveryStage({received_at:'2026-10-25T00:00:00Z',replied_at:null})).toBe('received'));
it('shows a response only after a response timestamp',()=>expect(deliveryStage({received_at:'2026-10-25T00:00:00Z',replied_at:'2026-10-25T00:01:00Z'})).toBe('replied'));