export function signInScrollVisibility(previous:number,next:number,visible:boolean){
 if(next<20)return true;
 if(Math.abs(next-previous)<4)return visible;
 return next<previous;
}
/** Clamp rubber-band overscroll so bounce at top/bottom never reverses direction. */
export function clampScroll(y:number,max:number){return Math.min(Math.max(y,0),Math.max(max,0));}
/** Toggle only after travelling far enough in one direction (stops flicker). */
export const SCROLL_TOGGLE_DISTANCE=32;
