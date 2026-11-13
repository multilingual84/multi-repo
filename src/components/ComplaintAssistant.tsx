import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { communicationCopy } from '@/lib/communication-copy';
import { troubleshootingSteps, type HelpIssue } from '@/lib/troubleshooting';
import { troubleshootingCopy } from '@/lib/troubleshooting-copy';
import AgencyWifiGuide from './AgencyWifiGuide';
import type { UILocale } from '@/lib/ui-copy';
export default function ComplaintAssistant({locale}:{locale:UILocale}){const c=communicationCopy[locale];const [issue,setIssue]=useState<HelpIssue|null>(null);return <section data-complaint-assistant className="mb-6 space-y-3 border-b border-border pb-5"><h3 className="text-lg font-bold">{c.help}</h3><div className="flex flex-wrap gap-2">{(['microphone','network','translation','billing'] as const).map(i=><Button key={i} variant={issue===i?'default':'outline'} onClick={()=>setIssue(i)}>{c[i]}</Button>)}</div>{issue&&<div role="status"><p className="text-sm font-bold">{c.suggestion}</p><ol className="list-decimal space-y-2 pl-5 text-xs leading-relaxed">{troubleshootingSteps(issue).map(step=><li key={step}>{troubleshootingCopy[locale][step]}</li>)}</ol></div>}<AgencyWifiGuide locale={locale}/><p className="text-xs text-muted-foreground">{c.helpNote}</p></section>;}
