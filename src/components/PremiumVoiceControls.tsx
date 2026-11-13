import VoiceMatchSwitch from './VoiceMatchSwitch';
import VoiceChangerPicker from './VoiceChangerPicker';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {voicePermissionCopy} from '@/lib/premium/copy';
import {voiceMatchCopy} from '@/lib/voice-match';
import type {UILocale} from '@/lib/ui-copy';

// Voice controls for calls and the translator: the free "Match my voice" switch and
// the free Voice changer. The retired paid enhanced-voice controls are gone; nothing
// here spends credit, needs an account, or sends audio off the phone.
// Props are kept for existing callers; the paid-voice callbacks are no longer used.
export default function PremiumVoiceControls({locale,language}:{locale:UILocale;enabled:boolean;onEnabled:(v:boolean)=>void;onVoice:(v:string)=>void;onPitch:(v:boolean)=>void;onCharacter:(v:string)=>void;active:boolean;language?:string;onConsent?:(v:boolean)=>void}){
 const permissionCopy=voicePermissionCopy[locale];
 return <div data-premium-voice className="w-full space-y-3 border-t border-border pt-3 text-left text-xs">
 <Tabs defaultValue="permission" className="w-full">
  <TabsList className="grid h-auto w-full grid-cols-2 gap-1"><TabsTrigger value="permission" className="min-h-11 whitespace-normal px-2 text-xs">{(voiceMatchCopy[locale]??voiceMatchCopy.en).label}</TabsTrigger><TabsTrigger value="changer" className="min-h-11 whitespace-normal px-2 text-xs">{permissionCopy.changer}</TabsTrigger></TabsList>
 <TabsContent value="permission">
  <VoiceMatchSwitch locale={locale}/>
 </TabsContent>
<TabsContent value="changer" className="space-y-3">
  <VoiceChangerPicker locale={locale} language={language}/>
 </TabsContent>
 </Tabs>
 </div>;
}
