import {afterEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({channel:vi.fn(),pc:vi.fn(),speak:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{channel:m.channel,removeChannel:vi.fn()}}));
vi.mock('@/lib/webrtc',()=>({createPeerConnection:m.pc}));
vi.mock('@/lib/interpret.functions',()=>({interpretSpeechFn:vi.fn()}));
vi.mock('@/lib/clara-voice',()=>({claraSpeak:m.speak}));
import {LiveCall} from '@/lib/live-call';
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
it('premium mode mutes original audio, uses remote translated text only and never falls back on failure',async()=>{
 let audio:{muted:boolean}|undefined;vi.stubGlobal('Audio',class {muted=false;constructor(){audio=this;}play(){return Promise.resolve();}pause(){}});
 const handlers=new Map<string,(v:any)=>void>();const ch={on:vi.fn((t,f,h)=>{handlers.set(`${t}:${f.event}`,h);return ch;}),subscribe:vi.fn(),send:vi.fn(),presenceState:()=>({})};m.channel.mockReturnValue(ch);
 const pc={addTrack:vi.fn(),setRemoteDescription:vi.fn(),setLocalDescription:vi.fn(),createAnswer:vi.fn().mockResolvedValue({type:'answer'}),close:vi.fn(),ondatachannel:null as null|((v:any)=>void)};m.pc.mockReturnValue(pc);
 const cap=vi.fn(),out=vi.fn().mockRejectedValue(new Error('No credit')),call=new LiveCall('room',{getTracks:()=>[]} as unknown as MediaStream,'en',{onStatus:vi.fn(),onCaption:cap});call.setPremiumOutput(out);expect(audio?.muted).toBe(true);call.start();handlers.get('broadcast:signal')?.({payload:{kind:'offer',from:'peer',sdp:{type:'offer'}}});await new Promise(r=>setTimeout(r,0));const dc={onmessage:null as null|((v:any)=>void),close:vi.fn()};pc.ondatachannel?.({channel:dc});dc.onmessage?.({data:JSON.stringify({type:'lang',lang:'es'})});dc.onmessage?.({data:JSON.stringify({type:'say',text:'Translated text'})});await new Promise(r=>setTimeout(r,0));expect(out).toHaveBeenCalledWith('Translated text');expect(m.speak).not.toHaveBeenCalled();expect(audio?.muted).toBe(true);expect(cap).toHaveBeenCalledWith({who:'them',text:'Translated text'});call.setPremiumOutput(null);expect(audio?.muted).toBe(false);call.hangUp();
});