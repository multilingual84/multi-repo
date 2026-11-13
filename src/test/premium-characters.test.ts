import {expect,it} from 'vitest';
import {applyCharacter,characterFor,characterRate,CHARACTERS} from '@/lib/premium/characters';
it('provides old-man and baby effects without changing premium voice identity',()=>{
 expect(characterRate('old-man',1)).toBe(.78);
 expect(characterRate('baby',1)).toBe(1.65);
 expect(characterFor('missing').id).toBe('natural');
});
it('bounds combined pitch and character playback',()=>{
 expect(characterRate('chipmunk',1.15)).toBe(1.8);
 expect(characterRate('giant',.85)).toBe(.55);
});
it('provides professional office styles without playful distortion',()=>{for(const id of ['office-calm','presenter','warm-service','formal']){const c=characterFor(id);expect(c.id).toBe(id);expect(c.drive).toBe(0);expect(c.wobble).toBe(0);}});
it('processes every character safely without modifying input audio',()=>{
 const input=new Float32Array([.2,-.3,.8,-.9]);
 for(const c of CHARACTERS){const result=applyCharacter([input],c.id)[0];expect(result).toHaveLength(4);expect(result?.every(v=>Number.isFinite(v)&&Math.abs(v)<=1)).toBe(true);}
 expect(Array.from(input)).toEqual(Array.from(new Float32Array([.2,-.3,.8,-.9])));
 expect(Array.from(applyCharacter([input],'natural')[0]??[])).toEqual(Array.from(input));
 expect(Array.from(applyCharacter([input],'robot')[0]??[])).not.toEqual(Array.from(input));
});