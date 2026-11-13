import { describe, expect, it } from 'vitest';
import { formatFlagTotal, getFlagPricePlan } from '@/lib/flag-pricing';

describe('Flag billing totals', () => {
  it('yuan total includes the same rounded local package and one-time fee', () => {
    expect(formatFlagTotal('single', .99, .2, getFlagPricePlan('zh-CN', null, 'cn'))).toBe('¥7.96');
    expect(formatFlagTotal('team', 3.99, .2, getFlagPricePlan('zh-CN', null, 'cn'))).toBe('¥28.03');
  });
  it('retains Philippine amounts and fee', () => {
    expect(formatFlagTotal('single', .99, .2, getFlagPricePlan('tl', null, 'ph'))).toBe('₱60.00');
  });
  it('Enterprise stays USD including its USD fee', () => {
    expect(formatFlagTotal('enterprise', 199, .2, getFlagPricePlan('zh', null, 'cn'))).toBe('$199.20');
  });
});