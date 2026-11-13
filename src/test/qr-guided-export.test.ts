import { describe, expect, it } from 'vitest';
import { qrExportLayout } from '@/lib/qr-guided-export';

describe('QR exports contain only the code', () => {
  it.each([224, 640, 768])('keeps a %i-pixel QR intact on its own', size => {
    const layout = qrExportLayout(size, size);
    expect(layout.width).toBe(960);
    expect(layout.qrX).toBe(Math.floor((960 - size) / 2));
    expect(layout.qrY).toBe(0);
    expect(layout.height).toBe(size);
  });
  it('rejects invalid dimensions', () => {
    expect(() => qrExportLayout(0, 640)).toThrow('Invalid QR image dimensions');
    expect(() => qrExportLayout(640, -1)).toThrow('Invalid QR image dimensions');
  });
});
