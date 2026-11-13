import {paidPackages} from './pricing';
export function fleetSeatLimit(paid:boolean,tier:string){return paid?(paidPackages.find(p=>p.id===tier)?.seats??0):0;}
export function fleetMemberAllowed(approved:boolean,minutes:number,usedSeconds:number){return approved&&minutes>0&&usedSeconds<minutes*60;}
/** Group texting needs a paid multi-seat pack; person-to-person text stays free. */
export function fleetGroupAllowed(paid:boolean,tier:string){return fleetSeatLimit(paid,tier)>=2;}
export function fleetSeatsFull(approvedCount:number,seats:number){return approvedCount>=seats;}
