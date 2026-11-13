import {describe,it,expect} from 'vitest';
import {fleetSeatLimit,fleetGroupAllowed,fleetSeatsFull} from '@/lib/fleet-policy';
describe('fleet group seats',()=>{
 it('seats follow the price matrix',()=>{expect(fleetSeatLimit(true,'single')).toBe(1);expect(fleetSeatLimit(true,'team')).toBe(10);expect(fleetSeatLimit(true,'hub')).toBe(25);expect(fleetSeatLimit(true,'duo-yearly')).toBe(2);expect(fleetSeatLimit(true,'community')).toBe(100);expect(fleetSeatLimit(true,'enterprise')).toBe(1500);});
 it('no paid package means no group text',()=>{expect(fleetGroupAllowed(false,'team')).toBe(false);expect(fleetGroupAllowed(true,'single')).toBe(false);expect(fleetGroupAllowed(true,'team')).toBe(true);});
 it('seats full at the limit',()=>{expect(fleetSeatsFull(10,10)).toBe(true);expect(fleetSeatsFull(9,10)).toBe(false);});
});
