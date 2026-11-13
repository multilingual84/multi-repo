import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

const GOOGLE_G = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.450 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.770 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>';

export default function StagingSignIn({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function google() {
    setStatus('');
    const result = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
    if (result.error) { setStatus('Google sign-in did not finish. Please try again.'); return; }
    if (!result.redirected) onOpenChange(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setStatus('');
    const { data, error } = mode === 'in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) { setStatus(error.message); return; }
    if (data.session) onOpenChange(false);
    else setStatus('Check your email to confirm your account, then sign in.');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-stage-line bg-stage-panel text-stage-ink">
        <DialogTitle>Sign in to Bricktown Staging Lab</DialogTitle>
        <DialogDescription className="text-stage-muted">Your picture balance and referral earnings stay with your account.</DialogDescription>
        <button type="button" onClick={() => void google()} className="flex w-full items-center justify-center gap-[10px] rounded-xl border border-[#747775] bg-[#FFFFFF] px-3 py-2.5 text-sm font-medium text-[#1F1F1F]">
          <span aria-hidden="true" className="h-[18px] w-[18px]" dangerouslySetInnerHTML={{ __html: GOOGLE_G }} />
          Continue with Google
        </button>
        <form onSubmit={submit} className="grid gap-3">
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@brokerage.com" className="rounded-xl border border-stage-line bg-stage-deep px-4 py-2.5 text-sm focus:border-stage-gold focus:outline-none" />
          <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (8+ characters)" className="rounded-xl border border-stage-line bg-stage-deep px-4 py-2.5 text-sm focus:border-stage-gold focus:outline-none" />
          {status && <p role="status" className="text-xs text-stage-gold">{status}</p>}
          <button disabled={busy} className="rounded-xl bg-stage-gold py-2.5 text-xs font-black uppercase tracking-wider text-stage-gold-ink disabled:opacity-60">{mode === 'in' ? 'Sign in with email' : 'Create account'}</button>
          <button type="button" onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="text-xs text-stage-muted underline">{mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in'}</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
