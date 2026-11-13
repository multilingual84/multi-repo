// @vitest-environment node
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
it('atomically reserves, prevents overspend, settles once and enforces session expiry',async()=>{
 const db=new PGlite();try{await db.exec('CREATE ROLE service_role; CREATE ROLE anon; CREATE ROLE authenticated;');await db.exec(readFileSync('drizzle/migrations/0014_premium_voice_prepaid_ledger.sql','utf8'));
 const wallet='10000000-0000-4000-8000-000000000001';await db.query('SELECT credit_premium_voice($1,$2,100)',[wallet,'cs_fixture']);await db.query('SELECT credit_premium_voice($1,$2,100)',[wallet,'cs_fixture']);
 let r=await db.query<{available_characters:number}>('SELECT available_characters FROM premium_voice_accounts WHERE wallet=$1',[wallet]);expect(Number(r.rows[0]?.available_characters)).toBe(10000);
 await expect(db.query('SELECT credit_premium_voice($1,$2,500)',[wallet,'cs_fixture'])).rejects.toThrow('ownership mismatch');
 await expect(db.query('SELECT credit_premium_voice($1,$2,100)',['10000000-0000-4000-8000-000000000002','cs_fixture'])).rejects.toThrow('ownership mismatch');
 const session=(await db.query<{id:string}>('SELECT start_premium_voice($1) AS id',[wallet])).rows[0]?.id;
 const request='20000000-0000-4000-8000-000000000001';await db.query('SELECT reserve_premium_voice($1,$2,$3,1000)',[wallet,session,request]);
 await expect(db.query('SELECT reserve_premium_voice($1,$2,$3,1000)',[wallet,session,'20000000-0000-4000-8000-000000000002'])).rejects.toThrow('pending reconciliation');
 await db.query("SELECT settle_premium_voice($1,$2,'succeeded')",[wallet,request]);await db.query("SELECT settle_premium_voice($1,$2,'succeeded')",[wallet,request]);
 const result=await db.query<{available_characters:number;used_characters:number}>('SELECT available_characters,used_characters FROM premium_voice_accounts WHERE wallet=$1',[wallet]);expect(Number(result.rows[0]?.available_characters)).toBe(9000);expect(Number(result.rows[0]?.used_characters)).toBe(1000);
 await db.query('UPDATE premium_voice_accounts SET available_characters=1 WHERE wallet=$1',[wallet]);await expect(db.query('SELECT reserve_premium_voice($1,$2,$3,2)',[wallet,session,'20000000-0000-4000-8000-000000000003'])).rejects.toThrow('Insufficient');
 await db.query("UPDATE premium_voice_sessions SET started_at=now()-interval '90 minutes' WHERE id=$1",[session]);await expect(db.query('SELECT reserve_premium_voice($1,$2,$3,1)',[wallet,session,'20000000-0000-4000-8000-000000000004'])).rejects.toThrow('ended');
 }finally{await db.close();}
},30000);
