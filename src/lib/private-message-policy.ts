export const messagingSku='ML-PRIVATE-DUO-YEAR';
export const messagingUsdPrice=0.99;
export const messagingSeats=2;
export const messagingTrialMs=7*24*60*60*1000;
export function canSendMessages(trialStart:string,paidUntil:string|null,now=Date.now()) {
 // Enrollment and authenticated server ownership are still required. Texting
 // has no time or payment gate; audio retains its server-side eligibility.
 return Boolean(trialStart) && Number.isFinite(now);
}
export function mailboxAddress(value:string):string {
 try { return new URL(value).searchParams.get('mailbox')??value.trim(); } catch { return value.trim(); }
}
export function canSendToMailbox(hasSendingAccess:boolean,address:string,replyMailboxes:readonly string[]):boolean {
 return hasSendingAccess || replyMailboxes.includes(mailboxAddress(address));
}
