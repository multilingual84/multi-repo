import React, { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import heroTeam from '@/assets/hero-team.jpg';
import mlBannerWordmark from '@/assets/ml-banner-wordmark.png';
import { bannerTaglineCopy } from '@/lib/banner-copy';
import okcSkyline from '@/assets/okc-skyline.jpg';
import multiculturalBg from '@/assets/multicultural-bg.jpg';
import FlagBanner from '@/components/FlagBanner';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import {qrAccessCopy} from '@/lib/qr-access-copy';
import QrAccessButton from './QrAccessButton';
import ScheduleReminderMatrix from '@/components/ScheduleReminderMatrix';
import PassInterface, { usePassInterface } from '@/components/PassInterface';
import LobbyAdCard from '@/components/LobbyAdCard';
import { outreachCopy, outreachLocaleNames } from '@/lib/outreach-copy';
import type { UILocale } from '@/lib/ui-copy';
import { voicePassCopy } from '@/lib/voice-pass-copy';
import { passInterfaceCopy } from '@/lib/pass-interface-copy';
import MenuDiagnosis from '@/components/MenuDiagnosis';
import AffiliateQR from '@/components/AffiliateQR';
import WalkingTranslator from '@/components/WalkingTranslator';
import TalkingEnvironment from './TalkingEnvironment';
import MicrophonePermissionNotice from '@/components/MicrophonePermissionNotice';
import VenueQRPreview from '@/components/VenueQRPreview';
import { TellerAnnouncement, PublicBroadcastPreview } from '@/components/EcosystemPreview';
import { translatorCopy } from '@/lib/translator-copy';
import { paidPackages, defaultBillingPreferences, corporateName, stripeFixedProcessingFee } from '@/lib/pricing';
import { detectGeoPlan, formatGeoPrice, geoAmountFor, type GeoPlan } from '@/lib/geo-pricing';
import { getFlagPricePlan, formatFlagPackagePrice, formatFlagTotal } from '@/lib/flag-pricing';
import { canCheckoutCurrency } from '@/lib/country-currency';
import { Button } from '@/components/ui/button';
import { governmentComplianceCopy } from '@/lib/government-compliance-copy';
import DepartmentContacts from '@/components/DepartmentContacts';
import PrivateMessaging from '@/components/PrivateMessaging';
import { travelUtilityCopy, walkingTabLines, walkingTabTitle } from '@/lib/travel-utility-copy';
import MeetingRoomPreview from '@/components/MeetingRoomPreview';
import { meetingRoomCopy } from '@/lib/meeting-room-copy';
import AnswerCallScreen from '@/components/AnswerCallScreen';

import { formatSeats } from '@/lib/seat-copy';
import { unlimitedMinutesCopy } from '@/lib/unlimited-minutes-copy';
import { checkoutCopy } from '@/lib/checkout-copy';
import { packageDurationLabel, packagePersonalTranslatorLabel } from '@/lib/package-duration';
import { passShareCopy } from '@/lib/pass-share-copy';
import { uiCopy, carrierCopy } from '@/lib/ui-copy';
import { createPackageCheckout, confirmPackageCheckout, packageCheckoutPrices } from '@/lib/stripe.functions';
import { PRODUCTION_DOMAIN, STRIPE_LIVE_PUBLISHABLE_KEY } from '@/lib/config/stripePublic';
import { getCredentialHandle } from '@/lib/free-session';
import ComplaintDesk from '@/components/ComplaintDesk';
import { complaintCopy } from '@/lib/complaint-copy';
import { withTranslationVeil, showTranslationVeil, hideTranslationVeil, hideTranslationVeilWhenSettled } from '@/lib/translation-veil';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';
import QrWallet from '@/components/QrWallet';
import { communicationCopy } from '@/lib/communication-copy';

import SuggestionBox from '@/components/SuggestionBox';
import { isWalletSignedIn } from '@/lib/wallet/session-identity';
import {WalletCards,X} from 'lucide-react';
import {walletUiCopy} from '@/lib/wallet/ui-copy';
import {Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {useServerFn} from '@tanstack/react-start';
import {walletStateFn} from '@/lib/wallet/access.functions';
import WalletSignedIn from './WalletSignedIn';
import {walletClarityCopy} from '@/lib/wallet/clarity';
import {fleetCopy} from '@/lib/fleet-copy';



function clearGoogleTranslateCookies() {
  const host = window.location.hostname;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = `googtrans=; ${expire}; path=/`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=${host}`;
  document.cookie = `googtrans=; ${expire}; path=/; domain=.${host}`;
}

// The page used to sweep top-to-bottom after each language switch so off-screen
// sections translated early, but that visibly raced the whole page and lost the
// visitor's place. Now the page stays exactly where the visitor is; Google
// Translate fills in lower sections as they come into view.
function sweepForFullTranslation() {}

// Switch the whole page to a non-native language via Google Translate.
// Preferred path: drive the widget's own select in place (no reload), so the
// switch works even where the googtrans cookie or a reload is blocked, e.g.
// inside the preview frame. Fallback: cookie + reload on a fresh load.
const oneClickLabel = { en: '1 click', es: '1 clic', zh: '一键', de: '1 Klick', tl: '1 click', ja: '1クリック' } as const;

function setGoogleTranslate(lang: string) {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  // Widget already agrees and the cookie is in place for a revisit: just make
  // sure the whole page gets translated, not only what was on screen.
  if (combo && combo.value === lang && document.cookie.includes(`googtrans=/en/${lang}`)) {
    window.setTimeout(sweepForFullTranslation, 1500);
    return;
  }
  // Cover the page with a dark veil while the widget rewrites it, so the
  // visitor never sees English flash before the new language paints.
  withTranslationVeil(() => {
    clearGoogleTranslateCookies();
    document.cookie = `googtrans=/en/${lang}; path=/`;
    if (combo) {
      combo.value = lang;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      // Give the widget a moment to translate the first screen, then sweep.
      window.setTimeout(sweepForFullTranslation, 1500);
      return;
    }
    window.location.reload();
  });
}

// Return the page to its original language. Reloading is the only reliable reset:
// the translate widget ignores programmatic changes back to the empty option.
function resetGoogleTranslate() {
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  const translated = Boolean((combo && combo.value) || /googtrans=\/en\/[^;]/.test(document.cookie));
  if (!translated) return;
  withTranslationVeil(() => {
    clearGoogleTranslateCookies();
    window.location.reload();
  });
}


import imgConstruction from '@/assets/who-construction-natural.jpg';
import imgLogistics from '@/assets/who-logistics.jpg';
import imgHealthcare from '@/assets/who-healthcare.jpg';
import imgSmallbiz from '@/assets/who-smallbiz.jpg';
import imgEducation from '@/assets/who-education.jpg';
import imgCallcenter from '@/assets/who-callcenter-v2.jpg';
import imgLaw from '@/assets/who-law.jpg';
import imgRealtor from '@/assets/who-realtor-v11.jpg';
import imgGovernment from '@/assets/who-government.jpg';
import imgHospitality from '@/assets/who-hospitality-v8.jpg';
import imgDispatch from '@/assets/who-dispatch.jpg';
import imgGlobalTeams from '@/assets/who-globalteams.jpg';

const audienceImages = [imgConstruction, imgLogistics, imgHealthcare, imgSmallbiz, imgEducation, imgGlobalTeams, imgCallcenter, imgLaw, imgRealtor, imgHospitality, imgGovernment, imgDispatch];


export default function MultiLingualOKCSystem() {
  // View Router & Deep Global Localization States
  const [activeTab, setActiveRoute] = useState<'home' | 'cockpit' | 'trial-pass' | 'walking' | 'partner' | 'legal' | 'complaints' | 'meetings' | 'wallet'>('home');
  const passInterface = usePassInterface(activeTab === 'trial-pass');
  const [walletOpen,setWalletOpen]=useState(false);
  const walletState=useServerFn(walletStateFn);
  const [walletSignedIn,setWalletSignedIn]=useState(false);
  const [walletChecked,setWalletChecked]=useState(false);
  const activeTabRef=useRef<string>('home');
  useEffect(()=>{let alive=true;const check=()=>void walletState().then(s=>{if(alive){setWalletSignedIn(isWalletSignedIn(s.verified));setWalletChecked(true);}}).catch(()=>{if(alive){setWalletSignedIn(false);setWalletChecked(true);}});check();window.addEventListener('ml-wallet-change',check);return()=>{alive=false;window.removeEventListener('ml-wallet-change',check);};},[]);
  useEffect(()=>{const open=()=>setWalletOpen(true);const fleet=()=>{if(/^#fleet=[a-f0-9-]{36}$/.test(window.location.hash))setWalletOpen(true);};fleet();window.addEventListener('hashchange',fleet);window.addEventListener('ml-open-wallet',open);return()=>{window.removeEventListener('ml-open-wallet',open);window.removeEventListener('hashchange',fleet);};},[]);
  useEffect(()=>{const open=(event:Event)=>{if((event as CustomEvent<{packageId?:string}>).detail?.packageId==='single')setActiveLicensePack('single');try{if(activeTabRef.current!=='cockpit')sessionStorage.setItem('ml-return-tab',activeTabRef.current);}catch{}setWalletOpen(false);setActiveRoute('cockpit');};window.addEventListener('ml-open-pricing',open);return()=>window.removeEventListener('ml-open-pricing',open);},[]);
  // Opening a tab must always land at the top of the page, never mid-scroll.
  useEffect(() => { activeTabRef.current = activeTab; window.scrollTo(0, 0); }, [activeTab]);
  const [globalLocale, setGlobalLocale] = useState<'en' | 'es' | 'zh' | 'de' | 'tl' | 'ja'>('en');
  const [activeLicensePack, setActiveLicensePack] = useState<string>('team');
  const [credentialBuffer, setCredentialBuffer] = useState('');
  const [hasCopiedUrl, setHasCopiedUrl] = useState(false);
  
  // Direct Crew Invite Dispatch Channels
  const [inviteChannel, setInviteChannel] = useState<'text' | 'email'>('text');
  const [podiumOpen, setPodiumOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'denied'>('idle');
  const voiceStream = useRef<MediaStream | null>(null);
  const [voicePermission,setVoicePermission]=useState(false);
  const voiceAttempt=useRef(0);
  useEffect(()=>()=>{voiceAttempt.current+=1;voiceStream.current?.getTracks().forEach(t=>t.stop());voiceStream.current=null;},[activeTab]);
  useEffect(()=>{if(activeTab!=='trial-pass'){setVoicePermission(false);setVoiceState('idle');}},[activeTab]);
  async function toggleVoicePass() {
    if (voiceState === 'listening') { voiceStream.current?.getTracks().forEach((t) => t.stop()); voiceStream.current = null; setVoiceState('idle'); return; }
    const attempt=++voiceAttempt.current;
    try { const captured = await navigator.mediaDevices.getUserMedia({ audio: true }); if(attempt!==voiceAttempt.current){captured.getTracks().forEach(t=>t.stop());return;} voiceStream.current=captured; setVoiceState('listening'); } catch { if(attempt===voiceAttempt.current)setVoiceState('denied'); }
  }
  const [podiumLocale, setPodiumLocale] = useState<UILocale>('en');
  const [inviteTarget, setInviteDestination] = useState('');

  // stripeFixedProcessingFee is imported from @/lib/pricing (single source of truth).


  // Full Multi-Surface System Translation Matrix
  const localizations = {
    en: {
      origin: "Made in Oklahoma City, USA 🇺🇸",
      enterprise: "Multi-Lingual™ has engineered an industry-first white-label B2B architecture that allows agencies, call centers, law firms, enterprise realtors, and logistics firms to route their existing commercial phone lines and staff through our live translation matrix completely invisibly. Your operators keep their exact same desk phones, exact same numbers, and require zero training.",
      headline: "The World's First Browser-Native 243+ Language Communication Matrix",
      sub: "Multi-Lingual™ is a standalone technology firm, natively engineered right out of Oklahoma City, USA. We are factually the absolute lowest-cost cross-border translation network on earth — and a fully encrypted platform, too. Yes — we are factually the absolute first in the history of the technology sector to launch a global translation platform with zero sign-up screens and no contracts. You can now place calls in any language, from the same phone. Just enter your phone number to start: you speak in your own voice, the person you reach hears your voice in a language they understand, and you hear them in a language you understand. We also translate live video — face to face, in the moment — right inside your browser, with nothing to install and no setup to learn. We believe we are the first to put live video translation inside a plain link your whole team can simply open. The world's first 1-click, zero-download multi-lingual video bridge: an international buyer, an out-of-network subcontractor, or an overseas vendor simply scans one countertop QR code or taps one text link — and an encrypted live video lane opens natively in their default phone browser, with zero app installations, zero account-creation forms, and zero data tracking required. Getting started has zero barriers: no heavy app downloads, no setup friction, and zero upfront credit card information. Walk in instantly with just your existing business email or mobile phone number. This tech was built explicitly for your teams — so try us completely, for free.",
      sellingPoint: "👑 WORLD-FIRST OVERVIEW — FACTUALLY THE PLANET'S CHEAPEST CROSS-BORDER ROOM UTILITY",
      cta: "Launch Free Cockpit",
      overview: "Overview",
      pricing: "Pricing Matrix",
      freePass: "7-Day Free Pass",
      walkingTab: "🔥 Personal Translator™ in Your Phone",
      partnerTab: "🔥 Share us & earn 50/50 split as an affiliate",
      partnerTabTop: "🔥 Share us and earn 50%",
      partnerTitle: "🔥 Share us! 💰 Earn a 50/50 split as an affiliate",
      partnerBody: "Share Multi-Lingual™ with your crews, colleagues, and community. As an affiliate, every pass activated through your link splits the earnings 50/50 with you.",
      placeholder: "Enter Your Existing Email or Phone Number...",
      capabilityTitle: "Communication Features",
      card1Title: "1-Click Client Onboarding",
      card1Body: "Bypass heavy software installations entirely. Your crews, overseas suppliers, or guests tap your 1-click room link right inside their mobile browser and connect instantly for free.",
      card2Title: "Clara AI™ Mobile Notifications",
      card2Body: "Clara automatically routes multi-directional translated 3-line headers right inside your native notifications before you open the thread, preserving your field workflow with zero app bloat.",
      card3Title: "🔥 Multi-Lingual™",
      card3Body: "The world's first browser-native multilingual personal translator. The voice on the other end broadcasts your message aloud.",
      inviteTitle: "Transmit Instant Room Invites",
      inviteSub: "Viral Pass Ingress: Every room link or countertop QR code you distribute automatically wraps an active, standalone 7-day all-access invitation for your recipient. The moment your client, subcontractor, or out-of-network vendor exits your translated conversation, our platform instantly provisions them an option to launch their own 7-day free trial pass.",
      trialBadge: "🔥 TRY ANYTHING ON THE PLATFORM FOR FREE — 7-DAY ALL-ACCESS PASS — NO HEAVY APPS, NO CONTRACTS, & NO CREDIT CARD REQUIRED TO START.",
      walkTransTitle: "🗣️ Zero-Click Personal Translator (Lobby Countertop Framework)",
      walkTransBody: "Engineered specifically for hotel front desks and face-to-face public areas. Display our countertop QR code pass. When a guest scans it with their camera, our system automatically reads their device locale to switch their screen language instantly. Tap to speak English, they tap to speak their native dialect—and Clara AI securely logs live meeting minutes in the background.",
    },
    es: {
      origin: "Hecho en Oklahoma City, EE. UU. 🇺🇸",
      enterprise: "Multi-Lingual™ ha diseñado una arquitectura B2B de marca blanca pionera en la industria que permite a agencias, centros de llamadas, bufetes de abogados, empresas inmobiliarias y firmas de logística conectar sus líneas telefónicas comerciales y su personal existentes a nuestra matriz de traducción en vivo de forma completamente invisible. Sus operadores conservan exactamente los mismos teléfonos de escritorio, exactamente los mismos números y no requieren capacitación alguna.",
      headline: "La primera matriz de comunicación nativa del navegador en más de 243 idiomas",
      sub: "Multi-Lingual™ es una empresa de tecnología independiente, desarrollada de forma nativa en Oklahoma City, EE. UU. Somos, de hecho, la red de traducción transfronteriza de menor costo del mundo — y además, una plataforma totalmente cifrada. Sí — somos, de hecho, los primeros en la historia del sector tecnológico en lanzar una plataforma de traducción global sin pantallas de registro y sin contratos. Ahora puede hacer llamadas en cualquier idioma, desde el mismo teléfono. Solo escriba su número de teléfono para comenzar: usted habla con su propia voz, la persona que recibe la llamada escucha su voz en un idioma que entiende, y usted la escucha en un idioma que usted entiende. También traducimos video en vivo — cara a cara, en el momento — directamente en su navegador, sin instalar nada y sin ninguna configuración que aprender. Creemos que somos los primeros en poner la traducción de video en vivo dentro de un enlace común que todo su equipo puede abrir con un solo toque. El primer puente de video multilingüe del mundo, de un solo clic y cero descargas: un comprador internacional, un subcontratista fuera de la red o un proveedor de ultramar simplemente escanea un código QR de mostrador o toca un enlace de texto — y un canal de video cifrado se abre de forma nativa en el navegador predeterminado de su teléfono, sin instalaciones de aplicaciones, sin formularios de registro y sin rastreo de datos. Empezar no tiene barreras: sin descargas de aplicaciones pesadas, sin complicaciones de configuración y sin información de tarjeta de crédito por adelantado. Entre al instante con solo su correo electrónico empresarial o su número de teléfono móvil existentes. Esta tecnología fue creada expresamente para sus equipos — así que pruébenos completamente gratis.",
      sellingPoint: "👑 PRIMICIA MUNDIAL — DE HECHO, LA HERRAMIENTA DE SALAS TRANSFRONTERIZAS MÁS BARATA DEL PLANETA",
      cta: "Iniciar Panel Gratis",
      overview: "Resumen",
      pricing: "Precios",
      freePass: "Pase Gratis de 7 Días",
      walkingTab: "🔥 Traductor Personal™ en su Teléfono",
      partnerTab: "🔥 ¡Compártenos y gana 50/50 como afiliado",
      partnerTabTop: "🔥 ¡Compártenos y gana 50%",
      partnerTitle: "🔥 ¡Compártenos! 💰 Gana un reparto 50/50 como afiliado",
      partnerBody: "Comparte Multi-Lingual™ con tus equipos, colegas y comunidad. Como afiliado, cada pase activado con tu enlace reparte las ganancias 50/50 contigo.",
      placeholder: "Ingrese su correo o teléfono existente...",
      capabilityTitle: "Funciones de comunicación",
      card1Title: "Incorporación en 1 Clic",
      card1Body: "Evite por completo las descargas de software pesado. Sus equipos o invitados simplemente tocan el enlace directamente en su navegador móvil nativo.",
      card2Title: "Notificaciones Móviles Clara AI™",
      card2Body: "Clara envía resúmenes traducidos de 3 líneas directamente en sus notificaciones de correo móvil antes de abrir el hilo, manteniendo su flujo de trabajo impecable.",
      card3Title: "🔥 Multi-Lingual™",
      card3Body: "El primer traductor personal multilingüe nativo del mundo. La voz del otro lado transmite tu mensaje en voz alta.",
      inviteTitle: "Transmitir Invitaciones Inmediatas",
      inviteSub: "Acceso de Pase Viral: Cada enlace de sala o código QR de mostrador que distribuya incluye automáticamente una invitación activa, independiente y con acceso total por 7 días para su destinatario. En el momento en que su cliente, subcontratista o proveedor externo sale de su conversación traducida, nuestra plataforma le ofrece al instante la opción de iniciar su propio pase de prueba gratuito de 7 días.",
      trialBadge: "🔥 PRUEBA CUALQUIER COSA EN LA PLATAFORMA GRATIS — PASE DE ACCESO TOTAL DE 7 DÍAS — SIN APPS PESADAS, SIN CONTRATOS Y SIN TARJETA.",
      walkTransTitle: "🗣️ Traductor Personal de un solo clic (marco de mostrador de lobby)",
      walkTransBody: "Diseñado específicamente para recepciones de hoteles y áreas públicas cara a cara. Muestre nuestro pase de código QR. Cuando un invitado lo escanea con su cámara, nuestro sistema lee automáticamente la configuración regional de su dispositivo para cambiar el idioma de su pantalla al instante.",
    },
    tl: {
      origin: "Ginawa sa Oklahoma City, USA 🇺🇸",
      enterprise: "Ang Multi-Lingual™ ay nakabuo ng kauna-unahang white-label na B2B na arkitektura sa industriya na nagbibigay-daan sa mga ahensya, call center, law firm, kompanya ng real estate, at kompanya ng logistics na idaan ang kanilang kasalukuyang mga linya ng teleponong pangnegosyo at kawani sa aming live na matrix ng pagsasalin nang ganap na hindi napapansin. Gagamit pa rin ang inyong mga operator ng eksaktong parehong mga telepono sa mesa at eksaktong parehong mga numero, at hindi nila kailangan ng anumang pagsasanay.",
      headline: "Ang Unang Browser-Native na Matrix ng Komunikasyon sa 243+ na Wika sa Mundo",
      sub: "Ang Multi-Lingual™ ay isang independiyenteng kompanya ng teknolohiya, na orihinal na binuo mismo sa Oklahoma City, USA. Sa katunayan, kami ang may pinakamababang gastos na network ng pagsasalin sa pagitan ng mga bansa sa buong mundo — at isang ganap na naka-encrypt na plataporma pa. Oo — sa katunayan, kami ang una-una sa kasaysayan ng industriya ng teknolohiya na naglunsad ng pandaigdigang translation platform na walang sign-up screen at walang kontrata. Ngayon ay kaya mong tumawag sa anumang wika, gamit ang iisang telepono. Ilagay mo lang ang iyong numero ng telepono upang magsimula: nagsasalita ka sa iyong sariling boses, ang iyong tinatawagan ay nakakarinig sa iyo sa wikang naiintindihan niya, at ikaw naman ay nakakarinig sa kanya sa wikang naiintindihan mo. Isasalin din namin ang live na video — harap-harapan, sa mismong sandali — direkta sa inyong browser, walang i-download at walang setup na kailangang matutunan. Paniniwala namin na kami ang unang naglagay ng live video translation sa loob ng simpleng link na mabubuksan ng buong koponan ninyo. Ang unang video bridge sa buong mundo na isang-klik at walang download na maraming wika: ang isang international buyer, isang out-of-network subcontractor, o isang overseas vendor ay sisiwalat lamang ng isang countertop QR code o mag-tap ng isang text link — at ang isang naka-encrypt na live video lane ay bubuksan nang direkta sa default na browser ng kanilang telepono, na walang app na i-install, walang form na pupunuin, at walang pag-track ng data. Walang hadlang sa pagsisimula: walang mabibigat na app na i-download, walang abala sa pag-set up, at walang impormasyon ng credit card na kailangang ibigay sa simula. Pumasok agad gamit lamang ang inyong kasalukuyang email sa negosyo o numero ng mobile phone. Ang teknolohiyang ito ay ginawa mismo para sa inyong mga koponan — kaya subukan kami nang ganap na libre.",
      sellingPoint: "👑 KAUNA-UNAHAN SA MUNDO — SA KATUNAYAN, ANG PINAKAMURANG SERBISYO NG MGA ROOM PARA SA KOMUNIKASYON SA PAGITAN NG MGA BANSA SA PLANETA",
      cta: "Pumasok sa Cockpit Libre",
      overview: "Pangkalahatang-ideya",
      pricing: "Matriz ng Presyo",
      freePass: "7-Araw na Libreng Pass",
      walkingTab: "🔥 Personal na Tagasalin™ sa Iyong Telepono",
      partnerTab: "🔥 I-share kami at kumita ng 50/50 bilang kaakibat",
      partnerTabTop: "🔥 I-share kami at kumita 50%",
      partnerTitle: "🔥 Ibahagi natin! 💰 Kumita ng 50/50 na hati bilang affiliate",
      partnerBody: "Ibahagi ang Multi-Lingual™ sa inyong mga tauhan, katrabaho, at komunidad. Bilang affiliate, ang bawat pass na na-activate sa inyong link ay may 50/50 na hati sa kinita.",
      placeholder: "Ilagay ang Iyong Umiiral na Email o Telepono...",
      capabilityTitle: "Mga Tampok ng Komunikasyon",
      card1Title: "1-Click Easy Onboarding",
      card1Body: "Laktawan ganap ang mahahabang pag-install ng app. Ang iyong mga tauhan o panauhin ay i-tap lang ang link sa kanilang mobile browser at papasok kaagad nang libre.",
      card2Title: "Clara AI™ Mobile Notifications",
      card2Body: "Awtomatikong nagpapadala si Clara ng mga isinaling 3-line na buod sa loob ng iyong mga abiso bago mo pa buksan ang mensahe upang mapanatili ang iyong daloy ng trabaho.",
      card3Title: "🔥 Multi-Lingual™",
      card3Body: "Ang unang browser-native na multilingual na personal translator sa mundo. Ang boses sa kabilang linya ay ginagaya ang iyong natatanging tono at boses upang i-broadcast ang mensahe.",
      inviteTitle: "Ipadala ang Imbita",
      inviteSub: "Viral Pass Ingress: Bawat room link o countertop QR code na ipapamahagi mo ay awtomatikong may kasamang aktibo at hiwalay na 7-araw na all-access na imbitasyon para sa tatanggap. Sa sandaling umalis ang iyong kliyente, subcontractor, o out-of-network vendor sa iyong isinaling conversation, agad silang bibigyan ng aming platform ng opsyong simulan ang sarili nilang 7-araw na libreng trial pass.",
      trialBadge: "🔥 SUBUKAN ANG ANUMANG BAGAY SA PLATFORM NANG LIBRE — 7-ARAW NA ALL-ACCESS PASS — WALANG APPS, WALANG KONTRATA, AT WALANG CREDIT CARD.",
      walkTransTitle: "🗣️ Zero-Click Personal Translator (Lobby Countertop Framework)",
      walkTransBody: "Binuo para sa mga hotel front desk at pampublikong lugar. Idispley ang countertop QR code pass. Kapag na-scan ito ng bisita, awtomatikong binabasa ng system ang wika ng kanilang telepono upang baguhin ang screen agad.",
    },
    zh: { headline: "全球首款浏览器原生 243+ 语言即时通讯矩阵", sellingPoint: "👑 世界首创总览 — 事实上是全球最便宜的跨境房间通信工具", sub: "Multi-Lingual™ 是一家总部位于美国俄克拉荷马城的独立技术公司。事实上，我们是全球成本最低的跨境翻译网络，同时也是完全加密的平台。是的——事实上，我们是科技行业历史上第一家推出零注册页面、无合同约束的全球翻译平台的公司。您现在可以用同一部手机拨打任意语言的电话。只需输入您的手机号码即可开始：您用自己的声音说话，对方听到的是您的声音、用他们听得懂的语言，而您听到的对方声音，也是您听得懂的语言。我们还提供实时视频翻译——面对面、即时呈现——直接在浏览器中进行，无需安装任何应用，也无需学习任何设置。我们相信，我们是首家把实时视频翻译放进一个普通链接、让整个团队都能直接打开的公司。 全球首创的一键零下载多语言视频桥：国际买家、体系外分包商或海外供应商只需扫描一个柜台二维码或点开一条文字链接——一条加密的实时视频通道便会直接在其手机默认浏览器中打开，无需安装任何应用，无需填写任何注册表单，也不追踪任何数据。起步毫无门槛：无需下载繁重的应用，无需繁琐设置，更无需预先提供任何信用卡信息。只需使用您现有的企业邮箱或手机号即可立即进入。这项技术专门为您的团队而打造——欢迎完全免费试用。", cta: "免费进入控制台", overview: "概览", pricing: "价格", freePass: "7天免费", walkingTab: "🔥 您手机中的个人翻译器™", partnerTab: "🔥 分享我们，赚取五五分账联盟奖励", partnerTabTop: "🔥 分享我们，赚取 50%", partnerTitle: "🔥 分享我们！💰 作为联盟伙伴赚取五五分账", partnerBody: "与您的团队、同事和社区分享 Multi-Lingual™。作为联盟伙伴，通过您的链接激活的通行证，收益与您五五分账。", placeholder: "输入您现有的邮箱或手机号...", capabilityTitle: "核心能力矩阵清单", card1Title: "1秒免下载入会", card1Body: "完全摆脱繁重的软件安装。跨境团队、海外供应商或访客只需点击单次链接，即可在普通的手机或电脑浏览器中直接免费进入会话。", card2Title: "Clara AI™ 智能通知栏", card2Body: "Clara 会在您打开邮件通知前，自动在您的原生通知栏中注入三行多语种翻译摘要，完全不占用任何后台常驻进程。", card3Title: "🔥 Multi-Lingual™", card3Body: "全球首款浏览器原生多语种个人翻译器。保留您独特的音色与说话习惯，以您本人的声音直接在境外播放。", inviteTitle: "传输即时会话邀约", inviteSub: "病毒式通行证入口：您分发的每一个会话链接或柜台二维码，都会自动为接收人附带一个有效、独立的7天全功能邀请。当您的客户、分包商或体系外供应商结束您的翻译会话时，平台会立即为其提供开启自己的7天免费试用通行证的选项。" },
    de: { headline: "Das weltweit erste browsernative 243+ Sprachen-Kommunikationsterminal", sellingPoint: "👑 WELTPREMIERE-ÜBERBLICK — FAKTISCH DAS GÜNSTIGSTE GRENZÜBERSCHREITENDE RAUM-UTILITY DER WELT", sub: "Multi-Lingual™ ist ein eigenständiges Technologieunternehmen, entwickelt in Oklahoma City, USA. Wir sind faktisch das absolut günstigste grenzüberschreitende Übersetzungsnetzwerk der Welt — und zudem eine vollständig verschlüsselte Plattform. Ja — wir sind nachweislich die Allerersten in der Geschichte des Technologiesektors, die eine globale Übersetzungsplattform ohne Anmelde-Bildschirme und ohne Verträge gestartet haben. Sie können jetzt Anrufe in jeder Sprache führen, vom selben Telefon. Geben Sie einfach Ihre Telefonnummer ein, um zu starten: Sie sprechen in Ihrer eigenen Stimme, die angerufene Person hört Ihre Stimme in einer Sprache, die sie versteht, und Sie hören sie in einer Sprache, die Sie verstehen. Wir übersetzen auch Live-Video — von Angesicht zu Angesicht, im selben Moment — direkt im Browser, ohne Installation und ohne Einrichtung. Wir glauben, dass wir die Ersten sind, die Live-Video-Übersetzung in einen einfachen Link packen, den Ihr gesamtes Team öffnen kann. Die weltweit erste Multi-Lingual-Video-Brücke mit einem Klick und null Downloads: Ein internationaler Käufer, ein externer Subunternehmer oder ein Übersee-Lieferant scannt einfach einen Tresen-QR-Code oder tippt auf einen Textlink — und eine verschlüsselte Live-Video-Verbindung öffnet sich nativ im Standardbrowser seines Telefons, ohne App-Installationen, ohne Registrierungsformulare und ohne Daten-Tracking. Der Einstieg hat keine Hürden: keine schweren App-Downloads, kein Einrichtungsaufwand und keine Kreditkartendaten im Voraus. Kommen Sie sofort herein — nur mit Ihrer vorhandenen geschäftlichen E-Mail oder Handynummer. Diese Technik wurde ausdrücklich für Ihre Teams gebaut — probieren Sie uns also komplett kostenlos aus.", cta: "Cockpit öffnen", overview: "Übersicht", pricing: "Preise", freePass: "7 Tage Pass", walkingTab: "🔥 Persönlicher Übersetzer™ in Ihrem Telefon", partnerTab: "🔥 Teile uns & verdiene 50/50 als Affiliate", partnerTabTop: "🔥 Teile uns & verdiene 50%", partnerTitle: "🔥 Teile uns! 💰 Verdiene als Affiliate 50/50", partnerBody: "Teilen Sie Multi-Lingual™ mit Ihren Teams, Kollegen und Community. Als Affiliate wird jeder über Ihren Link aktivierte Pass 50/50 mit Ihnen geteilt.", placeholder: "E-Mail oder Telefon eingeben...", capabilityTitle: "Systemindizes", card1Title: "1-Click Onboarding", card1Body: "Keine Softwareinstallationen.", card2Title: "Clara AI™ Benachrichtigungen", card2Body: "Trägt 3-zeilige Übersetzungen ein.", card3Title: "🔥 Multi-Lingual™", card3Body: "Ihre Stimme in 200+ Sprachen.", inviteTitle: "Einladungen senden", inviteSub: "Viraler Pass-Zugang: Jeder Raumlink und jeder Tresen-QR-Code, den Sie verteilen, enthält automatisch ein aktives, eigenständiges 7-Tage-All-Access-Einladung für Ihren Empfänger. Sobald Ihr Kunde, Subunternehmer oder externer Lieferant Ihre übersetzte Unterhaltung verlässt, bietet unsere Plattform ihm sofort die Option, einen eigenen kostenlosen 7-Tage-Testpass zu starten." },
    ja: { headline: "世界初、ブラウザネイティブの243言語対応リアルタイム通信マトリクス", sellingPoint: "👑 世界初の全体像 — 事実上、地球上で最も安い越境ルームユーティリティ", sub: "Multi-Lingual™は、米国オクラホマシティで生まれた独立系テクノロジー企業です。事実上、世界で最も低コストな越境翻訳ネットワークであり、完全暗号化されたプラットフォームでもあります。そう — 事実として、私たちはテクノロジー業界の歴史において、サインアップ画面も契約も一切ないグローバル翻訳プラットフォームを世界で初めて立ち上げた存在です。今や、同じ1台の電話でどの言語にも通話できます。電話番号を入力するだけで開始：あなたは自分の声で話し、相手にはその声が相手の理解できる言語で届き、あなたには相手の声があなたの理解できる言語で届きます。ライブ映像の翻訳も行います — 向き合い、その場で — ブラウザ内で直接、インストールも設定の学習も不要です。チーム全員が普通のリンクを開くだけでライブ映像翻訳を使えるのは、世界初だと考えています。 世界初のワンクリック・ゼロダウンロードの多言語ビデオブリッジ：海外のバイヤー、外部の下請け業者、海外の仕入先は、カウンターのQRコードを1回スキャンするか、テキストリンクを1回タップするだけ——暗号化されたライブビデオ回線が、そのまま相手のスマートフォンの標準ブラウザで開きます。アプリのインストールも、アカウント登録フォームも、データトラッキングも一切不要です。始めるためのハードルはゼロ：重いアプリのダウンロードも、面倒な設定も、事前のクレジットカード情報の入力も一切不要。既存のビジネスメールか携帯電話番号だけで、すぐにご利用いただけます。この技術はあなたのチームのために作られました — ぜひ無料でお試しください。", cta: "控制台起動", overview: "概要", pricing: "料金表", freePass: "7日間無料パス", walkingTab: "🔥 あなたのスマートフォンのパーソナル翻訳機™", partnerTab: "🔥 シェアしてアフィリエイト50/50報酬", partnerTabTop: "🔥 シェアして 50% 獲得", partnerTitle: "🔥 シェアしてください！💰 アフィリエイトとして50/50の報酬", partnerBody: "Multi-Lingual™ をチームや仲間、地域にシェアしてください。アフィリエイトとして、あなたのリンクから有効になったパスは収益を50/50で山分けします。", placeholder: "既存のメールアドレスまたは電話番号を入力...", capabilityTitle: "システム機能明細", card1Title: "1クリック・機能オンボーディング", card1Body: "ソフトウェアのインストールは完全に不要。海外の作業員やゲストは、端末の標準ブラウザから1クリックで即座に無料接続できます。", card2Title: "Clara AI™ 通知プレビュー", card2Body: "メッセージを開く前に、Claraが自動的に3行의 翻訳要約をスマートフォンの標準通知欄にインジェクションします。", card3Title: "🔥 Multi-Lingual™", card3Body: "世界初のブラウザネイティブ多言語歩行翻訳機。あなたの声のトーンやイントネーションを完全に複製し、あなたの声のまま外国語で拡声します。", inviteTitle: "即時ルーム招待の送信", inviteSub: "バイラル・パス・イングレス：配布するすべてのルームリンクやカウンターのQRコードには、受信者向けの有効で独立した7日間オールアクセス招待が自動的に付与されます。クライアント、下請け業者、外部ベンダーが翻訳された会話を終了した瞬間、プラットフォームは自分専用の7日間無料試用パスを開始するオプションを即座に提供します。" }
  };

  const text = localizations[globalLocale] || localizations['en'];
  useEffect(() => { document.documentElement.lang = globalLocale; }, [globalLocale]);
  const ui = uiCopy[globalLocale];
  const travel = travelUtilityCopy[globalLocale];
  const carrier = globalLocale === 'zh' || globalLocale === 'de' || globalLocale === 'ja' ? carrierCopy[globalLocale] : localizations[globalLocale];
  const heroDetails = { origin: (carrier as typeof carrierCopy.zh).origin, enterprise: (carrier as typeof carrierCopy.zh).enterprise };
  const carrierText = { trialBadge: (carrier as typeof localizations.en).trialBadge, walkTransTitle: (carrier as typeof localizations.en).walkTransTitle, walkTransBody: (carrier as typeof localizations.en).walkTransBody };
  const audiences = audienceImages.map((img, i) => ({ img, ...ui.audiences[i] }));
  const testimonials = ui.testimonials;
  const complianceText = governmentComplianceCopy[globalLocale];

  type Locale = 'en' | 'es' | 'zh' | 'de' | 'tl' | 'ja';
  const regionalCurrencyMatrix: Record<Locale, { symbol: string; single: number; duo: number; team: number; hub: number; community: number; annual: number; code: string; node: string }> = {
    en: { symbol: "$", single: 0.99, duo: 9.99, team: 3.99, hub: 7.99, community: 19.99, annual: 199.0, code: "USD", node: "Americas / Euro Core Node" },
    es: { symbol: "$", single: 19.99, duo: 199.0, team: 79.99, hub: 159.99, community: 399.99, annual: 3999.0, code: "MXN", node: "LATAM Transit Corridor" },
    zh: { symbol: "¥", single: 6.99, duo: 69.99, team: 27.99, hub: 55.99, community: 139.99, annual: 1399.0, code: "CNY", node: "APAC Logistics Hub" },
    de: { symbol: "€", single: 0.95, duo: 9.49, team: 3.8, hub: 7.6, community: 19.0, annual: 190.0, code: "EUR", node: "EMEA Region Core Node" },
    tl: { symbol: "₱", single: 55.0, duo: 550.0, team: 220.0, hub: 440.0, community: 1100.0, annual: 11000.0, code: "PHP", node: "APAC Logistics Hub" },
    ja: { symbol: "¥", single: 149, duo: 1499, team: 599, hub: 1169, community: 2999, annual: 29900, code: "JPY", node: "APAC Regional Node" },
  };
  const currency = regionalCurrencyMatrix[globalLocale];
  const uniqueSessionPassUrl = passInterface.link;

  const ck = checkoutCopy[globalLocale];
  const packs = paidPackages.map(p => ({ ...p, name: p.nameIndex === null ? ck.duoPack : (ui.packs[p.nameIndex] ?? '') }));
  const selectedPackage = packs.find(p => p.id === activeLicensePack) ?? { ...paidPackages[1], name: ui.packs[1] ?? '' };
  // Country-sensitive display: each locale sees prices in its own currency.
  const packCurrencyKey: Record<string, 'single' | 'duo' | 'team' | 'hub' | 'community' | 'annual'> = {
    single: 'single', team: 'team', hub: 'hub', 'duo-yearly': 'duo', community: 'community', enterprise: 'annual',
  };
  const intlLocales: Record<Locale, string> = { en: 'en-US', es: 'es-MX', zh: 'zh-CN', de: 'de-DE', tl: 'fil-PH', ja: 'ja-JP' };
  const formatRegionalPrice = (packageId: string) => {
    // Dynamic Geographic Affordability: once the visitor's region is detected,
    // prices render in their local currency at parity values. Enterprise Global
    // stays hard-anchored to flat USD worldwide.
    const pkg = paidPackages.find((p) => p.id === packageId);
    if (pricePlan && pkg) {
      const geoAmount = geoAmountFor(packageId, pkg.price, pricePlan);
      if (geoAmount === null) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(pkg.price);
      }
      return formatFlagPackagePrice(packageId, pkg.price, pricePlan);
    }
    const amount = currency[packCurrencyKey[packageId] ?? 'single'];
    const formatted = new Intl.NumberFormat(intlLocales[globalLocale], { style: 'currency', currency: currency.code }).format(amount);
    // Mexican pesos share the "$" glyph with USD — disambiguate with the MX$ convention.
    return currency.code === 'MXN' ? formatted.replace('$', 'MX$') : formatted;
  };
  const [autoPay, setAutoPay] = useState<boolean>(defaultBillingPreferences.autoPay);
  const [rememberPayment, setRememberPayment] = useState<boolean>(defaultBillingPreferences.rememberPayment);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'success' | 'cancelled' | 'error' | null>(null);
  // Geo plan is detected after hydration only, so SSR and first client render match.
  const [geoPlan, setGeoPlan] = useState<GeoPlan | null>(null);
  const [pricingLanguage, setPricingLanguage] = useState('en');
  const [pricingCountry, setPricingCountry] = useState<string | undefined>();
  const pricePlan = getFlagPricePlan(pricingLanguage, geoPlan, pricingCountry);
  const selectedBillingPlan = selectedPackage.id === 'enterprise' ? getFlagPricePlan('en', null, 'us') : pricePlan;
  useEffect(() => { setGeoPlan(detectGeoPlan()); }, []);

  const startCheckout = async () => {
    setCheckoutBusy(true);
    try {
      const { url } = await createPackageCheckout({
        data: { credentialHandle: getCredentialHandle(), packageId: selectedPackage.id, origin: PRODUCTION_DOMAIN, currency: selectedPackage.id === 'enterprise' ? 'USD' : pricePlan.code, referral: localStorage.getItem('ml-referral-token') ?? undefined },
      });
      window.location.href = url;
    } catch {
      setActiveRoute('wallet');
      setCheckoutStatus('error');
      setCheckoutBusy(false);
    }
  };

  const languages: { code: Locale; flag: string; label: string }[] = [
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'es', flag: '🇲🇽', label: 'Español' },
    { code: 'zh', flag: '🇨🇳', label: '中文' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'tl', flag: '🇵🇭', label: 'Tagalog' },
    { code: 'ja', flag: '🇯🇵', label: '日本語' },
  ];

  const handleLanguageSelect = (locale: Locale) => {
    setPricingCountry(undefined);
    localStorage.removeItem('pricing_country');
    setPricingLanguage(locale);
    setGlobalLocale(locale);
  };

  const handleFlagClick = (f: (typeof ALL_FLAGS)[number]) => {
    setPricingCountry(f.country);
    localStorage.setItem('pricing_country', f.country);
    setPricingLanguage(f.lang);
    localStorage.setItem('user_locale', f.locale ?? `gt:${f.lang}`);
    if (f.locale) {
      // Returning to a natively supported language: clear any Google Translate overlay first.
      sessionStorage.setItem('pending-locale', f.locale);
      resetGoogleTranslate();
      setGlobalLocale(f.locale as Locale);
    } else {
      // Every other flag translates the entire site through Google Translate, base English.
      // Commit the English base first: if the widget starts on still-native text
      // (e.g. Chinese), React's later text swap is lost and that copy stays native.
      // Cover the page before the swap so the visitor never sees the English
      // base flash in the gap before the widget translates it.
      showTranslationVeil();
      flushSync(() => setGlobalLocale('en'));
      window.setTimeout(() => setGoogleTranslate(f.lang), 50);
    }
  };
  const restoreWalletLanguage=(language:string)=>{const flag=ALL_FLAGS.find(f=>f.lang===language);if(flag)handleFlagClick(flag);};
  useEffect(()=>{const restore=(event:Event)=>{const language=(event as CustomEvent<string>).detail;const flag=ALL_FLAGS.find(f=>f.lang===language);if(flag)handleFlagClick(flag);};window.addEventListener('ml-wallet-language',restore);return()=>window.removeEventListener('ml-wallet-language',restore);},[]);


  // Restore the visitor's language on load: a just-clicked native locale after a
  // Google Translate reset reload wins; otherwise fall back to their saved choice.
  useEffect(() => {
    const openTravelPass = () => {
      if(new URLSearchParams(window.location.search).get('messages')==='1')setActiveRoute('walking');
      const partnerToken=new URLSearchParams(window.location.search).get('ref');
      if(partnerToken&&/^ML-[A-F0-9]{16}$/.test(partnerToken))localStorage.setItem('ml-referral-token',partnerToken);
      if(new URLSearchParams(window.location.search).has('partner_setup'))setWalletOpen(true);
      const ref = window.location.hash.match(/^#trial-affiliate-([A-Za-z0-9_-]{4,64})/);
      if (ref?.[1]) localStorage.setItem('ml-referral', ref[1]);
      if (window.location.hash === '#travel-pass' || window.location.hash.startsWith('#trial-')) setActiveRoute('trial-pass');
      if (/^#(?:talk-|meeting-|my-code-|free-pass|demo-audio=)/.test(window.location.hash)) setActiveRoute('walking');
      if (/^#broadcast-[a-f0-9-]{36}$/.test(window.location.hash)) setActiveRoute('walking');
      if (window.location.hash === '#solo-pack') setActiveRoute('cockpit');
    };
    openTravelPass();
    window.addEventListener('hashchange', openTravelPass);
    window.addEventListener('ml-open-call', openTravelPass);
    return () => { window.removeEventListener('hashchange', openTravelPass); window.removeEventListener('ml-open-call', openTravelPass); };
  }, []);
  // Returning from Stripe Checkout: confirm the session server-side (it flips
  // the subscription columns), show the result on the pricing tab, clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;
    const sessionId = params.get('session_id');
    window.history.replaceState(null, '', window.location.pathname);
    setActiveRoute('cockpit');
    if (checkout === 'success' && sessionId) {
      confirmPackageCheckout({ data: { credentialHandle: getCredentialHandle(), sessionId } })
        .then((result) => { setCheckoutStatus(result.ok ? 'success' : 'error'); if (result.ok) { let back: string | null = null; try { back = sessionStorage.getItem('ml-return-tab'); sessionStorage.removeItem('ml-return-tab'); } catch { /* storage optional */ } if (back) setTimeout(() => setActiveRoute(back as typeof activeTab), 2500); } })
        .catch(() => setCheckoutStatus('error'));
    } else if (checkout === 'cancelled') {
      setCheckoutStatus('cancelled');
    }
  }, []);
  useEffect(() => {
    const pending = sessionStorage.getItem('pending-locale');
    setPricingCountry(localStorage.getItem('pricing_country') ?? undefined);
    // The page boots in English and restores the saved language a moment later;
    // keep the dark veil up through that swap so visitors never see the flash.
    if (pending) {
      showTranslationVeil();
      sessionStorage.removeItem('pending-locale');
      setPricingLanguage(pending);
      setGlobalLocale(pending as Locale);
      hideTranslationVeilWhenSettled();
      return undefined;
    }
    const saved = localStorage.getItem('user_locale');
    if (!saved) {
      // First visit, no flag ever tapped: follow the phone's own language when
      // it is one of the six native locales. Nothing is saved here — only a
      // flag tap becomes a remembered choice that wins on later visits.
      const browserLang = (navigator.language ?? 'en').split('-')[0]?.toLowerCase() ?? 'en';
      if (browserLang !== 'en' && browserLang in localizations) {
        showTranslationVeil();
        setPricingLanguage(browserLang);
        setGlobalLocale(browserLang as Locale);
        hideTranslationVeilWhenSettled();
      }
      return undefined;
    }
    setPricingLanguage(saved.replace(/^gt:/, ''));
    if (saved.startsWith('gt:')) {
      // Re-apply the saved Google Translate language in place once the widget is
      // ready. Never reload here: a blocked widget or cookie would loop the page.
      showTranslationVeil();
      const lang = saved.slice(3);
      let tries = 0;
      const timer = window.setInterval(() => {
        tries += 1;
        const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
        if (combo) {
          window.clearInterval(timer);
          if (combo.value !== lang) {
            combo.value = lang;
            combo.dispatchEvent(new Event('change', { bubbles: true }));
          }
          // Whether the widget just switched or the cookie already had it
          // translated, below-the-fold sections still need the one-time sweep.
          window.setTimeout(sweepForFullTranslation, 1500);
          hideTranslationVeilWhenSettled();
        } else if (tries > 40) {
          window.clearInterval(timer);
          hideTranslationVeil();
        }
      }, 250);
      return () => window.clearInterval(timer);
    } else {
      // Native locale saved: make sure a Google Translate cookie from a previous
      // visit cannot machine-translate the native copy on this load.
      showTranslationVeil();
      if (/googtrans=\/en\/[^;]/.test(document.cookie)) clearGoogleTranslateCookies();
      setGlobalLocale(saved as Locale);
      hideTranslationVeilWhenSettled();
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;
    (window as unknown as { googleTranslateElementInit: () => void }).googleTranslateElementInit = () => {
      const g = (window as unknown as { google: { translate: { TranslateElement: new (o: object, id: string) => void } } }).google;
      new g.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false }, 'google_translate_element');
    };
    const sc = document.createElement('script');
    sc.id = 'google-translate-script';
    sc.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(sc);
  }, []);


  const handleInviteTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteTarget) {
      alert(translatorCopy[globalLocale].notice);
      setInviteDestination('');
    }
  };

  const copyPass = async () => {
    try { await navigator.clipboard.writeText(uniqueSessionPassUrl); } catch { /* ignore */ }
    setHasCopiedUrl(true);
    setTimeout(() => setHasCopiedUrl(false), 2000);
  };

  const passShare = passShareCopy[globalLocale];
  const sharePass = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: ui.trialTitle, text: passShare.shareText, url: uniqueSessionPassUrl });
        return;
      }
    } catch { /* user cancelled or share unavailable — fall through to copy */ }
    try { await navigator.clipboard.writeText(uniqueSessionPassUrl); } catch { /* ignore */ }
    setHasCopiedUrl(true);
    setTimeout(() => setHasCopiedUrl(false), 2000);
  };



  const navLink = (id: typeof activeTab, label: string) => (
    <Button variant="ghost" data-navigation-tab={id} aria-current={activeTab === id ? 'page' : undefined} onClick={() => setActiveRoute(id)} className={`ml-nav h-auto rounded px-1 py-0.5 ${activeTab === id ? 'ml-nav-active' : ''}`}>{label}</Button>
  );

  const features: { t: string; b: string }[] = [
    { t: text.card1Title, b: text.card1Body },
    { t: text.card2Title, b: text.card2Body },
    { t: travel.walkingTitle, b: translatorCopy[globalLocale].single },
  ];

  return (
    <div className="relative min-h-screen text-foreground flex flex-col bg-cover bg-fixed bg-center" style={{ backgroundImage: `url(${multiculturalBg})` }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 bg-background/90" />
      <div className="relative flex min-h-screen flex-col">
      <div id="google_translate_element" className="hidden" />
      <header className="ml-header relative z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-2.5 py-0.5 flex flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-1">
          <button className="block min-w-0 flex-1" onClick={() => setActiveRoute('home')} aria-label="Multi-Lingual™ by Bricktown Software Systems — home">
            <span className="flex h-8 w-full items-center gap-2 rounded-lg bg-banner-navy px-2 shadow-sm">
              <img src={mlBannerWordmark} alt="Multi-Lingual™" width={1160} height={230} className="h-6 w-auto shrink-0 object-contain" />
              <span data-banner-tagline className="min-w-0 flex-1 whitespace-normal text-right text-[9px] font-bold uppercase leading-tight tracking-normal text-ink-foreground/70">{bannerTaglineCopy[globalLocale]}</span>
            </span>
          </button>
          <QrAccessButton locale={globalLocale} onOpen={()=>setWalletOpen(true)}/>
          </div>
          <nav className="flex min-w-0 max-w-full flex-col items-stretch gap-0.5">
            <span className="grid w-full items-stretch gap-0.5 text-[11px] font-bold uppercase tracking-normal [&>*]:flex [&>*]:min-w-0 [&>*]:items-center [&>*]:justify-center [&>*]:whitespace-normal [&>*]:break-words [&>*]:text-center [&>*]:leading-[1.15]" style={{ gridTemplateColumns: '0.78fr 1fr 1.15fr 1.42fr' }}>
              {navLink('home', text.overview)}
              {navLink('cockpit', text.pricing)}
              <Button data-navigation-tab="trial-pass" aria-current={activeTab === 'trial-pass' ? 'page' : undefined} onClick={() => setActiveRoute('trial-pass')} className={`rounded-lg border border-thunder bg-thunder h-auto px-1 py-0.5 text-[11px] font-black text-ink shadow transition hover:brightness-110 ${activeTab === 'trial-pass' ? 'ring-2 ring-thunder/50 ring-offset-1 ring-offset-background' : ''}`}><span aria-hidden>🔥</span> {text.freePass} <span aria-hidden>🔥</span></Button>
              <Button data-navigation-tab="partner" aria-current={activeTab === 'partner' ? 'page' : undefined} onClick={() => setActiveRoute('partner')} className={`h-auto min-w-0 whitespace-normal break-words px-1 py-0.5 text-[11px] font-black shadow border border-thunder bg-thunder text-ink hover:brightness-110 ${activeTab === 'partner' ? 'ring-2 ring-thunder/50 ring-offset-1 ring-offset-background' : ''}`}>
                <span className="text-center leading-tight">{text.partnerTabTop} <span aria-hidden>🔥</span></span>

              </Button>
            </span>
            <TellerAnnouncement locale={globalLocale} onOpen={()=>setActiveRoute('walking')} active={activeTab==='walking'} />
            <Button type="button" data-meetings-tab data-navigation-tab="meetings" aria-current={activeTab === 'meetings' ? 'page' : undefined} onClick={() => setActiveRoute('meetings')} className={`flex h-auto min-w-0 w-full flex-col items-center gap-0.5 rounded-lg bg-signal px-2 py-0.5 text-ink shadow transition hover:brightness-110 ${activeTab === 'meetings' ? 'ring-2 ring-thunder/60 ring-offset-1 ring-offset-background' : ''}`}>
              <span className={`text-center text-[11px] font-black uppercase leading-[1.35] tracking-wide ${activeTab === 'meetings' ? 'underline decoration-2 underline-offset-2' : ''}`}>{meetingRoomCopy[globalLocale].tab}</span>
            </Button>
            <AnswerCallScreen />
          </nav>

        </div>
      </header>

      <aside data-qr-sharing-offer><VenueQRPreview locale={globalLocale} /></aside>
      <div className="relative z-30 bg-background/90 backdrop-blur">
        <FlagBanner flags={ALL_FLAGS} locale={globalLocale} onSelect={handleFlagClick} />
      </div>
      <Dialog open={walletOpen} onOpenChange={setWalletOpen}><DialogContent data-wallet-panel className="max-h-[85dvh] max-w-xl overflow-y-auto"><DialogHeader><DialogTitle>{qrAccessCopy[globalLocale].access}</DialogTitle></DialogHeader><QrWallet locale={globalLocale} onLanguage={restoreWalletLanguage}/></DialogContent></Dialog>




      <div className="border-b border-border bg-primary/5 px-4 py-2 text-center">
        <p className="mx-auto max-w-3xl text-[13px] font-medium leading-relaxed text-muted-foreground">{carrierText.trialBadge}</p>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        {activeTab !== 'home' && activeTab !== 'walking' && <div className="mb-4 flex justify-end"><Button data-view-close variant="outline" size="icon" aria-label={qrAccessCopy[globalLocale].cancel} title={qrAccessCopy[globalLocale].cancel} onClick={()=>setActiveRoute('home')}><X size={24}/></Button></div>}
        {activeTab === 'wallet' && <QrWallet locale={globalLocale} onLanguage={restoreWalletLanguage}/>}
        {activeTab === 'home' && (
          <div className="space-y-24">
            <section className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-banner-navy p-8 text-ink-foreground shadow-2xl md:grid-cols-2 md:p-12" data-hero-skyline>
              <div aria-hidden data-skyline-layer className="ml-skyline-layer" style={{ backgroundImage: `url(${okcSkyline})` }} />
              <div aria-hidden className="ml-skyline-overlay absolute inset-0" />

              <div className="relative min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent">{heroDetails.origin}</p>
                <p className="mt-4 inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-black text-primary-foreground">{text.sellingPoint}</p>
                <h1 className="mt-6 text-4xl font-black leading-tight [overflow-wrap:anywhere] md:text-5xl">{text.headline}</h1>
                <p data-privacy-notice className="mt-5 rounded-xl border border-ink-foreground/25 bg-ink-foreground/10 px-4 py-3 text-sm font-semibold leading-relaxed">{complianceText.privacy}</p>
                <p className="mt-6 text-base leading-relaxed opacity-85">{travel.overview}</p>
                <p className="mt-5 text-base leading-relaxed opacity-85">{qrAccessCopy[globalLocale].internet}</p>
                <Button className="mt-8 h-auto w-full whitespace-normal py-3" onClick={()=>setActiveRoute('walking')}>{qrAccessCopy[globalLocale].internet}</Button>

              </div>
              <img src={heroTeam} alt="A team talking with colleagues abroad on a video call" width={1536} height={1024} className="relative w-full rounded-3xl border-4 border-ink-foreground/20 object-cover shadow-2xl" />
            </section>

            <section className="grid grid-cols-2 gap-6 rounded-3xl bg-card p-8 text-center md:grid-cols-4">
              {[["243+", ui.statLanguages], [oneClickLabel[globalLocale], ui.statJoin], ["0", ui.statApps], [formatRegionalPrice('single'), ui.statPrice]].map(([n, l]) => (
                <div key={l}><div className="text-3xl font-black text-primary md:text-4xl">{n}</div><div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{l}</div></div>
              ))}
            </section>
            <MenuDiagnosis locale={globalLocale} />

            <section>
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-accent">{ui.whoEyebrow}</p>
                <h2 className="mt-3 text-3xl font-black md:text-4xl">{ui.whoTitle}</h2>
                <p className="mt-4 text-muted-foreground">{ui.whoBody}</p>
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {audiences.map((a) => {
                  return (
                    <article key={a.title} className={`group relative overflow-hidden rounded-3xl border border-border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}>
                      <img src={a.img} alt={a.title} loading="lazy" width={1024} height={1024} className="aspect-[4/3] w-full object-cover" />
                      <div className="p-6">
                        <h3 className="text-lg font-black">{a.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>


            <section>
              <h2 className="text-center text-3xl font-black md:text-4xl">{text.capabilityTitle}</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {features.map((f) => (
                  <div key={f.t} className="rounded-3xl border border-border bg-card p-8">
                    <h3 className="text-lg font-black">{f.t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.b}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-center text-3xl font-black md:text-4xl">{ui.howTitle}</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {ui.steps.map(([t, b], i) => [String(i + 1), t, b] as const).map(([n, t, b]) => (
                  <div key={n} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-black text-primary-foreground">{n}</span>
                    <div><h3 className="font-black">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{b}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              {testimonials.map((q) => (
                <figure key={q.name} className="rounded-3xl border border-border bg-background p-8 shadow-sm">
                  <blockquote className="text-sm leading-relaxed">“{q.quote}”</blockquote>
                  <figcaption className="mt-4 text-xs font-bold text-muted-foreground">{q.name} · {q.role}</figcaption>
                </figure>
              ))}
            </section>

            <DepartmentContacts locale={globalLocale} />

            <SuggestionBox locale={globalLocale} />

            <section className="rounded-3xl bg-ink p-10 text-center text-ink-foreground md:p-16">
              <h2 className="text-3xl font-black md:text-4xl">{ui.ctaTitle}</h2>
              <p className="mx-auto mt-4 max-w-xl opacity-80">{ui.ctaBody}</p>
              <button onClick={() => setActiveRoute('trial-pass')} className="mt-8 rounded-xl bg-primary px-8 py-3 font-black text-primary-foreground transition hover:opacity-90">{text.freePass}</button>
            </section>
          </div>
        )}

        {activeTab === 'cockpit' && (
          <>
          <section data-pricing-matrix className="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="min-w-0">
              <h2 className="text-2xl font-black">{ui.cockpitTitle}</h2>
              <p className="mt-1 text-xs font-mono text-muted-foreground">{currency.node}</p>
              <p className="mt-2 min-w-0 max-w-full whitespace-normal break-words text-sm font-semibold text-accent [hyphens:auto]">{unlimitedMinutesCopy[globalLocale]}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {packs.map((p) => (
                  <Button data-pricing-card={p.id} variant="ghost" key={p.id} aria-pressed={activeLicensePack === p.id} onClick={() => setActiveLicensePack(p.id)} className={`h-auto min-w-0 w-full items-stretch whitespace-normal flex min-h-28 flex-col justify-between gap-1 rounded-xl border p-4 text-left transition ${activeLicensePack === p.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-accent'}`}>
                    <span className="block min-w-0 break-words text-xs font-bold uppercase tracking-wider">{p.name}</span>
                    <strong className="block text-xs font-medium text-muted-foreground">{formatSeats(globalLocale, p.seats)}</strong>
                    <span data-package-duration className="block text-xs font-semibold text-accent">{packageDurationLabel(p.id, globalLocale)}</span>
                    {packagePersonalTranslatorLabel(p.id, globalLocale) && <span data-personal-included className="block text-xs font-semibold text-accent">{packagePersonalTranslatorLabel(p.id, globalLocale)}</span>}
                    <span className="block min-w-0 break-words text-xl font-black"><span translate="no">{formatRegionalPrice(p.id)}</span> <span className="text-xs font-medium text-muted-foreground">{ck.oneTime}</span></span>
                    <span className="block min-w-0 break-words text-[11px] font-bold uppercase tracking-wider text-accent">{ck.noContract} • {ck.included}</span>
                  </Button>
                ))}
              </div>
            </div>
            <aside data-pricing-summary className="min-w-0 h-fit space-y-3 rounded-2xl border border-border bg-card p-6 text-sm">
              <label className="block space-y-2 text-xs font-bold"><span>{walletClarityCopy[globalLocale].plans}</span><select data-checkout-plan-review className="min-h-11 w-full rounded-md border border-border bg-background px-2" value={activeLicensePack} onChange={e=>setActiveLicensePack(e.target.value)}>{packs.map(p=><option key={p.id} value={p.id}>{p.name} · {formatRegionalPrice(p.id)}</option>)}</select></label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><span className="min-w-0 break-words">{selectedPackage.name}</span><span className="whitespace-nowrap" translate="no">{formatRegionalPrice(selectedPackage.id)}</span></div>
              <div className="text-muted-foreground">{formatSeats(globalLocale, selectedPackage.seats)}</div>
              <div data-package-duration className="text-xs font-semibold text-accent">{packageDurationLabel(selectedPackage.id, globalLocale)}</div>
              {packagePersonalTranslatorLabel(selectedPackage.id, globalLocale) && <div data-personal-included className="text-xs font-semibold text-accent">{packagePersonalTranslatorLabel(selectedPackage.id, globalLocale)}</div>}
              <div className="min-w-0 max-w-full whitespace-normal break-words font-semibold text-accent [hyphens:auto]">{unlimitedMinutesCopy[globalLocale]}</div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-muted-foreground"><span className="min-w-0 break-words">{ui.stripeFee}</span><span className="whitespace-nowrap" translate="no">+{formatGeoPrice(stripeFixedProcessingFee, selectedBillingPlan)}</span></div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-t border-border pt-3 font-black"><span className="min-w-0 break-words">{ui.total}</span><span className="whitespace-nowrap" translate="no">{formatFlagTotal(selectedPackage.id, selectedPackage.price, stripeFixedProcessingFee, selectedBillingPlan)}</span></div>
              <div className="text-xs font-bold uppercase tracking-wider text-accent">{ck.noContract}</div>
              <div data-checkout-options className="grid gap-4 pt-1">
                <label className="ml-check-row grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 text-xs"><input type="checkbox" checked={autoPay} onChange={e => setAutoPay(e.target.checked)} className="mt-0.5 ml-check" /><span className="min-w-0 break-words">{ck.autoPay}</span></label>
                <label className="ml-check-row grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 text-xs"><input type="checkbox" checked={rememberPayment} onChange={e => setRememberPayment(e.target.checked)} className="mt-0.5 ml-check" /><span className="min-w-0 break-words">{ck.rememberPayment}</span></label>
              </div>
              <p className="text-xs text-muted-foreground">{ck.preview}</p>
              <p className="text-xs text-muted-foreground">{ck.feeNote.split('{fee}')[0]}<span translate="no">{formatGeoPrice(stripeFixedProcessingFee, selectedBillingPlan)}</span>{ck.feeNote.split('{fee}')[1]}</p>
              {Object.hasOwn(packageCheckoutPrices, selectedPackage.id) && (
                <Button
                  type="button"
                  data-stripe-checkout={selectedPackage.id}
                  disabled={checkoutBusy || !canCheckoutCurrency(selectedPackage.id, pricePlan.code)}
                  onClick={() => void startCheckout()}
                  className="h-auto w-full whitespace-normal rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90"
                >
                  {ck.buyNow}
                </Button>
              )}
              {checkoutStatus === 'success' && <p role="status" className="text-sm font-bold text-accent">{ck.success}</p>}
              {checkoutStatus === 'cancelled' && <p role="status" className="text-sm font-bold text-muted-foreground">{ck.cancelled}</p>}
              {checkoutStatus === 'error' && <p role="status" className="text-sm font-bold text-muted-foreground">{ck.cancelled}</p>}
            </aside>
          </section>
          <PrivateMessaging locale={globalLocale} pricePlan={selectedBillingPlan} />
          </>
        )}

        {activeTab === 'trial-pass' && (
          <section className="mx-auto max-w-2xl space-y-6 rounded-3xl bg-thunder/10 p-4">
            <div className="rounded-2xl border border-thunder bg-thunder p-6">
              <h2 className="text-2xl font-black text-ink">{ui.trialTitle}</h2>
              <p data-trial-no-signup className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-black uppercase leading-none tracking-wide text-ink-foreground"><span aria-hidden>✓</span> {ui.trialNoSignup}</p>
              <Button type="button" data-voice-pass aria-pressed={voiceState === 'listening'} onClick={() => {if(voiceState==='listening')void toggleVoicePass();else setVoicePermission(true);}} className="mt-3 h-auto w-full whitespace-normal rounded-2xl bg-ink px-4 py-4 text-lg font-black text-ink-foreground shadow-lg transition hover:brightness-110">{voiceState === 'listening' ? voicePassCopy[globalLocale].stop : voicePassCopy[globalLocale].button}</Button>
              {voicePermission&&<MicrophonePermissionNotice locale={globalLocale} onContinue={()=>{setVoicePermission(false);void toggleVoicePass();}} onCancel={()=>setVoicePermission(false)}/>}
              {voiceState === 'listening' && <p role="status" className="mt-2 text-sm font-bold text-ink">{voicePassCopy[globalLocale].listening}</p>}
              {voiceState === 'denied' && <p role="status" className="mt-2 text-sm font-bold text-ink">{voicePassCopy[globalLocale].denied}</p>}
              <p className="mt-2 text-sm text-ink/80">{ui.trialBody}</p>
              <PassInterface locale={globalLocale} state={passInterface} onOpen={() => setActiveRoute('walking')} />
              <LobbyAdCard locale={globalLocale} state={passInterface} onSelect={handleFlagClick} />
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink/20 bg-ink-foreground p-2">
                <code className="flex-1 truncate px-2 text-xs text-ink">{uniqueSessionPassUrl}</code>
                <button onClick={copyPass} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ink-foreground">{hasCopiedUrl ? ui.copied : ui.copy}</button>
                <button onClick={sharePass} className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ink-foreground">📤 {passShare.share}</button>
              </div>
            </div>
            <form onSubmit={handleInviteTransmission} className="space-y-4 rounded-2xl border border-thunder bg-thunder p-6">
              <h3 className="font-black text-ink">📲 {outreachCopy[globalLocale].title}</h3>
              <ol className="space-y-1 text-sm leading-relaxed text-ink/80">
                {outreachCopy[globalLocale].steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
              <p className="text-sm font-bold text-ink">{outreachCopy[globalLocale].useFor}</p>
              <Button type="button" aria-expanded={podiumOpen} onClick={() => { setPodiumLocale(globalLocale); setPodiumOpen(true); }} className="h-auto w-full whitespace-normal rounded-lg bg-ink px-3 py-3 text-sm font-bold text-ink-foreground">🖨️ {outreachCopy[globalLocale].popupTitle}</Button>
              {podiumOpen && (
                <div role="dialog" aria-label={outreachCopy[podiumLocale].popupTitle} className="space-y-3 rounded-xl border border-ink bg-ink-foreground p-4 text-ink">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black">🖨️ {outreachCopy[podiumLocale].popupTitle}</p>
                    <label className="flex items-center gap-2 text-xs font-bold">
                      {outreachCopy[podiumLocale].popupLanguage}
                      <select value={podiumLocale} onChange={(e) => setPodiumLocale(e.target.value as UILocale)} className="rounded-lg border border-ink/30 bg-ink-foreground px-2 py-1 text-ink">
                        {(Object.keys(outreachLocaleNames) as UILocale[]).map((l) => <option key={l} value={l}>{outreachLocaleNames[l]}</option>)}
                      </select>
                    </label>
                  </div>
                  <p className="text-sm leading-relaxed">{outreachCopy[podiumLocale].popupBody}</p>
                  {passInterface.qr && <div data-qr-guide-box className="mx-auto w-full max-w-xl space-y-2 rounded-xl bg-background p-3">
                    <QrSaveHint locale={podiumLocale}/>
                    <img data-podium-qr src={passInterface.qr} width={192} height={192} alt={passInterfaceCopy[podiumLocale].title} className="mx-auto h-48 w-48 max-w-full rounded-lg" />
                    <QrEarningFooter locale={podiumLocale} purpose="business"/>
                  </div>}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {outreachCopy[podiumLocale].listenChoices.map((c) => <span key={c} className="rounded-lg border border-ink/20 px-3 py-2 text-xs font-bold">{c}</span>)}
                  </div>
                  <p className="text-xs font-bold">🔵 {outreachCopy[podiumLocale].bluetooth}</p>
                  <Button type="button" onClick={() => setPodiumOpen(false)} className="rounded-lg bg-ink text-xs font-bold text-ink-foreground">{outreachCopy[podiumLocale].close}</Button>
                </div>
              )}
              <div className="flex gap-2 rounded-xl border border-ink/20 bg-ink-foreground p-1">
                {(['text', 'email'] as const).map((c) => (
                  <button type="button" key={c} onClick={() => setInviteChannel(c)} className={`flex-1 rounded-lg py-1.5 text-xs font-bold uppercase ${inviteChannel === c ? 'bg-ink text-ink-foreground' : 'text-ink/70'}`}>{c === 'text' ? ui.textChannel : ui.emailChannel}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <textarea rows={3} value={inviteTarget} onChange={(e) => setInviteDestination(e.target.value)} placeholder={ui.copy} className="flex-1 rounded-xl border border-ink/20 bg-ink-foreground px-4 py-2.5 text-sm text-ink focus:border-ink focus:outline-none" required />
                <button type="submit" className="rounded-xl bg-ink px-4 text-sm font-black text-ink-foreground">{ui.dispatch}</button>
              </div>
              <ScheduleReminderMatrix locale={globalLocale} />
            </form>
            <div className="rounded-2xl border border-thunder bg-thunder p-6">
              <p className="text-sm leading-relaxed text-ink/80">{travel.referral}</p>
              <Button onClick={copyPass} className="mt-4 max-w-full whitespace-normal bg-ink text-ink-foreground">{hasCopiedUrl ? ui.copied : ui.copy}</Button>
            </div>
          </section>
        )}

        {activeTab === 'walking' && <TalkingEnvironment locale={globalLocale} onExit={()=>setActiveRoute('home')} />}
        {activeTab === 'meetings' && <MeetingRoomPreview locale={globalLocale} />}

        {activeTab === 'partner' && (
          <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
            <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">{text.partnerTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text.partnerBody}</p>
            <AffiliateQR locale={globalLocale} />
          </section>
        )}

        {activeTab === 'legal' && (
          <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8">
            <h2 className="break-words text-2xl font-black" translate="no">{corporateName}</h2>
            <p className="mt-2 font-bold">{ui.legalTitle}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{ui.legalBody}</p>
          </section>
        )}

        {activeTab === 'complaints' && <ComplaintDesk locale={globalLocale} />}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-0 px-4 py-3 text-center text-xs leading-snug text-muted-foreground">
          <Button data-navigation-tab="legal" aria-current={activeTab === 'legal' ? 'page' : undefined} onClick={() => setActiveRoute('legal')} variant="ghost" className="h-auto min-h-11 whitespace-normal px-1 py-1 text-xs text-muted-foreground">{ui.legalPrivacy}</Button>
          <span aria-hidden="true" className="select-none text-border">·</span>
          <Button data-navigation-tab="legal" aria-current={activeTab === 'legal' ? 'page' : undefined} onClick={() => setActiveRoute('legal')} variant="ghost" className="h-auto min-h-11 whitespace-normal px-1 py-1 text-xs text-muted-foreground">{ui.terms}</Button>
          <span aria-hidden="true" className="select-none text-border">·</span>
          <Button data-navigation-tab="complaints" aria-current={activeTab === 'complaints' ? 'page' : undefined} onClick={() => setActiveRoute('complaints')} variant="ghost" className="h-auto min-h-11 whitespace-normal px-1 py-1 text-xs text-muted-foreground">{complaintCopy[globalLocale].footer}</Button>
          <span aria-hidden="true" className="select-none text-border">·</span>
          <span className="font-mono uppercase">{ui.adFree}</span>
          <span aria-hidden="true" className="select-none text-border">·</span>
          <span translate="no">© {new Date().getFullYear()} {corporateName}</span>
        </div>
      </footer>
      </div>
    </div>
  );
}
