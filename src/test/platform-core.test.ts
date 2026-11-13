import { describe, expect, it } from 'vitest';
import {
  invoiceMetadata,
  localVirtualLine,
  localVirtualLineDisplay,
  receiptStatementBlock,
  supportContact,
} from '@/lib/config/platformCore';

describe('platformCore virtual line binding', () => {
  it('binds the provisioned OKC virtual line in E.164 form', () => {
    expect(localVirtualLine).toBe('+14052569880');
  });

  it('maps the same line into invoice metadata, receipts and support contact', () => {
    expect(invoiceMetadata.support_line).toBe(localVirtualLine);
    expect(receiptStatementBlock.support_phone).toBe(localVirtualLine);
    expect(supportContact.phone).toBe(localVirtualLine);
    expect(localVirtualLineDisplay).toBe('(405) 256-9880');
  });
});
