import { describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import VenueQRPreview from '@/components/VenueQRPreview';
import { qrSharingText } from '@/lib/qr-sharing-copy';

// The owner asked the two QR purpose controls to be flipped, with a toggle between them.
const openDialog = () => {
  const copy = qrSharingText('en');
  cleanup();
  render(<VenueQRPreview locale="en" />);
  fireEvent.click(screen.getByRole('button', { name: new RegExp(copy.invitation.slice(0, 25), 'i') }));
  return copy;
};

describe('Venue QR purpose controls', () => {
  it('puts the sharing QR first and the public business QR second', () => {
    const copy = openDialog();
    const sharing = screen.getByRole('button', { name: copy.sharing });
    const business = screen.getByRole('button', { name: copy.business });
    const all = [...document.querySelectorAll('[data-qr-purpose-controls] > *')];
    expect(all.indexOf(sharing)).toBe(0);
    expect(all.indexOf(sharing)).toBeLessThan(all.indexOf(business));
    expect(all[all.length - 1]).toBe(business);
  });

  it('offers a toggle between them that switches the shown QR purpose', () => {
    const copy = openDialog();
    const toggle = screen.getByRole('switch', { name: copy.toggle });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('button', { name: copy.sharing })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: copy.business })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('button', { name: copy.business })).toHaveAttribute('aria-pressed', 'true');
  });

  it('names the toggle in every locale', async () => {
    const { qrSharingCopy } = await import('@/lib/qr-sharing-copy');
    for (const locale of Object.keys(qrSharingCopy)) {
      expect(qrSharingCopy[locale as keyof typeof qrSharingCopy].toggle.length).toBeGreaterThan(0);
    }
  });
});

describe('Stripe sign-up follows American English template', () => {
  it('every language has every English sharing field, including Stripe sign-up', async () => {
    const { qrSharingCopy } = await import('@/lib/qr-sharing-copy');
    const keys = Object.keys(qrSharingCopy.en).sort();
    for (const copy of Object.values(qrSharingCopy)) {
      expect(Object.keys(copy).sort()).toEqual(keys);
      expect(copy.setup.length).toBeGreaterThan(0);
    }
  });
  it('passes the page language to Stripe', async () => {
    const { stripeSignupUrl } = await import('@/components/QrEarningFooter');
    expect(stripeSignupUrl('ja')).toContain('locale=ja');
    expect(stripeSignupUrl('tl')).toContain('locale=fil');
  });
});
