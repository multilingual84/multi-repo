// @vitest-environment node
import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
it('fleet owner controls members, seat count and metered minutes atomically',async()=>{
 const db=new PGlite();try{
 await db.exec('CREATE ROLE service_role; CREATE ROLE anon; CREATE ROLE authenticated; CREATE TABLE device_wallet_access(credential_handle uuid PRIMARY KEY);');
 await db.exec(readFileSync('drizzle/migrations/0017_fleet_wallet_access.sql','utf8'));await db.exec(readFileSync('drizzle/migrations/0018_fleet_atomic_member_capacity.sql','utf8'));
 const owner='10000000-0000-4000-8000-000000000001',a='10000000-0000-4000-8000-000000000002',b='10000000-0000-4000-8000-000000000003';for(const w of [owner,a,b])await db.query('INSERT INTO device_wallet_access VALUES($1)',[w]);const f=(await db.query<{id:string}>('INSERT INTO fleet_accounts(owner_wallet) VALUES($1) RETURNING id',[owner])).rows[0]?.id;
 for(const w of [a,b])await db.query('INSERT INTO fleet_members(fleet_id,wallet,nickname) VALUES($1,$2,$3)',[f,w,'Member']);
 await expect(db.query('SELECT configure_fleet_member($1,$2,true,5,2)',[b,a])).rejects.toThrow('Fleet unavailable');
 await expect(db.query('SELECT tick_fleet_usage($1)',[a])).rejects.toThrow('Fleet access unavailable');
 await db.query('SELECT configure_fleet_member($1,$2,true,5,2)',[owner,a]);await expect(db.query('SELECT configure_fleet_member($1,$2,true,5,2)',[owner,b])).rejects.toThrow('Seat capacity reached');
 await db.query("UPDATE fleet_members SET used_seconds=299,last_tick=now()-interval '5 seconds' WHERE wallet=$1",[a]);const usage=(await db.query<{remaining_seconds:number}>('SELECT * FROM tick_fleet_usage($1)',[a])).rows[0];expect(usage?.remaining_seconds).toBe(0);
 await db.query("UPDATE fleet_members SET window_started=now()-interval '24 hours' WHERE wallet=$1",[a]);expect((await db.query<{remaining_seconds:number}>('SELECT * FROM tick_fleet_usage($1)',[a])).rows[0]?.remaining_seconds).toBe(300);
 await db.query('SELECT configure_fleet_member($1,$2,false,5,2)',[owner,a]);await expect(db.query('SELECT tick_fleet_usage($1)',[a])).rejects.toThrow('Fleet access unavailable');
 }finally{await db.close();}
},30000);