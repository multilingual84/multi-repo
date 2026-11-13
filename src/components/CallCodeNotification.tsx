import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';
import { invitePushFn } from '@/lib/push.functions';
import { pushCopy } from '@/lib/push-copy';
import { personalCodeIdFromHash } from '@/lib/personal-code';
export default function CallCodeNotification({locale,onSent}:{locale:string;onSent:()=>void}){const c=pushCopy[locale as keyof typeof pushCopy]??pushCopy.en,invite=useServerFn(invitePushFn);const [busy,setBusy]=useState(false),[message,setMessage]=useState('');async function send(){setBusy(true);try{await invite({data:{recipient:personalCodeIdFromHash(window.location.hash)}});setMessage(c.sent);onSent();}catch{setMessage(c.locked);}finally{setBusy(false);}}return <div className="w-full space-y-2"><Button variant="outline" disabled={busy} onClick={()=>void send()}><Bell size={16}/>{c.notify}</Button>{message&&<p role="status" className="text-xs">{message}</p>}</div>;}
