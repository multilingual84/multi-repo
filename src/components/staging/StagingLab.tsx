import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import FlagBanner from '@/components/FlagBanner';
import DepartmentContacts from '@/components/DepartmentContacts';
import { ALL_FLAGS, type FlagEntry } from '@/lib/flag-catalog';
import { withTranslationVeil } from '@/lib/translation-veil';
import { stagingPackages, AUTO_PAY_DEFAULT, PROCESSING_FEE_CENTS, REFERRAL_HOLD_DAYS, normalizeReferralCode, type StagingPackageId } from '@/lib/staging/pricing';
import { getStagingAccount, stageRoom, createStagingCheckout, confirmStagingCheckout, claimDownload, claimDownloads } from '@/lib/staging/staging.functions';
import tradeRealtor from '@/assets/trade-realtor.jpg';
import tradeRoofer from '@/assets/trade-roofer.jpg';
import tradeLandscaper from '@/assets/trade-landscaper.jpg';
import tradeRemodel from '@/assets/trade-remodel.jpg';
import StagingSignIn from './StagingSignIn';
import ReferralQr from './ReferralQr';
import { currencyForCountry, formatLocal, countryFromLanguage, normalizeCountry } from '@/lib/staging/local-pricing';

const REFERRAL_KEY = 'bt-referral';
const MAX_PRODUCTS = 5;

// Placeholder text for the notes textarea, translated to the user's language.
const PLACEHOLDER_TRANSLATIONS: Record<string, string> = {
  en: 'Optional notes — applied to every photo in the batch',
  es: 'Notas opcionalmente — aplicadas a cada foto del lote',
  zh: '可选备注——应用于批次中的每张照片',
  de: 'Optionale Hinweise — auf jedes Foto der Batch angewendet',
  fr: 'Notes optionnelles — appliquées à chaque photo du lot',
  pt: 'Notas optionais — aplicadas a cada foto do lote',
  ru: 'Дополнительные замечания — применяются к каждому фото в партии',
  ja: 'オプションのメモ—バッチのすべての画像に適用されます',
  ko: '선택적 메모—배치의 모든 사진에 적용됩니다',
  ar: 'ملاحظاتختياريّة—تُطبق على كل صورة في الدفعة',
  hi: 'वैकल्पिक टिप्पणियाँ — हर तस्वीर में लागू होती हैं',
};

const SHOWCASE = [
  { src: tradeRealtor, title: 'Realtors', text: 'Empty rooms become move-in-ready listing photos before the open house.' },
  { src: tradeRoofer, title: 'Roofers & exterior pros', text: 'Show the homeowner their new roof, siding or garage door right in the driveway.' },
  { src: tradeLandscaper, title: 'Landscapers & outdoor living', text: 'Turn bare dirt into turf, pavers and pools while you quote the job.' },
  { src: tradeRemodel, title: 'Remodelers & designers', text: 'Drop in the exact cabinets, tile and finishes your client is choosing.' },
] as const;

/** Top-level trades — realtors first, then specialty trades */
const TRADES = [
  { id: 'realtor', label: 'Realtors & Staging' },
  { id: 'exterior', label: 'Exterior & Curb Appeal' },
  { id: 'outdoor', label: 'Outdoor Living' },
  { id: 'interior', label: 'Interior Remodel' },
] as const;

type TradeId = (typeof TRADES)[number]['id'];

type Workflow = {
  id: string;
  label: string;
  roomType: 'residential' | 'commercial' | 'rental';
  style: string;
  prompt: string;
};

const WORKFLOWS: Record<TradeId, Workflow[]> = {
  realtor: [
    { id: 'res-modern', label: 'Residential · Modern', roomType: 'residential', style: 'modern', prompt: 'Virtually stage this empty residential room with modern furniture, clean lines, neutral palette, MLS-ready photorealistic listing photo.' },
    { id: 'res-luxury', label: 'Residential · Luxury', roomType: 'residential', style: 'luxury', prompt: 'Virtually stage this empty residential room in a luxury style — high-end furniture, elegant lighting, premium finishes, MLS-ready.' },
    { id: 'res-farm', label: 'Residential · Farmhouse', roomType: 'residential', style: 'farmhouse', prompt: 'Virtually stage this empty residential room in warm farmhouse style — wood tones, cozy textiles, inviting and lived-in look.' },
    { id: 'res-scandi', label: 'Residential · Scandinavian', roomType: 'residential', style: 'scandinavian', prompt: 'Virtually stage this empty residential room in Scandinavian style — light woods, soft neutrals, minimal clutter, bright and airy.' },
    { id: 'commercial', label: 'Commercial Space', roomType: 'commercial', style: 'modern', prompt: 'Virtually stage this empty commercial space with professional modern furniture suitable for office or retail listing photos.' },
    { id: 'str', label: 'Short-Term Rental', roomType: 'rental', style: 'modern', prompt: 'Virtually stage this short-term rental space to look inviting for guests — stylish, practical furniture, warm lighting, Airbnb-ready.' },
    { id: 'res-coastal', label: 'Coastal / Beach', roomType: 'residential', style: 'coastal', prompt: 'Virtually stage this empty room in coastal style — light blues, whites, natural textures, relaxed beach-home feel.' },
    { id: 'res-trad', label: 'Traditional', roomType: 'residential', style: 'traditional', prompt: 'Virtually stage this empty residential room in classic traditional style — timeless furniture, warm woods, balanced and formal.' },
  ],
  exterior: [
    { id: 'garage', label: 'Garage Doors', roomType: 'residential', style: 'modern', prompt: 'Show this home exterior with attractive modern garage doors installed. Keep architecture, driveway, and landscaping identical. Photorealistic curb-appeal photo for a contractor or realtor listing.' },
    { id: 'roofing', label: 'Roofing & Shingles', roomType: 'residential', style: 'modern', prompt: 'Show this home with a clean new roof and quality shingles. Keep walls, windows, and landscaping identical. Photorealistic before/after style curb-appeal image for a roofing contractor.' },
    { id: 'siding', label: 'Siding & Exterior Trim', roomType: 'residential', style: 'modern', prompt: 'Show this home with refreshed siding and crisp exterior trim. Keep roof, windows, and structure identical. Photorealistic exterior upgrade visualization.' },
    { id: 'windows', label: 'Windows & Entry Doors', roomType: 'residential', style: 'modern', prompt: 'Show this home with upgraded windows and a stylish entry door. Keep overall architecture and landscaping identical. Photorealistic curb-appeal photo.' },
    { id: 'driveway', label: 'Driveways & Pavers', roomType: 'residential', style: 'modern', prompt: 'Show this property with a clean new driveway or decorative pavers. Keep the house and existing landscaping identical. Photorealistic exterior improvement photo.' },
    { id: 'fence', label: 'Fences & Gates', roomType: 'residential', style: 'modern', prompt: 'Show this property with an attractive new fence and gate. Keep the house and major landscaping identical. Photorealistic outdoor improvement photo.' },
    { id: 'paint', label: 'Exterior Painting', roomType: 'residential', style: 'modern', prompt: 'Show this home with a fresh professional exterior paint job in a tasteful modern color scheme. Keep architecture, windows, and landscaping identical. Photorealistic curb-appeal visualization.' },
  ],
  outdoor: [
    { id: 'landscape', label: 'Landscaping & Turf', roomType: 'residential', style: 'modern', prompt: 'Show this outdoor area with professional landscaping and lush artificial or natural turf. Keep the house structure identical. Photorealistic backyard makeover photo.' },
    { id: 'pool', label: 'Pools & Spas', roomType: 'residential', style: 'luxury', prompt: 'Show this backyard with a beautiful pool or spa installed, clean water, and inviting deck area. Keep the house identical. Photorealistic outdoor living visualization.' },
    { id: 'deck', label: 'Decks, Patios & Pergolas', roomType: 'residential', style: 'modern', prompt: 'Show this outdoor space with a quality deck, patio, or pergola. Keep the house structure identical. Photorealistic outdoor living photo for a contractor or listing.' },
    { id: 'lighting', label: 'Outdoor Lighting', roomType: 'residential', style: 'modern', prompt: 'Show this exterior or backyard with professional outdoor lighting — path lights, accent lights, warm evening glow. Keep architecture identical. Photorealistic night or dusk curb-appeal photo.' },
  ],
  interior: [
    { id: 'kitchen', label: 'Kitchen Cabinets & Counters', roomType: 'residential', style: 'modern', prompt: 'Show this kitchen with updated cabinets and countertops in a modern style. Keep walls, windows, and overall layout identical. Photorealistic kitchen remodel visualization.' },
    { id: 'flooring', label: 'Flooring & Tile', roomType: 'residential', style: 'modern', prompt: 'Show this room with new high-quality flooring or tile. Keep walls, windows, and furniture layout identical where possible. Photorealistic flooring upgrade photo.' },
    { id: 'garage-floor', label: 'Garage Floor Epoxy & Storage', roomType: 'residential', style: 'industrial', prompt: 'Show this garage with a clean epoxy floor coating and organized storage. Keep structure and doors identical. Photorealistic garage improvement photo for a contractor.' },
    { id: 'bathroom', label: 'Bathroom Remodeling', roomType: 'residential', style: 'modern', prompt: 'Show this bathroom with a modern remodel — updated vanity, tile, fixtures. Keep overall footprint and windows identical. Photorealistic bathroom remodel visualization.' },
  ],
};

type Account = Awaited<ReturnType<typeof getStagingAccount>>;

function clearTranslateCookies() {
  const host = window.location.hostname;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  for (const domain of ['', `; domain=${host}`, `; domain=.${host}`]) document.cookie = `googtrans=; ${expire}; path=/${domain}`;
}

function translatePage(lang: string) {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (lang === 'en') {
    const translated = Boolean(combo?.value) || /googtrans=\/en\/[^;]/.test(document.cookie);
    if (!translated) return;
    withTranslationVeil(() => { clearTranslateCookies(); window.location.reload(); });
    return;
  }
  withTranslationVeil(() => {
    clearTranslateCookies();
    document.cookie = `googtrans=/en/${lang}; path=/`;
    if (combo) { combo.value = lang; combo.dispatchEvent(new Event('change', { bubbles: true })); return; }
    let tries = 0;
    const timer = window.setInterval(() => {
      const c = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (c) { window.clearInterval(timer); c.value = lang; c.dispatchEvent(new Event('change', { bubbles: true })); }
      else if (++tries > 40) window.clearInterval(timer);
    }, 250);
  });
}

async function shrinkPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, 1536 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function watermark(src: string, text: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0);
  ctx.save();
  ctx.font = `bold ${Math.round(img.width / 18)}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.translate(img.width / 2, img.height / 2);
  ctx.rotate(-Math.PI / 6);
  ctx.fillText(text, 0, 0);
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.9);
}

export default function StagingLab() {
  const [session, setSession] = useState<Session | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [trade, setTrade] = useState<TradeId>('realtor');
  const [workflowId, setWorkflowId] = useState<string>(WORKFLOWS.realtor[0]!.id);
  const [notes, setNotes] = useState(WORKFLOWS.realtor[0]!.prompt);
  type BatchItem = {
    id: string;
    original: string;
    staged: string | null;
    clean: string | null;
    status: 'ready' | 'working' | 'done' | 'error';
    error?: string | undefined;
  };
  const [batch, setBatch] = useState<BatchItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const MAX_BATCH = 10;
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [autoPay, setAutoPay] = useState<boolean>(AUTO_PAY_DEFAULT);
  const [buying, setBuying] = useState<StagingPackageId | null>(null);
  const [locale, setLocale] = useState('en');
  const [country, setCountry] = useState<string | null>(null);
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  const currency = currencyForCountry(country);
  const placeholderText = PLACEHOLDER_TRANSLATIONS[locale] ?? PLACEHOLDER_TRANSLATIONS['en'];
  const watermarkText = `Pay ${formatLocal(99, currency)} to download`;
  const fileRef = useRef<HTMLInputElement>(null);
  const productRef = useRef<HTMLInputElement>(null);
  const viewfinderRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<string[]>([]);

  const loadAccount = useServerFn(getStagingAccount);
  const runStaging = useServerFn(stageRoom);
  const startCheckout = useServerFn(createStagingCheckout);
  const confirmCheckout = useServerFn(confirmStagingCheckout);
  const claimClean = useServerFn(claimDownload);
  const claimMany = useServerFn(claimDownloads);

  const refreshAccount = useCallback(async () => {
    try {
      setAccount(await loadAccount({ data: { referral: localStorage.getItem(REFERRAL_KEY) } }));
    } catch {
      /* shown on next action */
    }
  }, [loadAccount]);

  useEffect(() => {
      const ref = normalizeReferralCode(new URLSearchParams(window.location.search).get('ref'));
      if (ref) localStorage.setItem(REFERRAL_KEY, ref);
      void supabase.auth.getSession().then(({ data }) => setSession(data.session));
      const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
      if (!document.getElementById('google-translate-script')) {
        (window as unknown as { stagingTranslateInit: () => void }).stagingTranslateInit = () => {
          const g = (window as unknown as { google: { translate: { TranslateElement: new (o: object, id: string) => void } } }).google;
          new g.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'staging_translate_element');
        };
        const sc = document.createElement('script');
        sc.id = 'google-translate-script';
        sc.src = 'https://translate.google.com/translate_a/element.js?cb=stagingTranslateInit';
        document.body.appendChild(sc);
      }
      const saved = localStorage.getItem('bt-locale');
      if (saved) setLocale(saved);
      setCountry(normalizeCountry(localStorage.getItem('bt-country')) ?? countryFromLanguage(navigator.language));
      const savedFree = localStorage.getItem('bt-free-generations');
      if (savedFree) setFreeGenerationsUsed(parseInt(savedFree, 10));
      return () => data.subscription.unsubscribe();
    }, []);

  useEffect(() => {
    if (!session) {
      setAccount(null);
      return;
    }
    void refreshAccount();
    const params = new URLSearchParams(window.location.search);
    const status = params.get('staging_checkout');
    const sessionId = params.get('session_id');
    if (status) window.history.replaceState(null, '', window.location.pathname);
    if (status === 'cancelled') setMessage({ tone: 'error', text: 'Checkout cancelled — nothing was charged.' });
    if (status === 'success' && sessionId) {
      void confirmCheckout({ data: { sessionId } })
        .then(r => {
          setMessage(
            r.ok
              ? { tone: 'ok', text: `Payment received — ${r.pics} pictures added to your balance.` }
              : { tone: 'error', text: 'Payment is still processing. Your pictures appear as soon as Stripe confirms it.' }
          );
          void refreshAccount();
        })
        .catch(() => setMessage({ tone: 'error', text: 'We could not confirm that checkout yet. Refresh in a moment.' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  const onFlag = (flag: FlagEntry) => {
    setLocale(flag.lang);
    setCountry(flag.country);
    try {
      localStorage.setItem('bt-locale', flag.lang);
      localStorage.setItem('bt-country', flag.country);
    } catch {
      /* private mode */
    }
    translatePage(flag.lang);
  };

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    setMessage(null);
    const room = MAX_BATCH - batch.length;
    if (room <= 0) {
      setMessage({ tone: 'error', text: 'Batch is full (10 photos). Generate or clear some, then add more.' });
      return;
    }
    const slice = list.slice(0, room);
    if (list.length > room) {
      setMessage({ tone: 'ok', text: `Added ${slice.length} photos. Max 10 per batch — run these, then upload the next 10.` });
    }
    const additions: typeof batch = [];
    for (const file of slice) {
      const shrunk = await shrinkPhoto(file);
      additions.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        original: shrunk,
        staged: null,
        clean: null,
        status: 'ready',
      });
    }
    setBatch(prev => {
      const next = [...prev, ...additions];
       if (!activeId && next.length) setActiveId(next[next.length - 1]!.id);
      return next;
    });
    if (!activeId && additions.length) setActiveId(additions[0]!.id);
  }

  async function runGenerate() {
    const pending = batch.filter(b => b.status === 'ready' || b.status === 'error');
    if (!pending.length) {
      setMessage({ tone: 'error', text: batch.length ? 'All photos in this batch are already generated. Upload more or hit Redo on one.' : 'Upload up to 10 photos first.' });
      return;
    }
    // Allow up to 10 free generations without sign-in.
    if (!session && freeGenerationsUsed >= 10) {
      setSignInOpen(true);
      setMessage({ tone: 'error', text: 'You have used your 10 free photos. Sign in to continue.' });
      return;
    }
    if (session && account && account.freeDownloadsLeft === 0 && account.credits === 0) {
      setMessage({ tone: 'error', text: 'You have used your 10 free photos. Buy more credits to continue.' });
      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    setBusy(true);
    setMessage(null);
    const wf = WORKFLOWS[trade].find(w => w.id === workflowId) ?? WORKFLOWS[trade][0]!;

    for (const item of pending) {
      setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'working', error: undefined } : b));
      setActiveId(item.id);
      try {
        const result = await runStaging({ data: { image: item.original, roomType: wf.roomType, style: wf.style, notes, products } });
        if (!result.ok) {
          setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'error', error: 'Staging failed' } : b));
        } else {
                  const preview = await watermark(result.image, watermarkText);
                  setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'done', clean: result.image, staged: preview } : b));
                  if (!session) {
                    setFreeGenerationsUsed(prev => {
                      const next = prev + 1;
                      localStorage.setItem('bt-free-generations', String(next));
                      return next;
                    });
                  }
                }
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Staging failed';
        setBatch(prev => prev.map(b => b.id === item.id ? { ...b, status: 'error', error: msg } : b));
      }
    }
    void refreshAccount();
    setBusy(false);
    setMessage({ tone: 'ok', text: 'Batch finished. Download clean photos (first 10 free), or upload another 10.' });
  }

  async function redoOne(id: string) {
    if (!session) { setSignInOpen(true); return; }
    const item = batch.find(b => b.id === id);
    if (!item) return;
    setBusy(true);
    setActiveId(id);
    setBatch(prev => prev.map(b => b.id === id ? { ...b, status: 'working', error: undefined, staged: null, clean: null } : b));
    const wf = WORKFLOWS[trade].find(w => w.id === workflowId) ?? WORKFLOWS[trade][0]!;
    try {
          const result = await runStaging({ data: { image: item.original, roomType: wf.roomType, style: wf.style, notes, products } });
          if (!result.ok) {
            setBatch(prev => prev.map(b => b.id === id ? { ...b, status: 'error', error: 'Staging failed' } : b));
          } else {
            const preview = await watermark(result.image, watermarkText);
            setBatch(prev => prev.map(b => b.id === id ? { ...b, status: 'done', clean: result.image, staged: preview } : b));
          }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Staging failed';
      setBatch(prev => prev.map(b => b.id === id ? { ...b, status: 'error', error: msg } : b));
    }
    void refreshAccount();
    setBusy(false);
  }

  async function handleDownload(id?: string) {
    const target = batch.find(b => b.id === (id ?? activeId));
    if (!target?.clean) return;
    if (!session) { setSignInOpen(true); return; }
    setUnlocking(true);
    setMessage(null);
    try {
      const claim = await claimClean({ data: {} as never });
      if (!claim.ok) {
        setMessage({ tone: 'error', text: 'You need a picture credit to download. Pick a package below.' });
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const a = document.createElement('a');
      a.href = target.clean;
      a.download = `multilingual-staged-${target.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMessage({ tone: 'ok', text: 'Clean photo unlocked and downloading.' });
      void refreshAccount();
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Could not unlock download.' });
    } finally {
      setUnlocking(false);
    }
  }

  async function handleProducts(files: FileList) {
    const list = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, MAX_PRODUCTS - products.length);
    if (!list.length) return;
    const shrunk = await Promise.all(list.map(f => shrinkPhoto(f)));
    setProducts(prev => [...prev, ...shrunk].slice(0, MAX_PRODUCTS));
  }

  async function downloadAll() {
    const ready = batch.filter(b => b.status === 'done' && b.clean);
    if (!ready.length) return;
    if (!session) { setSignInOpen(true); return; }
    setUnlocking(true);
    setMessage(null);
    try {
      const { granted } = await claimMany({ data: { count: ready.length } });
      if (granted === 0) {
        setMessage({ tone: 'error', text: 'You need picture credits to download. Pick a package below.' });
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      for (const item of ready.slice(0, granted)) {
        const a = document.createElement('a');
        a.href = item.clean!;
        a.download = `multilingual-staged-${item.id}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        await new Promise(r => setTimeout(r, 350));
      }
      setMessage(granted < ready.length
        ? { tone: 'error', text: `Downloaded ${granted} of ${ready.length} photos. Pick a package below to download the rest.` }
        : { tone: 'ok', text: `${granted} clean photo${granted === 1 ? '' : 's'} downloading.` });
      void refreshAccount();
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Could not download images.' });
    } finally {
      setUnlocking(false);
    }
  }

  function removeFromBatch(id: string) {
    setBatch(prev => {
      const next = prev.filter(b => b.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  }

  function clearBatch() {
    setBatch([]);
    setActiveId(null);
  }

  async function buy(packageId: StagingPackageId) {
    if (!session) {
      setSignInOpen(true);
      return;
    }
    setBuying(packageId);
    try {
      const { url } = await startCheckout({
        data: {
          packageId,
          autoPay,
          origin: window.location.origin,
          referral: localStorage.getItem(REFERRAL_KEY),
          country,
        },
      });
      window.location.assign(url);
    } catch (error) {
      setMessage({ tone: 'error', text: error instanceof Error ? error.message : 'Checkout is unavailable right now.' });
      setBuying(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-stage-bg text-stage-ink antialiased">
      <div id="staging_translate_element" className="hidden" />

      {/* Top bar */}
      <div className="bg-stage-gold px-4 py-2 text-center text-xs font-bold tracking-wide text-stage-gold-ink">
        First 10 photos free · No credit card required · Cancel anytime
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-stage-line bg-stage-panel/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="text-lg font-black tracking-tight text-stage-gold sm:text-xl" translate="no">
          Multi-Lingual.tech
        </div>
        <div className="flex items-center gap-2 text-xs">
          {session ? (
            <>
              <span className="rounded-full border border-stage-line bg-stage-deep px-3 py-1.5 font-mono font-bold text-stage-gold transition-all duration-300">
                {account ? (account.freeDownloadsLeft > 0 ? `${account.freeDownloadsLeft} free · ${account.credits} paid` : `${account.credits} left`) : '…'}
              </span>
              <button
                onClick={() => void supabase.auth.signOut()}
                className="rounded-full border border-stage-line px-3 py-1.5 font-medium text-stage-muted transition hover:border-stage-gold hover:text-stage-ink"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => setSignInOpen(true)}
              className="rounded-full bg-stage-gold px-4 py-2 text-xs font-bold tracking-wide text-stage-gold-ink transition hover:bg-stage-gold-soft"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Flags */}
      <div className="relative mx-auto mt-5 w-full max-w-3xl px-3">
        <FlagBanner microphone={false} flags={ALL_FLAGS} locale={locale} onSelect={onFlag} />
      </div>

      {/* Hero copy */}
      <section className="mx-auto mt-8 w-full max-w-xl px-4 text-center animate-in fade-in duration-500">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Visual upgrades for realtors & trade pros — in any language
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stage-muted">
          Upload a photo. Pick your trade and a pre-built workflow. Generate listing-ready or client-ready images in about a minute.
        </p>
        <p
                  id="cta-free-photos"
                  className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400 cursor-pointer"
                  onClick={() => viewfinderRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Camera className="h-4 w-4" />
                  Get your free 10 photos
                </p>
      </section>

      {/* Showcase — who it's for */}
      <section className="mx-auto mt-8 w-full max-w-3xl px-4">
        <div className="grid grid-cols-2 gap-3">
          {SHOWCASE.map(card => (
            <figure key={card.title} className="overflow-hidden rounded-2xl border border-stage-line bg-stage-panel">
              <img src={card.src} alt={card.title} width={1024} height={768} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <figcaption className="p-3">
                <div className="text-xs font-black text-stage-ink sm:text-sm">{card.title}</div>
                <p className="mt-1 text-[11px] leading-snug text-stage-muted sm:text-xs">{card.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-stage-muted">
          Show clients the finished job before you start it. Close more listings and win more bids — no designer, no photo shoot, no monthly contract.
        </p>
      </section>

      {/* Why we win */}
      <section className="mx-auto mt-8 w-full max-w-3xl px-4">
        <div className="rounded-2xl border border-stage-line bg-stage-panel p-6">
          <h2 className="text-lg font-black tracking-tight text-stage-gold">
            Why Multi-Lingual beats legacy staging systems
          </h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-stage-muted">
            <li>First multi-lingual virtual staging platform — speak to clients in their language.</li>
            <li>Instant generation in about a minute, no photo shoot required.</li>
            <li>Pay as you go — only pay for the photos you download.</li>
            <li>Continuous improvements and new styles added weekly.</li>
          </ul>
          <p className="mt-4 text-xs font-semibold text-stage-gold">
            We continue to improve our product and stay with us!
          </p>
        </div>
      </section>

      {/* STEP 1 — Tabs + Styles (must pass before generate) */}
      <div className="mx-auto mt-8 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-stage-muted">
          1 · Choose your trade
        </p>
        <div role="tablist" className="grid grid-cols-2 gap-1.5 rounded-2xl border border-stage-line bg-stage-panel p-1.5 sm:grid-cols-4">
          {TRADES.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={trade === t.id}
              onClick={() => {
                setTrade(t.id);
                const first = WORKFLOWS[t.id][0]!;
                setWorkflowId(first.id);
                setNotes(first.prompt);
              }}
              className={`rounded-xl py-2.5 text-center text-[11px] font-bold leading-tight transition-all duration-200 sm:text-xs ${
                trade === t.id
                  ? 'bg-stage-gold text-stage-gold-ink shadow-sm scale-[1.02]'
                  : 'text-stage-muted hover:text-stage-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="mb-2 mt-5 text-center text-[11px] font-bold uppercase tracking-widest text-stage-muted">
          2 · Pick a workflow (pre-built prompt)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {WORKFLOWS[trade].map(w => (
            <button
              key={w.id}
              aria-pressed={workflowId === w.id}
              onClick={() => {
                setWorkflowId(w.id);
                setNotes(w.prompt);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200 ${
                workflowId === w.id
                  ? 'border-stage-gold bg-stage-gold/10 text-stage-gold scale-105'
                  : 'border-stage-line text-stage-muted hover:border-stage-gold/50 hover:text-stage-ink'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 2 — Big viewfinder */}
      <main className="mx-auto mt-8 w-full max-w-2xl flex-1 px-4 pb-16">
        <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-widest text-stage-muted">
          3 · Upload photos (up to 10 per batch)
        </p>

        {/* Thumbnail strip */}
        {batch.length > 0 && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
            {batch.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  activeId === item.id ? 'border-stage-gold scale-105' : 'border-stage-line opacity-80 hover:opacity-100'
                }`}
              >
                <img src={item.staged ?? item.original} alt="" className="h-full w-full object-cover" />
                {item.status === 'working' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[10px] font-bold text-white">…</span>
                )}
                {item.status === 'done' && (
                  <span className="absolute bottom-0 right-0 rounded-tl bg-stage-gold px-1 text-[9px] font-bold text-stage-gold-ink">✓</span>
                )}
                {item.status === 'error' && (
                  <span className="absolute bottom-0 right-0 rounded-tl bg-red-500 px-1 text-[9px] font-bold text-white">!</span>
                )}
              </button>
            ))}
            {batch.length < MAX_BATCH && !busy && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-stage-line text-lg text-stage-muted hover:border-stage-gold"
              >
                +
              </button>
            )}
            <button type="button" onClick={clearBatch} className="ml-auto shrink-0 text-[11px] text-stage-muted underline">
              Clear batch
            </button>
          </div>
        )}

        <div
                  ref={viewfinderRef}
                  onClick={() => !busy && batch.length < MAX_BATCH && fileRef.current?.click()}
                  className={`relative flex min-h-[420px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed bg-stage-panel transition-all duration-300 ${
                    batch.length ? 'border-stage-line' : 'border-stage-line hover:border-stage-gold hover:scale-[1.01]'
                  }`}
                >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => {
              const files = e.target.files;
              e.target.value = '';
              if (files?.length) void handleFiles(files);
            }}
          />

          {batch.length === 0 && (
            <div className="space-y-4 px-6 text-center animate-in fade-in duration-500">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stage-deep text-3xl">
                📷
              </div>
              <p className="text-base font-bold tracking-tight">
                Upload up to 10 photos at once
              </p>
              <p className="text-xs text-stage-muted">
                Same workflow and prompt applied to every photo in the batch. Then run another 10.
              </p>
              <div className="flex justify-center gap-3 pt-1">
                <span className="rounded-full border border-stage-line px-3 py-1 text-[11px] font-medium text-stage-muted">
                  Multi-select
                </span>
                <span className="rounded-full border border-stage-line px-3 py-1 text-[11px] font-medium text-stage-muted">
                  Same product / cleanup
                </span>
              </div>
            </div>
          )}

          {batch.length > 0 && (() => {
            const active = batch.find(b => b.id === activeId) ?? batch[0];
            if (!active) return null;
            return (
              <div className="relative w-full animate-in zoom-in-95 duration-300">
                <img
                  src={active.staged ?? active.original}
                  alt={active.staged ? 'Staged photo' : 'Original photo'}
                  className={`w-full rounded-2xl object-contain transition-all duration-500 ${active.status === 'working' ? 'scale-[1.02] blur-[2px]' : 'scale-100'}`}
                />
                {active.status === 'working' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="rounded-xl bg-stage-deep/90 px-4 py-2.5 text-sm font-bold text-stage-gold shadow-lg animate-pulse">
                      Working on this photo…
                    </span>
                  </div>
                )}
                {active.staged && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rotate-[-18deg] text-2xl font-black tracking-widest text-white/25 select-none sm:text-3xl">
                      PREVIEW
                    </span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <p className="mt-2 text-center text-[11px] text-stage-muted">
          {batch.length}/{MAX_BATCH} in this batch
          {busy ? ' · Processing…' : ''}
        </p>

        {/* Optional trade products */}
        <div className="mt-4 rounded-2xl border border-stage-line bg-stage-panel p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-stage-muted">
            Your products (optional · up to {MAX_PRODUCTS})
          </p>
          <p className="mt-1 text-xs text-stage-muted">
            Upload photos of your raw product — a garage door, shingle, cabinet, tile, paver or furniture piece — and we place it into every photo in the batch.
          </p>
          <input
            ref={productRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={e => {
              const files = e.target.files;
              e.target.value = '';
              if (files?.length) void handleProducts(files);
            }}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {products.map((p, i) => (
              <div key={i} className="relative h-16 w-16 overflow-hidden rounded-xl border border-stage-line">
                <img src={p} alt={`Product ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  aria-label={`Remove product ${i + 1}`}
                  onClick={() => setProducts(prev => prev.filter((_, j) => j !== i))}
                  className="absolute right-0 top-0 rounded-bl bg-stage-deep/90 px-1.5 text-xs font-bold text-stage-ink"
                >
                  ×
                </button>
              </div>
            ))}
            {products.length < MAX_PRODUCTS && (
              <button
                type="button"
                disabled={busy}
                onClick={() => productRef.current?.click()}
                className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-orange-500 bg-orange-500/10 px-4 text-xs font-semibold text-orange-500 hover:bg-orange-500 hover:text-white disabled:opacity-50"
              >
                + Add product photo
              </button>
            )}
          </div>
        </div>

        {/* Notes + Generate / Redo */}
        <div className="mt-5 space-y-3">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value.slice(0, 600))}
            placeholder={placeholderText}
            className="w-full rounded-2xl border border-stage-line bg-stage-deep px-4 py-3 text-sm text-stage-ink placeholder:text-stage-muted focus:border-stage-gold focus:outline-none transition"
            rows={2}
          />

          <div className="grid grid-cols-2 gap-2">
            <button
                          onClick={() => void runGenerate()}
                          disabled={busy || batch.length === 0}
                          className="rounded-2xl bg-orange-500 py-3.5 text-sm font-black uppercase tracking-wider text-white transition-all duration-200 hover:bg-orange-400 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                        >
                          {busy ? 'Working…' : `Generate batch (${batch.filter(b => b.status === 'ready' || b.status === 'error').length || batch.length})`}
                        </button>
            <button
              onClick={() => activeId && void redoOne(activeId)}
              disabled={busy || !activeId}
              className="rounded-2xl border-2 border-stage-gold bg-stage-panel py-3.5 text-sm font-black uppercase tracking-wider text-stage-gold transition-all duration-200 hover:bg-stage-gold/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
            >
              {busy ? 'Working…' : 'Redo for free'}
            </button>
          </div>
          <button
            onClick={() => void downloadAll()}
            disabled={busy || unlocking || !batch.some(b => b.status === 'done')}
            className="w-full rounded-2xl border-2 border-stage-gold bg-stage-deep py-3.5 text-sm font-black uppercase tracking-wider text-stage-gold transition-all duration-200 hover:bg-stage-gold/10 disabled:opacity-50"
          >
            {unlocking ? 'Preparing downloads…' : `⬇ Download images (${batch.filter(b => b.status === 'done').length})`}
          </button>
          <p className="text-center text-[11px] text-stage-muted">
            Same prompt for the whole batch. Regenerations are free. First 10 clean downloads are free — then 1 credit each.
            {!session && ` · ${Math.max(0, 10 - freeGenerationsUsed)} free generations left`}
          </p>
        </div>

        {message && (
          <p
            role="status"
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm animate-in fade-in ${
              message.tone === 'ok' ? 'border-stage-gold text-stage-gold' : 'border-stage-danger text-stage-danger'
            }`}
          >
            {message.text}
          </p>
        )}

        {/* Per-photo actions for active */}
        {batch.some(b => b.status === 'done') && (
          <div className="mt-5 space-y-3 rounded-2xl border border-stage-line bg-stage-panel p-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-400">
            <h3 className="text-sm font-bold text-stage-gold">Batch results</h3>
            <p className="text-xs text-stage-muted">
              Previews are watermarked. Download uses 1 credit per clean photo (first 10 free).
            </p>
            <div className="space-y-2">
              {batch.filter(b => b.status === 'done').map(item => (
                <div key={item.id} className="flex items-center gap-2 rounded-xl border border-stage-line bg-stage-deep px-3 py-2">
                  <img src={item.staged ?? item.original} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className="flex-1 text-left text-xs font-semibold text-stage-ink"
                  >
                    Photo ready
                  </button>
                  <button
                    type="button"
                    disabled={unlocking}
                    onClick={() => void handleDownload(item.id)}
                    className="rounded-lg bg-stage-gold px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-stage-gold-ink disabled:opacity-60"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => void redoOne(item.id)}
                    disabled={busy}
                    className="rounded-lg border border-stage-line px-2 py-1.5 text-[10px] font-bold text-stage-muted"
                  >
                    Redo
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromBatch(item.id)}
                    className="text-[10px] text-stage-muted underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {batch.length < MAX_BATCH && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs font-semibold text-stage-gold underline"
              >
                Add more photos to this batch ({MAX_BATCH - batch.length} slots left)
              </button>
            )}
            {batch.length >= MAX_BATCH && (
              <p className="text-xs text-stage-muted">
                Batch full. Clear finished photos or start a new batch of 10 after downloads.
              </p>
            )}
          </div>
        )}

        {/* Pricing */}
        <section id="pricing" className="mt-10 space-y-3 rounded-2xl border border-stage-line bg-stage-panel p-5">
          <h2 className="text-center text-xs font-black uppercase tracking-widest text-stage-gold">
            Picture packages
          </h2>
          {stagingPackages.map(p => (
            <div
              key={p.id}
              className={`rounded-xl border p-4 transition ${
                p.id === 'volume' ? 'border-stage-gold bg-stage-deep' : 'border-stage-line bg-stage-deep'
              }`}
            >
              {p.id === 'volume' && (
                <div className="mb-2 inline-block rounded-md bg-stage-gold px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-stage-gold-ink">
                  Volume · Commercial · Resellers
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-sm font-bold">{p.name}</div>
                  <div className="text-xs text-stage-muted">
                    {p.pics} staged pictures{autoPay ? ' every month' : ''}
                  </div>
                </div>
                <div className="text-right font-mono text-lg font-bold text-stage-gold">
                  {formatLocal(p.amountCents, currency)}
                </div>
              </div>
              {p.audience && (
                <p className="mt-2 text-[11px] leading-relaxed text-stage-muted">
                  {p.audience} Mark it up and sell staging under your own brand.
                </p>
              )}
              <button
                disabled={buying !== null}
                onClick={() => void buy(p.id)}
                className="mt-3 w-full rounded-xl bg-stage-gold py-2.5 text-xs font-black uppercase tracking-wider text-stage-gold-ink transition hover:bg-stage-gold-soft disabled:opacity-60"
              >
                {buying === p.id ? 'Opening Stripe…' : 'Pay on Stripe'}
              </button>
            </div>
          ))}
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={autoPay}
              onChange={e => setAutoPay(e.target.checked)}
              className="mt-0.5 accent-stage-gold"
            />
            <span>Enable auto-pay — refill this package every month. Cancel anytime.</span>
          </label>
          <p className="text-[11px] text-stage-muted">
            A one-time processing fee of {formatLocal(PROCESSING_FEE_CENTS, currency)} is added at checkout.
          </p>
        </section>

        {/* Affiliate */}
        <section className="mt-8 space-y-3 rounded-2xl border border-stage-line bg-stage-panel p-5 text-center">
          <h2 className="text-xs font-black uppercase tracking-widest text-stage-gold">
            Partner program — 50/50 revenue split
          </h2>
          <p className="text-[11px] leading-relaxed text-stage-muted">
            Share your link with agents, brokers and photographers. Earn 50% of every package they buy — including every auto-pay refill. Earnings clear after {REFERRAL_HOLD_DAYS} days and pay out weekly.
          </p>
          {session && account ? (
            <ReferralQr code={account.referralCode} earnings={account.earnings} />
          ) : (
            <button
              onClick={() => setSignInOpen(true)}
              className="rounded-xl bg-stage-gold px-5 py-2.5 text-xs font-black uppercase tracking-wider text-stage-gold-ink transition hover:bg-stage-gold-soft"
            >
              Sign in to get your referral link
            </button>
          )}
        </section>
      </main>

      <div className="mx-auto w-full max-w-3xl px-4 pb-4">
        <DepartmentContacts locale="en" className="rounded-3xl border border-stage-line bg-stage-panel p-5 text-stage-ink sm:p-8" />
      </div>

      <footer className="mt-8 border-t border-stage-line bg-stage-deep px-4 py-6 text-center text-xs tracking-tight text-stage-muted">
        <p>© 2026 Multi-Lingual.tech · Bricktown Software Systems LLC</p>
        <p className="mt-1">
          Support:{' '}
          <a className="underline" href="mailto:support@multi-lingual.tech">
            support@multi-lingual.tech
          </a>{' '}
          · 629 West Main Street #1025, Oklahoma City, OK 73102
        </p>
      </footer>

      <StagingSignIn open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  );
}
