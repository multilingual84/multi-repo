export const COMM_UNIT = 'text' as const;
export const FREE_TIER_SHARED_MINUTES_PER_DAY = 60;
export const PAID_CAN_CALL_ANYONE = true;
export function freeTierDailyCapMinutes(): number { return FREE_TIER_SHARED_MINUTES_PER_DAY; }
export function paidMayCallAnyone(isPaid: boolean): boolean { return isPaid && PAID_CAN_CALL_ANYONE; }
