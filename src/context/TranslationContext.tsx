import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { defaultBillingPreferences } from '@/lib/pricing';
import { normalizeReferral, REFERRAL_STORAGE_KEY, resolveInitialLanguage, TIER_SESSION_KEY } from '@/lib/translation-state';

type TranslationState = {
  activeLanguage: string;
  activeCountry: string | undefined;
  affiliateToken: string | null;
  isTierActive: boolean;
  activeTierType: string;
  isAutoPayEnabled: boolean;
  setLanguage: (language: string, country?: string) => void;
  setAffiliateToken: (value: string | null) => void;
  setAutoPayEnabled: (value: boolean) => void;
  recordVerifiedTier: (active: boolean, tier?: string) => void;
};
const TranslationContext = createContext<TranslationState | null>(null);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [activeCountry, setActiveCountry] = useState<string>();
  const [affiliateToken, setReferral] = useState<string | null>(null);
  const [isTierActive, setTierActive] = useState(false);
  const [activeTierType, setTierType] = useState('none');
  const [isAutoPayEnabled, setAutoPayEnabled] = useState<boolean>(defaultBillingPreferences.autoPay);

  useEffect(() => {
    try {
      setActiveLanguage(resolveInitialLanguage(localStorage.getItem('user_locale'), document.cookie, navigator.language));
      setActiveCountry(localStorage.getItem('pricing_country') ?? undefined);
      const query = new URLSearchParams(window.location.search);
      const incoming = normalizeReferral(query.get('ref') ?? query.get('affiliate'));
      const saved = normalizeReferral(localStorage.getItem(REFERRAL_STORAGE_KEY));
      setReferral(incoming ?? saved);
      if (incoming) localStorage.setItem(REFERRAL_STORAGE_KEY, incoming);
      // A browser cache is never authority for paid access. Discard stale tokens.
      sessionStorage.removeItem(TIER_SESSION_KEY);
    } catch { /* Storage may be blocked; all controls remain session-local. */ }
  }, []);

  const setLanguage = (language: string, country?: string) => {
    setActiveLanguage(language); setActiveCountry(country);
  };
  const setAffiliateToken = (value: string | null) => {
    const normalized = normalizeReferral(value);
    setReferral(normalized);
    try {
      if (normalized) localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
      else localStorage.removeItem(REFERRAL_STORAGE_KEY);
    } catch { /* Local state still works. */ }
  };
  const recordVerifiedTier = (active: boolean, tier = 'none') => {
    setTierActive(active); setTierType(active ? tier : 'none');
    try { sessionStorage.setItem(TIER_SESSION_KEY, JSON.stringify({ active, tier: active ? tier : 'none' })); } catch { /* Advisory cache only. */ }
  };
  return <TranslationContext.Provider value={{ activeLanguage, activeCountry, affiliateToken, isTierActive, activeTierType, isAutoPayEnabled, setLanguage, setAffiliateToken, setAutoPayEnabled, recordVerifiedTier }}>{children}</TranslationContext.Provider>;
}

export function useTranslationState() { return useContext(TranslationContext); }