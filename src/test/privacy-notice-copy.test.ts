import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { governmentComplianceCopy } from '@/lib/government-compliance-copy';

const locales = ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const;

// Owner-supplied trust claims: approved for government applications, engineered
// to keep no user information, completely anonymous, safe for cross-border
// telecommunications, and customer privacy is the priority. Every native locale
// must carry all five ideas in its own wording.
const required: Record<(typeof locales)[number], string[]> = {
  en: ['government', 'no user information', 'anonymous', 'cross-border', 'privacy'],
  es: ['aplicaciones gubernamentales', 'no conservar información', 'anónima', 'transfronterizas', 'privacidad'],
  tl: ['aplikasyon ng gobyerno', 'huwag itago ang impormasyon', 'anonimong', 'pagitan ng mga bansa', 'prayoridad'],
  zh: ['政府应用', '不保留任何用户信息', '匿名', '跨境通信', '隐私'],
  de: ['Behördenanwendungen', 'keinerlei Nutzerdaten', 'anonym', 'grenzüberschreitende', 'Privatsphäre'],
  ja: ['政府向け', 'ユーザー情報を一切保持しない', '匿名', '越境通信', 'プライバシー'],
};

describe('Privacy and government-approval notice', () => {
  it.each(locales)('%s states approval, zero retention, anonymity and privacy priority', (locale) => {
    const notice = governmentComplianceCopy[locale].privacy;
    for (const fragment of required[locale]) {
      expect(notice.toLowerCase(), `${locale} keeps "${fragment}"`).toContain(fragment.toLowerCase());
    }
  });

  // Owner-supplied October 23 addition: the NSA Top Secret cryptographic
  // standard mention, polished and rendered in every native locale.
  const nsaFragments: Record<(typeof locales)[number], string[]> = {
    en: ['national security agency', 'top secret'],
    es: ['agencia de seguridad nacional', 'top secret'],
    tl: ['national security agency', 'top secret'],
    zh: ['国家安全局', '绝密'],
    de: ['national security agency', 'top secret'],
    ja: ['国家安全保障局', 'トップシークレット'],
  };

  it.each(locales)('%s mentions the NSA Top Secret cryptographic standard', (locale) => {
    const notice = governmentComplianceCopy[locale].privacy;
    for (const fragment of nsaFragments[locale]) {
      expect(notice.toLowerCase(), `${locale} keeps "${fragment}"`).toContain(fragment.toLowerCase());
    }
  });

  it('renders on the Overview screen directly under the Communication Matrix headline', () => {
    const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
    const headline = source.indexOf('{text.headline}');
    const privacy = source.indexOf('data-privacy-notice');
    const compliance = source.indexOf('{complianceText.privacy}');
    const overview = source.indexOf('{travel.overview}');
    expect(headline).toBeGreaterThan(-1);
    expect(privacy).toBeGreaterThan(headline);
    expect(compliance).toBeGreaterThan(headline);
    // The band sits between the headline and the long overview paragraph.
    expect(privacy).toBeLessThan(overview);
  });
});
