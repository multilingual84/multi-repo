// @vitest-environment node
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {voiceMinutesForCents,minuteUnits} from '@/lib/premium/minute-policy';
it('$0.16 per minute gives the disclosed prepaid durations',()=>{expect(voiceMinutesForCents(100)).toBe(6.25);expect(voiceMinutesForCents(500)).toBe(31.25);expect(voiceMinutesForCents(1000)).toBe(62.5);expect(minuteUnits(60000)).toBe(1600);});
it('meters server time once, preserves dollar value, stops at zero and enforces capped card claims',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE service_role;CREATE ROLE anon;CREATE ROLE authenticated;CREATE TABLE device_wallet_access(credential_handle uuid PRIMARY KEY);');
 for(const path of ['0014_premium_voice_prepaid_ledger.sql','0021_premium_minute_meter_and_funding.sql','0022_harden_voice_minute_meter.sql','0023_atomic_voice_card_credit.sql','0024_voice_refill_one_dollar.sql'])await db.exec(readFileSync(`drizzle/migrations/${path}`,'utf8'));
 const wallet='10000000-0000-4000-8000-000000000001';await db.query('INSERT INTO device_wallet_access VALUES($1)',[wallet]);await db.query('SELECT credit_premium_voice($1,$2,100)',[wallet,'cs_minute']);
 const session=(await db.query<{id:string}>('SELECT start_premium_voice_minutes($1) id',[wallet])).rows[0]?.id;expect(session).toBeTruthy();
 await db.exec('BEGIN');
 await db.query("UPDATE premium_voice_sessions SET started_at=now()-interval '1 minute',metered_at=now()-interval '1 minute',last_activity_at=now() WHERE id=$1",[session]);
 await db.query('SELECT tick_premium_voice_minutes($1,$2)',[wallet,session]);await db.query('SELECT tick_premium_voice_minutes($1,$2)',[wallet,session]);
 let a=(await db.query<{available_characters:number;used_characters:number}>('SELECT * FROM premium_voice_accounts WHERE wallet=$1',[wallet])).rows[0];expect(Number(a?.available_characters)).toBe(8400);expect(Number(a?.used_characters)).toBe(1600);
 await expect(db.query('SELECT start_premium_voice_minutes($1)',[wallet])).rejects.toThrow('already active');await db.exec('ROLLBACK');
 await db.query('UPDATE premium_voice_accounts SET available_characters=80 WHERE wallet=$1',[wallet]);
 await db.query("UPDATE premium_voice_sessions SET started_at=now()-interval '1 minute',metered_at=now()-interval '1 minute',last_activity_at=now() WHERE id=$1",[session]);
 await db.query('SELECT tick_premium_voice_minutes($1,$2)',[wallet,session]);
 a=(await db.query<{available_characters:number;used_characters:number}>('SELECT * FROM premium_voice_accounts WHERE wallet=$1',[wallet])).rows[0];expect(Number(a?.available_characters)).toBe(0);
 const usage=(await db.query<{milliseconds:number;units:number}>('SELECT sum(milliseconds) milliseconds,sum(units) units FROM premium_voice_minute_usage WHERE session_id=$1',[session])).rows[0];expect(Number(usage?.units)).toBe(80);expect(Number(usage?.milliseconds)).toBe(3000);
 await db.query('SELECT tick_premium_voice_minutes($1,$2)',[wallet,session]);expect(Number((await db.query<{n:number}>('SELECT sum(units) n FROM premium_voice_minute_usage WHERE session_id=$1',[session])).rows[0]?.n)).toBe(80);
 await db.query("INSERT INTO premium_voice_funding(wallet,livemode,customer_id,enabled,consent_at,amount_cents,monthly_limit_cents) VALUES($1,true,'cus_fixture',true,now(),500,500)",[wallet]);
 expect((await db.query('SELECT * FROM claim_voice_funding($1,true)',[wallet])).rows).toHaveLength(1);expect((await db.query('SELECT * FROM claim_voice_funding($1,true)',[wallet])).rows).toHaveLength(0);
 const attempt=(await db.query<{id:string}>('SELECT id FROM premium_voice_funding_attempts WHERE wallet=$1',[wallet])).rows[0]?.id;
 await db.query('SELECT credit_voice_funding($1,$2,$3,500,$4)',[attempt,wallet,'pi_fixture','cus_fixture']);await db.query('SELECT credit_voice_funding($1,$2,$3,500,$4)',[attempt,wallet,'pi_fixture','cus_fixture']);
 expect(Number((await db.query<{n:number}>('SELECT available_characters n FROM premium_voice_accounts WHERE wallet=$1',[wallet])).rows[0]?.n)).toBe(50000);
 await expect(db.query('SELECT credit_voice_funding($1,$2,$3,500,$4)',[attempt,wallet,'pi_other','cus_fixture'])).rejects.toThrow('ownership mismatch');expect((await db.query('SELECT * FROM claim_voice_funding($1,true)',[wallet])).rows).toHaveLength(0);
 await db.query('UPDATE premium_voice_funding SET amount_cents=100,monthly_limit_cents=600 WHERE wallet=$1',[wallet]);
 const one=(await db.query<{cents:number}>('SELECT * FROM claim_voice_funding($1,true)',[wallet])).rows;expect(one).toHaveLength(1);expect(one[0]?.cents).toBe(100);
 }finally{await db.close();}
},30000);