import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import MultiLingualOKCSystem from '@/components/MultiLingualOKCSystem';
import { roomFromHash } from '@/lib/call-room';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const tapTab = () => document.querySelector('[data-teller-announcement]');
const personalTranslatorTab = () => document.querySelector('[data-free-life]');

it('shows the tap-to-talk tab on the Overview page', () => {
  render(<MultiLingualOKCSystem />);
  expect(tapTab()).not.toBeNull();
  expect(tapTab()!.textContent).toContain('TAP HERE TO START TALKING');
});

it('sits directly above the Personal Translator tab in the header', () => {
  render(<MultiLingualOKCSystem />);
  const translator = personalTranslatorTab();
  const tap = tapTab();
  expect(translator).not.toBeNull();
  expect(tap).not.toBeNull();
  // The tap tab must come first and live in the same header nav as the Personal Translator tab.
  expect(translator!.compareDocumentPosition(tap!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  expect(tap!.closest('nav')).not.toBeNull();
  expect(tap!.closest('nav')).toBe(translator!.closest('nav'));
});

it('starts a real call room when tapped', () => {
  render(<MultiLingualOKCSystem />);
  window.location.hash = '';
  fireEvent.click(tapTab()!.querySelector('button') as HTMLElement);
  expect(window.location.hash).toMatch(/^#meeting-[a-zA-Z0-9-]{1,80}$/);
  const room = window.location.hash.slice('#meeting-'.length);
  expect(roomFromHash(`#meeting-${room}`)).toBe(`meeting-${room}`);
});

it('stays visible on every other tab', () => {
  render(<MultiLingualOKCSystem />);
  const nav = within(document.querySelector('header nav') as HTMLElement);
  for (const label of [/Pricing Matrix/i, /7-Day Free Pass/i, /Share us/i]) {
    fireEvent.click(nav.getByRole('button', { name: label }));
    const tap = tapTab();
    expect(tap).not.toBeNull();
    // Both tabs must remain in the pinned header, with the tap tab above the translator tab.
    const translator = personalTranslatorTab();
    expect(translator).not.toBeNull();
    expect(tap!.closest('header')).toBe(document.querySelector('header'));
    expect(translator!.compareDocumentPosition(tap!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  }
});

it('stays in the top header on the Overview page, which scrolls away with the page', () => {
  render(<MultiLingualOKCSystem />);
  const header = document.querySelector('header') as HTMLElement;
  expect(header.className).not.toContain('sticky');
  expect((tapTab() as HTMLElement).closest('header')).toBe(header);
});

it('stays in the top header on the Personal Translator screen', () => {
  render(<MultiLingualOKCSystem />);
  fireEvent.click(document.querySelector('[data-free-life]') as HTMLElement);
  const header = document.querySelector('header') as HTMLElement;
  const tap = tapTab() as HTMLElement;
  expect(tap).not.toBeNull();
  expect(tap.closest('header')).toBe(header);
  // It must live in the header nav, not in the scrolling flag strip below it.
  expect(tap.closest('nav')).toBe(header.querySelector('nav'));
});

it('keeps normal open behavior on tap and lights up while a call is active', () => {
  window.history.replaceState(null, '', '/');
  render(<MultiLingualOKCSystem />);
  const button = tapTab()!.querySelector('button') as HTMLElement;
  expect(button.getAttribute('aria-pressed')).toBe('false');
  fireEvent.click(button);
  expect(document.querySelector('[data-answer-call]')).not.toBeNull();
  expect(window.location.hash).toMatch(/^#meeting-[a-zA-Z0-9-]{1,80}$/);
  // The tab stays lit for as long as the call screen is open.
  expect(button.getAttribute('aria-pressed')).toBe('true');
  fireEvent.click(button);
  expect(document.querySelector('[data-answer-call]')).not.toBeNull();
  expect(button.getAttribute('aria-pressed')).toBe('true');
});

it('shows the outgoing screen to the caller and the incoming screen to the receiver', () => {
  window.history.replaceState(null, '', '/');
  window.localStorage.removeItem('ml-call-caller');
  render(<MultiLingualOKCSystem />);
  fireEvent.click(tapTab()!.querySelector('button') as HTMLElement);
  // The caller gets the outgoing screen with no Answer button.
  const dialog = screen.getByRole('dialog', { name: 'Outgoing call' });
  expect(within(dialog).queryByRole('button', { name: /^Answer$/ })).toBeNull();
  expect(within(dialog).getByRole('button', { name: 'Start talking' })).not.toBeNull();
  expect(dialog.querySelector('[data-call-sharing]')).not.toBeNull();
  // A different device opening the same link gets the incoming screen.
  cleanup();
  window.localStorage.removeItem('ml-call-caller');
  render(<MultiLingualOKCSystem />);
  expect(screen.getByRole('dialog', { name: 'Incoming call' })).not.toBeNull();
  expect(screen.getByRole('button', { name: /^Answer$/ })).not.toBeNull();
});
