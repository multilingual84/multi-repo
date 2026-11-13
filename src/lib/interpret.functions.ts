import { createServerFn } from '@tanstack/react-start';

// Public: one short spoken sentence in, its translation out. Nothing is stored.
export const interpretSpeechFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { audio?: string; mime?: string; target?: string; translate?: boolean; other?: string; automatic?: boolean }) => {
    const audio = String(input?.audio ?? '');
    if (audio.length < 200 || audio.length > 3_000_000) throw new Error('Invalid audio length.');
    const mime = (String(input?.mime ?? 'audio/webm').split(';')[0] ?? 'audio/webm').slice(0, 40);
    if (!mime.startsWith('audio/')) throw new Error('Invalid audio type.');
    const target = String(input?.target ?? 'en').replace(/[^a-zA-Z-]/g, '').slice(0, 12) || 'en';
    const other = input?.other ? String(input.other).replace(/[^a-zA-Z-]/g, '').slice(0, 12) : undefined;
    return { audio, mime, target, translate: input?.translate !== false, other, automatic: input?.automatic === true };
  })
  .handler(async ({ data }) => {
    const {activateWalletTrial,walletAccount}=await import('./wallet/access.server');
    await activateWalletTrial();
    const account=await walletAccount();
    if(!account.paid&&account.remainingSeconds<=0)throw new Error('Your free 30 minutes are used up.');
    const { interpretSpeech } = await import('@/lib/ai/interpret.server');
    return interpretSpeech(data);
  });
