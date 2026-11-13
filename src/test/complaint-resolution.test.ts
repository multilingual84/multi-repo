import { describe, expect, it } from 'vitest';
import { addSixtyDays, canOfferWaiver, complaintPolicy, validateComplaintReview, isComplaintReference, newComplaintReference } from '@/lib/complaints';

describe('Repair-first owner-approved remedy', () => {
  it('waives exactly 60 days, not calendar months', () => {
    expect(complaintPolicy.freeServiceDays).toBe(60);
    expect(addSixtyDays(new Date('2026-10-24T04:00:00Z')).toISOString()).toBe('2026-12-23T04:00:00.000Z');
  });
  it('does not refund past charges', () => { expect(complaintPolicy.refundPastCharges).toBe(false); });
  it('requires owner final approval even after a system issue is identified', () => {
    expect(canOfferWaiver({ ownerApproved: false, classification: 'system_issue', repairAttempt: 'Restarted and reproduced the issue.' })).toBe(false);
    expect(canOfferWaiver({ ownerApproved: true, classification: 'system_issue', repairAttempt: 'Restarted and reproduced the issue.' })).toBe(true);
  });
  it('requires an attempted repair', () => {
    expect(canOfferWaiver({ ownerApproved: true, classification: 'user_error', repairAttempt: '' })).toBe(false);
    expect(() => validateComplaintReview('user_error', '')).toThrow();
  });
  it('blocks an undetermined diagnosis', () => {
    expect(canOfferWaiver({ ownerApproved: true, classification: 'undetermined', repairAttempt: 'Reproducing the reported issue.' })).toBe(false);
  });
  it('accepts both user error and system issue as review classifications without approving them', () => {
    expect(validateComplaintReview('user_error', 'Explained the correct microphone permission.').classification).toBe('user_error');
    expect(validateComplaintReview('system_issue', 'Reproduced missing audio on two browsers.').classification).toBe('system_issue');
    expect(() => validateComplaintReview('automatic_approval', 'No investigation needed.')).toThrow();
  });
  it('issues valid complaint references', () => {
    expect(isComplaintReference(newComplaintReference())).toBe(true);
    expect(isComplaintReference('ML-1111-1111')).toBe(false);
  });
});
