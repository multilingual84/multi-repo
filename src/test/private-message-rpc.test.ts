// Local PostgreSQL exercises the same migrations/RPCs without hosted accounts.
// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { expect, it } from 'vitest';
it('delivers to expired free recipients, permits text/audio replies and rejects unrelated or expired access',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
   CREATE SCHEMA auth;
   CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`);
  for(const file of ['0008_private_messaging_mailboxes.sql','0009_private_mailbox_trial_safety.sql','0010_private_message_safe_read_paths.sql','0011_paid_sender_free_replies.sql','0012_isolated_sandbox_and_message_status.sql']) {
   await db.exec(await readFile(new URL(`../../drizzle/migrations/${file}`,import.meta.url),'utf8'));
  }
  await db.exec(await readFile(new URL('./private-message-replies.sql',import.meta.url),'utf8'));
  await db.exec(await readFile(new URL('./sandbox-delivery.sql',import.meta.url),'utf8'));
  const result=await db.query<{count:number}>('select count(*)::integer as count from public.private_mailboxes');
  expect(result.rows[0]?.count).toBe(0);
 } finally {await db.close();}
},30000);