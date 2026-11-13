import {beforeEach,expect,it} from 'vitest';
import {awardQrBonus,bonusForWindow,QR_SHARE_BONUS_MINUTES,readQrBonus} from '@/lib/qr-minute-bonus';
import {hitsPaywall,minutesLeft} from '@/lib/free-allowance-policy';
beforeEach(()=>localStorage.clear());
it('sharing grants exactly 30 extra minutes',()=>{expect(QR_SHARE_BONUS_MINUTES).toBe(30);expect(awardQrBonus({windowStart:1000,usedMs:0},1000).minutes).toBe(30);expect(minutesLeft(0,readQrBonus(1000))).toBe(70);});
it('repeated sharing does not stack or extend the daily bonus',()=>{const first=awardQrBonus({windowStart:1000,usedMs:0},1000);awardQrBonus({windowStart:1000,usedMs:0},2000);expect(readQrBonus(2000)).toBe(30);expect(Number(localStorage.getItem('ml-qr-minute-bonus'))).toBe(first.expiresAt);});
it('the bonus expires at the 24-hour reset and can be earned next day',()=>{const first=awardQrBonus({windowStart:1000,usedMs:0},1000);expect(bonusForWindow(first.expiresAt,first.expiresAt)).toBe(0);expect(awardQrBonus(null,first.expiresAt).minutes).toBe(30);});
it('metered free use stops at 70 minutes with the bonus, not 40',()=>{expect(hitsPaywall(false,40*60000,30)).toBe(false);expect(hitsPaywall(false,70*60000,30)).toBe(true);expect(hitsPaywall(false,40*60000,0)).toBe(true);});