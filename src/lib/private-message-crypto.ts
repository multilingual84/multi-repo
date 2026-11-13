import nacl from 'tweetnacl';
export const encodeBytes = (bytes: Uint8Array) => { let s=''; for (const b of bytes) s+=String.fromCharCode(b); return btoa(s); };
export const decodeBytes = (s: string) => Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export function newMailboxKeys() { const keys=nacl.box.keyPair(); return {publicKey:encodeBytes(keys.publicKey),privateKey:encodeBytes(keys.secretKey)}; }
export function mailboxKeysFromSeed(seed:string){if(!/^[a-f0-9]{64}$/.test(seed))throw new Error('Invalid private credential');const secret=Uint8Array.from(seed.match(/../g)??[],x=>parseInt(x,16));const keys=nacl.box.keyPair.fromSecretKey(secret);return {publicKey:encodeBytes(keys.publicKey),privateKey:encodeBytes(keys.secretKey)};}
export function sealMessage(text:string,recipientKey:string) {
 const ephemeral=nacl.box.keyPair(), nonce=nacl.randomBytes(nacl.box.nonceLength);
 const ciphertext=nacl.box(new Uint8Array(new TextEncoder().encode(text)),nonce,decodeBytes(recipientKey),ephemeral.secretKey);
 ephemeral.secretKey.fill(0);
 return {ciphertext:encodeBytes(ciphertext),nonce:encodeBytes(nonce),sender_key:encodeBytes(ephemeral.publicKey)};
}
export function openMessage(envelope:{ciphertext:string;nonce:string;sender_key:string},privateKey:string) {
 const key=decodeBytes(privateKey);
 try { const plaintext=nacl.box.open(decodeBytes(envelope.ciphertext),decodeBytes(envelope.nonce),decodeBytes(envelope.sender_key),key); if(!plaintext)throw new Error('Message authentication failed'); return new TextDecoder().decode(plaintext); } finally { key.fill(0); }
}
