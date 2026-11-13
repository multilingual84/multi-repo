import {afterEach,expect,it,vi} from 'vitest';
import {PremiumVoicePlayer} from '@/lib/premium/player';

afterEach(()=>vi.unstubAllGlobals());
it('adjusts chunk scheduling locally, preserves replay pitch, and never sends pitch',async()=>{
 const sources:{playbackRate:{value:number};start:ReturnType<typeof vi.fn>;onended:(()=>void)|null}[]=[];
 class Context{
  state='running';currentTime=0;destination={};
  async resume(){} async close(){}
  createBuffer(){return {duration:1,copyToChannel(){}};}
  createBufferSource(){const source={playbackRate:{value:1},onended:null as (()=>void)|null,connect(){},stop(){},start:vi.fn((_time:number)=>queueMicrotask(()=>source.onended?.()))};sources.push(source);return source;}
 }
 vi.stubGlobal('AudioContext',Context);
 const request=vi.fn(async()=>new Response(['event: speech.audio.delta\ndata: {"type":"speech.audio.delta","audio":"AAA="}\n\n','event: speech.audio.delta\ndata: {"type":"speech.audio.delta","audio":"AAA="}\n\n','event: speech.audio.done\ndata: {"type":"speech.audio.done"}\n\n'].join('')));
 vi.stubGlobal('fetch',request);
 const player=new PremiumVoicePlayer();await player.enable();player.setLocalPitch(true);await player.speak('Hello','session',1.1);
 expect(sources.map(s=>s.playbackRate.value)).toEqual([1.1,1.1]);
 expect(sources[1]?.start.mock.calls[0]?.[0]).toBeCloseTo(.05+1/1.1);
 const call=request.mock.calls[0] as unknown as [string,{body:string}];
 expect(call[0]).toBe('/api/premium-voice');expect(Object.keys(JSON.parse(call[1].body)).sort()).toEqual(['consent','requestId','session','text','voice']);
 player.setLocalPitch(false);await player.replay();expect(sources.slice(2).map(s=>s.playbackRate.value)).toEqual([1.1,1.1]);expect(request).toHaveBeenCalledTimes(1);
 await player.speak('Next','session',1.1);expect(sources.slice(4).map(s=>s.playbackRate.value)).toEqual([1,1]);
 player.setCharacter('baby');await player.speak('Baby effect','session');expect(sources.slice(6).map(s=>s.playbackRate.value)).toEqual([1.65,1.65]);
 player.setCharacter('natural');await player.replay();expect(sources.slice(8).map(s=>s.playbackRate.value)).toEqual([1.65,1.65]);
 const characterCall=request.mock.calls[2] as unknown as [string,{body:string}];expect(Object.keys(JSON.parse(characterCall[1].body)).sort()).toEqual(['consent','requestId','session','text','voice']);
 player.stop();await expect(player.replay()).rejects.toThrow('No completed speech');
});