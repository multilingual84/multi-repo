import {useEffect,useRef} from 'react';
import {X} from 'lucide-react';
import {Button} from './ui/button';
import WalkingTranslator from './WalkingTranslator';
import {PublicBroadcastPreview} from './EcosystemPreview';
import type {UILocale} from '@/lib/ui-copy';
const exitLabels:Record<UILocale,string>={en:'Exit',es:'Salir',de:'Beenden',tl:'Lumabas',zh:'退出',ja:'終了'};
export default function TalkingEnvironment({locale,onExit}:{locale:UILocale;onExit:()=>void}){
 const exit=useRef<HTMLButtonElement>(null);
 useEffect(()=>{const previous=document.body.style.overflow;document.body.style.overflow='hidden';exit.current?.focus({preventScroll:true});return()=>{document.body.style.overflow=previous;};},[]);
 return <div data-talking-environment role="dialog" aria-modal="true" aria-label="Multi-Lingual" className="talking-environment"><header className="talking-environment-header"><span className="font-bold">Multi-Lingual™</span><Button ref={exit} data-talking-exit variant="outline" onClick={onExit}><X size={18}/>{exitLabels[locale]}</Button></header><div data-talking-scroll className="talking-environment-scroll"><div className="mx-auto w-full max-w-5xl space-y-6 px-3 py-4"><WalkingTranslator locale={locale}/><PublicBroadcastPreview locale={locale}/></div></div></div>;
}