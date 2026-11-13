import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Activity, ArrowLeft, Clock, Globe, Phone, Shield, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import teamImage from '@/assets/hero-team.jpg';
import { SampleLogExpiryPreview } from '@/components/EcosystemPreview';
import { sampleLedgerDates } from '@/lib/ecosystem-preview';

const sampleLogs = [
  { id: '1', room: '/#meeting-4f7b-91a2', type: 'SMS Blast', language: 'EN → ZH (Chinese)', time: 'Sample · 3:42 PM', active: true },
  { id: '2', room: '/#meeting-8c2d-01f4', type: 'QR Scan Counter', language: 'EN → ES (Spanish)', time: 'Sample · Oct 19, 9:14 AM', active: false },
  { id: '3', room: '/#meeting-3e9a-77c1', type: 'Email Blast', language: 'EN → TL (Tagalog)', time: 'Sample · Oct 18, 11:05 AM', active: false },
];

export default function AccountCockpitPreview() {
  const [showProtection, setShowProtection] = useState(false);

  return (
    <main className="account-preview min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-8 sm:py-6">
        <Button asChild variant="ghost" className="mb-3 -ml-3">
          <Link to="/"><ArrowLeft />Back to Multi-Lingual™</Link>
        </Button>
        <header className="relative isolate overflow-hidden border-b border-border py-6 sm:py-8">
          <img src={teamImage} alt="Multi-Lingual multicultural team" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 -z-10 bg-background/60" />
          <p className="mb-3 text-sm font-medium uppercase text-primary">Multi-Lingual™ · Account preview</p>
          <h1 className="max-w-3xl text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">Sovereign OS Account Health</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Sample account only. No live calls, messages, account verification, billing or access enforcement are connected here.</p>
        </header>

        <section aria-labelledby="health-heading" className="border-b border-border py-6 sm:py-8">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <h2 id="health-heading" className="flex min-w-0 items-center gap-2 text-base font-semibold text-signal sm:text-lg"><Activity className="size-5 shrink-0" /><span>Account overview</span></h2>
            <span className="grid shrink-0 gap-0.5 text-right text-xs text-primary sm:flex sm:gap-1"><span>Sample</span><span>· Not connected</span></span>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <div className="min-w-0 border-l-2 border-border pl-4">
              <dt className="mb-2 flex items-center gap-2 text-xs uppercase text-muted-foreground"><Shield className="size-4" />Corporate layer</dt>
              <dd className="text-sm font-semibold">Bricktown Software Systems LLC</dd>
              <dd className="mt-2 text-xs leading-relaxed text-signal">SAM.gov UEI · Not verified here</dd>
            </div>
            <div className="min-w-0 border-l-2 border-border pl-4">
              <dt className="mb-2 flex items-center gap-2 text-xs uppercase text-muted-foreground"><Activity className="size-4" />Scale overhead</dt>
              <dd className="text-sm font-semibold">Infrastructure cost unavailable</dd>
              <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">No live usage or cost measurements</dd>
            </div>
            <div className="min-w-0 border-l-2 border-signal pl-4 sm:col-span-2 lg:col-span-1">
              <dt className="mb-2 flex items-center gap-2 text-xs uppercase text-muted-foreground"><Clock className="size-4" />7-Day All-Access Pass</dt>
              <dd className="text-sm font-semibold">Sample: 2 days remaining</dd>
              <dd className="mt-2 text-xs leading-relaxed text-muted-foreground">Illustrative only · No expiry enforced</dd>
            </div>
          </dl>
          <Button onClick={() => setShowProtection(value => !value)} aria-expanded={showProtection} className="mt-5 h-auto w-full whitespace-normal px-4 py-3 text-center sm:w-auto">
            <Shield />Preview Lifetime Unbundled Solo Trader Protection
          </Button>
          {showProtection && <div role="status" className="mt-4 border-l-2 border-primary pl-4 text-sm leading-relaxed text-muted-foreground">Protection is not activated. This preview does not purchase a package, change your account or start billing.</div>}
        </section>

        <section aria-labelledby="ledger-heading" className="py-6 sm:py-8">
          <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 id="ledger-heading" className="flex min-w-0 items-start gap-2 text-base font-semibold sm:text-lg"><Phone className="mt-0.5 size-5 shrink-0 text-primary" /><span>Secure Connection Ledgers</span></h2>
              <p className="mt-2 text-xs text-muted-foreground">Sample history · No real activity</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-primary">3 sample records</span>
          </div>
          <div aria-hidden="true" className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 px-4 pb-3 text-xs uppercase text-muted-foreground lg:grid">
            <span>Connection</span><span>Channel</span><span>Language</span><span>Sample time</span><span className="w-28 text-right">Sample status</span>
          </div>
          <ul className="space-y-3">
            {sampleLogs.map(log => (
              <li key={log.id} className="grid min-w-0 grid-cols-2 items-start gap-x-4 gap-y-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
                <p className="col-span-2 flex min-w-0 items-start gap-2 font-mono text-sm sm:col-span-2 lg:col-span-1"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${log.active ? 'bg-primary' : 'bg-muted-foreground'}`} /><span className="break-all">{log.room}</span></p>
                <div className="min-w-0 text-sm sm:row-start-2 lg:row-auto"><p className="mb-1 text-xs text-muted-foreground lg:hidden">Channel</p><p className="flex items-start gap-1.5"><Share2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><span>{log.type}</span></p></div>
                <div className="min-w-0 text-sm sm:row-start-2 lg:row-auto"><p className="mb-1 text-xs text-muted-foreground lg:hidden">Language</p><p className="flex items-start gap-1.5"><Globe className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><span>{log.language}</span></p></div>
                <div className="col-span-2 min-w-0 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground sm:col-span-2 sm:row-start-3 lg:col-span-1 lg:row-auto lg:border-0 lg:pt-0">{log.time}</div>
                <span className={`row-start-2 col-span-2 w-fit rounded-sm px-2 py-1 text-xs font-medium sm:col-span-1 sm:col-start-3 sm:row-start-1 lg:col-auto lg:row-auto lg:w-28 lg:text-right ${log.active ? 'bg-primary/10 text-primary' : 'bg-background text-muted-foreground'}`}>{log.active ? 'Sample: Linked' : 'Sample: Terminated'}</span>
                {sampleLedgerDates[log.id] && <SampleLogExpiryPreview timestamp={sampleLedgerDates[log.id] ?? ''} />}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">These records are fictional, not sent messages or measured scans. Data-retention enforcement has not been verified.</p>
        </section>
      </div>
    </main>
  );
}