import {useState,type ReactNode} from 'react';
import {X} from 'lucide-react';
export default function AccessNotice({children}:{children:ReactNode}){
 const [dismissed,setDismissed]=useState(false);
 if(dismissed)return null;
 return <div data-access-notice className="access-notice"><div className="min-w-0 flex-1 space-y-2">{children}</div><button type="button" aria-label="Close" onClick={()=>setDismissed(true)} className="access-notice-exit"><X size={18}/></button></div>;
}
