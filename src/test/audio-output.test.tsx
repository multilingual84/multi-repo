import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BluetoothOutput from '@/components/BluetoothOutput';
import {
  applyPreferredSink, audioOutputCopy, getPreferredSink, isBluetoothLabel,
  listAudioOutputs, setPreferredSink,
} from '@/lib/audio/audio-output';
import { localLanguageCopy } from '@/lib/local-language-copy';
import { standardVoiceCopy } from '@/lib/standard-voice-copy';

const LOCALES = ['en', 'es', 'de', 'tl', 'zh', 'ja'] as const;

afterEach(() => cleanup());
beforeEach(() => localStorage.clear());

describe('audio output selection', () => {
  it('reads wireless headset names from the browser label', () => {
    expect(isBluetoothLabel('AirPods Pro')).toBe(true);
    expect(isBluetoothLabel('JBL Tune 510BT')).toBe(true);
    expect(isBluetoothLabel('Speakers (Realtek(R) Audio)')).toBe(false);
  });

  it('lists only audio outputs and flags the wireless ones', async () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices');
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        enumerateDevices: async () => [
          { kind: 'audiooutput', deviceId: 'default', label: 'default' },
          { kind: 'audiooutput', deviceId: 'bt1', label: 'Galaxy Buds' },
          { kind: 'audioinput', deviceId: 'mic1', label: 'Microphone' },
        ],
      },
    });
    try {
      const list = await listAudioOutputs();
      expect(list.map(device => device.deviceId)).toEqual(['default', 'bt1']);
      expect(list.find(device => device.deviceId === 'bt1')?.bluetooth).toBe(true);
      expect(list.find(device => device.deviceId === 'default')?.bluetooth).toBe(false);
    } finally {
      if (original) Object.defineProperty(navigator, 'mediaDevices', original);
      else delete (navigator as unknown as Record<string, unknown>)['mediaDevices'];
    }
  });



  it('remembers the chosen output and clears it for the phone speaker', () => {
    setPreferredSink('bt1');
    expect(getPreferredSink()).toBe('bt1');
    setPreferredSink('');
    expect(getPreferredSink()).toBe('');
  });

  it('routes a playing element only when the browser allows it', () => {
    setPreferredSink('bt1');
    const routed = { setSinkId: vi.fn(async () => {}) };
    applyPreferredSink(routed as unknown as HTMLMediaElement);
    expect(routed.setSinkId).toHaveBeenCalledWith('bt1');
    expect(() => applyPreferredSink({} as HTMLMediaElement)).not.toThrow();
  });

  it('tells the visitor the phone still chooses where its own voice plays', () => {
    for (const locale of LOCALES) {
      const copy = audioOutputCopy[locale];
      expect(copy?.tab).toBeTruthy();
      expect(copy?.heading).toBeTruthy();
      expect(copy?.exit).toBeTruthy();
      expect(copy?.none).toBeTruthy();
      expect(copy?.note).toBeTruthy();
    }
  });
});

describe('Bluetooth tab', () => {
  it('opens a device panel with an exit control beside Speaker and Headset', async () => {
    render(<BluetoothOutput locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: /Bluetooth/i }));
    expect(screen.getByText('Audio devices')).toBeTruthy();
    expect(await screen.findByText(/No headset found/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(screen.queryByText('Audio devices')).toBeNull();
  });
});

describe('translator wording', () => {
  it('leads the share button with keeping the conversation going', () => {
    expect(standardVoiceCopy.en.share).toBe('SHARE CODE to keep talking, no monthly fees! SHARE CODE for best experience.');
    expect(standardVoiceCopy.es.share).toBe('¡COMPARTE EL CÓDIGO para seguir hablando, sin cuotas mensuales! COMPARTE EL CÓDIGO para una mejor experiencia.');
    expect(standardVoiceCopy.de.share).toBe('CODE TEILEN und weiterreden, ohne monatliche Gebühren! CODE TEILEN für das beste Erlebnis.');
    expect(standardVoiceCopy.tl.share).toBe('IBAHAGI ANG CODE para patuloy na makipag-usap, walang buwanang bayad! IBAHAGI ANG CODE para sa pinakamagandang karanasan.');
    expect(standardVoiceCopy.zh.share).toBe('分享代码，继续交谈，无月费！分享代码，获得最佳体验。');
    expect(standardVoiceCopy.ja.share).toBe('コードを共有して会話を続けよう、月額料金なし！コードを共有して、より快適に。');
  });

  it('tells users to leave the mic on and let it self adjust', () => {
    expect(localLanguageCopy.en.hint).toBe('Just leave mic on for any language and it will self adjust itself for users.');
    expect(localLanguageCopy.es.hint).toBe('Deja el micrófono encendido para cualquier idioma y se ajustará solo para los usuarios.');
    expect(localLanguageCopy.tl.hint).toBe('Iwanang nakabukas ang mic para sa anumang wika at kusang aaangkop ito para sa mga gumagamit.');
    expect(localLanguageCopy.zh.hint).toBe('无论何种语言，只需让麦克风保持开启，它就会自动为用户调整。');
    expect(localLanguageCopy.de.hint).toBe('Lassen Sie das Mikrofon für jede Sprache an – es passt sich für die Nutzer von selbst an.');
    expect(localLanguageCopy.ja.hint).toBe('どの言語でもマイクをつけたままにすれば、ユーザーに合わせて自動で調整されます。');
  });
});
