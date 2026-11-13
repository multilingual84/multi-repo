import {afterEach,describe,expect,it,vi} from 'vitest';
import {enableSpeechPlayback,speakTranslation,SPEECH_RATE} from '@/lib/speech-playback';
// Never download the neural model in tests; exercise the device-voice path.
vi.mock('@/lib/audio/hd-voice',()=>({hdVoiceSupported:()=>false,speakHd:()=>Promise.resolve(false),isHdSpeaking:()=>false,stopHdVoice:()=>{},primeHdVoice:()=>{}}));
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
function setup(){
 const synth={resume:vi.fn(),cancel:vi.fn(),speak:vi.fn(),getVoices:()=>[]};
 vi.stubGlobal('speechSynthesis',synth);
 vi.stubGlobal('SpeechSynthesisUtterance',class {constructor(public text:string){} lang=''; volume=1; onstart?:()=>void; onend?:()=>void; onerror?:(event:{error:string})=>void;});
 return synth;
}
describe('translated speech playback',()=>{
  it('applies bounded pitch to the chosen translated language',async()=>{const synth=setup();const result=speakTranslation('Hola','es',1.4);const utterance=synth.speak.mock.calls[0]?.[0];expect(utterance.pitch).toBe(1.4);expect(utterance.lang).toBe('es');utterance.onend();await result;});
 it('enables speech immediately from the permission tap',()=>{const synth=setup();enableSpeechPlayback();expect(synth.resume).toHaveBeenCalled();expect(synth.speak.mock.calls[0]?.[0].volume).toBe(0);});
 it('plays the chosen language and reports completion',async()=>{const synth=setup();const result=speakTranslation('Hola','es');const utterance=synth.speak.mock.calls[0]?.[0];expect(utterance.lang).toBe('es');utterance.onstart();utterance.onend();await result;});
 it('reports blocked playback rather than silently succeeding',async()=>{const synth=setup();const result=speakTranslation('Hola','es');const rejection=expect(result).rejects.toThrow('not-allowed');synth.speak.mock.calls[0]?.[0].onerror({error:'not-allowed'});await rejection;});
 it('does not leave capture stuck when speech never starts',async()=>{vi.useFakeTimers();setup();const result=speakTranslation('Hola','es');const rejection=expect(result).rejects.toThrow('did not start');await vi.advanceTimersByTimeAsync(5000);await rejection;});
  it('speaks at the slowed pace', () => expect(SPEECH_RATE).toBe(0.8));
});
