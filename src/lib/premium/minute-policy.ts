export const VOICE_USD_PER_MINUTE = 0.16;
// Preserve all existing prepaid dollar value; legacy unit names are not billing characters.
export function voiceMinutesForCents(cents:number){return Math.max(0,cents)/16;}
export function minuteUnits(milliseconds:number){return Math.ceil(Math.max(0,milliseconds)*1600/60000);}
export function creditUnitsUsd(units:number){return Math.max(0,units)/10000;}