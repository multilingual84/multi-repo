import { useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { communicationCopy } from '@/lib/communication-copy';
import { translateTypedTextFn } from '@/lib/translator-text.functions';
import TranslatedTextDraft from './TranslatedTextDraft';
import type { UILocale } from '@/lib/ui-copy';
export default function TranslatorTextInput({locale,language}:{locale:UILocale;language:string}){const c=communicationCopy[locale],translate=useServerFn(translateTypedTextFn);const [text,setText]=useState(''),[result,setResult]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(false);const sequence=useRef(0);async function run(){const n=++sequence.current;setBusy(true);setError(false);setResult('');try{const r=await translate({data:{text,target:language,consent:true}});if(sequence.current!==n)return;if(r.ok)setResult(r.text);else setError(true);}catch{if(sequence.current===n)setError(true);}finally{if(sequence.current===n)setBusy(false);}}return <section className="w-full space-y-2 text-left" data-translator-text><h3 className="text-sm font-bold">{c.text}</h3><textarea aria-label={c.text} value={text} maxLength={4000} rows={3} onChange={e=>{sequence.current++;setText(e.target.value);setResult('');setBusy(false);}} className="w-full rounded-md border border-border bg-background p-3 text-sm"/><p className="text-xs text-muted-foreground">{c.consent}</p><Button disabled={busy||!text.trim()} onClick={()=>void run()}><Languages size={16}/>{busy?'…':c.translate}</Button>{error&&<p role="alert" className="text-sm text-destructive">{c.translation} — {c.offline}</p>}{result&&<TranslatedTextDraft locale={locale} text={result}/>}</section>;}
