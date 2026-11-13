import {describe,it,expect} from 'vitest';
import {signInScrollVisibility} from '@/lib/signin-scroll';
describe('Sign in scrolling',()=>{
 it('hides scrolling down',()=>expect(signInScrollVisibility(100,200,true)).toBe(false));
 it('shows scrolling up',()=>expect(signInScrollVisibility(200,100,false)).toBe(true));
 it('shows at the top',()=>expect(signInScrollVisibility(0,10,false)).toBe(true));
 it('ignores small scroll jitter',()=>expect(signInScrollVisibility(100,102,true)).toBe(true));
});import {clampScroll} from '@/lib/signin-scroll';
describe('overscroll bounce',()=>{it('clamps negative and past-bottom bounce',()=>{expect(clampScroll(-40,1000)).toBe(0);expect(clampScroll(1060,1000)).toBe(1000);});});
