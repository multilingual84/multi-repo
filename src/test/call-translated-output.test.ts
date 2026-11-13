import {afterEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({channel:vi.fn(),pc:vi.fn(),speak:vi.fn().mockResolvedValue(undefined)}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{channel:m.channel,removeChannel:vi.fn()}}));
vi.mock('@/lib/webrtc',()=>({createPeerConnection:m.pc}));
vi.mock('@/lib/interpret.functions',()=>({interpretSpeechFn:vi.fn()}));
vi.mock('@/lib/clara-voice',()=>({claraSpeak:m.speak}));
import {LiveCall} from '@/lib/live-call';
afterEach(()=>{vi.unstubAllGlobals();vi.clearAllMocks();});
it('keeps original incoming audio at zero before and after language negotiation and locally speaks received text',async()=>{
 let audio:{volume:number}|undefined;vi.stubGlobal('Audio',class {volume=1;constructor(){audio=this;}play(){return Promise.resolve();}pause(){}});
 const handlers=new Map<string,(e:any)=>void>();const ch={on:vi.fn((t,f,h)=>{handlers.set(`${t}:${f.event}`,h);return ch;}),subscribe:vi.fn(),send:vi.fn(),presenceState:()=>({})};m.channel.mockReturnValue(ch);
 const pc={addTrack:vi.fn(),setRemoteDescription:vi.fn(),setLocalDescription:vi.fn(),createAnswer:vi.fn().mockResolvedValue({type:'answer'}),close:vi.fn(),ondatachannel:null as null|((e:any)=>void)};m.pc.mockReturnValue(pc);
 const call=new LiveCall('room',{getTracks:()=>[]} as unknown as MediaStream,'en',{onStatus:vi.fn(),onCaption:vi.fn()});
 expect(audio?.volume).toBe(0);call.start();handlers.get('broadcast:signal')?.({payload:{kind:'offer',from:'peer',sdp:{type:'offer'}}});await new Promise(r=>setTimeout(r,0));
 const dc={onmessage:null as null|((e:any)=>void),close:vi.fn()};pc.ondatachannel?.({channel:dc});
 for(const lang of ['es','en']){dc.onmessage?.({data:JSON.stringify({type:'lang',lang})});expect(audio?.volume).toBe(0);dc.onmessage?.({data:JSON.stringify({type:'say',text:'Hello'})});}
 expect(m.speak).toHaveBeenCalledTimes(2);expect(m.speak).toHaveBeenCalledWith('Hello','en');call.hangUp();
});