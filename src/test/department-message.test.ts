import { describe, expect, it } from 'vitest';
import { departmentMessageSchema } from '@/lib/department-message';

describe('department message validation', () => {
  const valid = { department: 'support', email: 'visitor@example.com', message: 'Please help with this question.', submissionId: 'b1550470-533b-4dd1-8414-dbc78d72f464' };
  it('accepts every new department', () => {
    for (const department of ['community-outreach', 'partnerships', 'accessibility']) expect(departmentMessageSchema.safeParse({ ...valid, department }).success).toBe(true);
  });
  it('retires the billing department', () => {
    expect(departmentMessageSchema.safeParse({ ...valid, department: 'billing' }).success).toBe(false);
  });
  it('rejects arbitrary recipients used as departments', () => {
    expect(departmentMessageSchema.safeParse({ ...valid, department: 'other@example.com' }).success).toBe(false);
  });
  it('rejects reply header injection', () => {
    expect(departmentMessageSchema.safeParse({ ...valid, email: 'visitor@example.com\r\nBcc: other@example.com' }).success).toBe(false);
  });
});