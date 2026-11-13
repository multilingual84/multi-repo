// Browser-safe copy for the failed-call screen: which networks a call can run on.
// Private networks (cellular data, home or work Wi-Fi) are allowed; public networks
// such as airports, restaurants and hotels do not carry these calls.
import type { UILocale } from './ui-copy';

type NetworkGuidance = { title: string; private: string; public: string; try: string };

export const networkGuidanceCopy: Record<UILocale, NetworkGuidance> = {
  en: {
    title: 'This call couldn’t connect',
    private: 'Calls work over private networks — your phone’s cellular data, or the Wi-Fi at your home or workplace.',
    public: 'Public Wi-Fi such as airports, restaurants and hotels does not carry these calls, so they can’t be completed there.',
    try: 'Switch to cellular data or a private Wi-Fi network, then try again.',
  },
  es: {
    title: 'Esta llamada no pudo conectarse',
    private: 'Las llamadas funcionan con redes privadas: los datos móviles de su teléfono o el Wi-Fi de su casa o lugar de trabajo.',
    public: 'El Wi-Fi público, como el de aeropuertos, restaurantes y hoteles, no transmite estas llamadas, así que no se pueden completar ahí.',
    try: 'Cambie a datos móviles o a una red Wi-Fi privada y vuelva a intentarlo.',
  },
  tl: {
    title: 'Hindi nakonekta ang tawag na ito',
    private: 'Gumagana ang mga tawag sa pribadong network — ang cellular data ng iyong telepono, o ang Wi-Fi sa iyong bahay o lugar ng trabaho.',
    public: 'Ang pampublikong Wi-Fi tulad ng sa paliparan, restaurant o hotel ay hindi dumadala ng mga tawag na ito, kaya hindi ito magagawa doon.',
    try: 'Lumipat sa cellular data o sa pribadong Wi-Fi network, at subukang muli.',
  },
  zh: {
    title: '此通话无法连接',
    private: '通话可通过私人网络进行——您手机的移动数据，或您家中或工作场所的 Wi-Fi。',
    public: '机场、餐厅、酒店等公共 Wi-Fi 不承载此类通话，因此无法在那里完成。',
    try: '请改用移动数据或私人 Wi-Fi 网络，然后再试一次。',
  },
  de: {
    title: 'Dieser Anruf konnte nicht verbunden werden',
    private: 'Anrufe funktionieren über private Netzwerke — die mobilen Daten Ihres Telefons oder das WLAN zu Hause oder am Arbeitsplatz.',
    public: 'Öffentliches WLAN, etwa in Flughäfen, Restaurants und Hotels, überträgt diese Anrufe nicht, daher können sie dort nicht abgeschlossen werden.',
    try: 'Wechseln Sie zu mobilen Daten oder einem privaten WLAN und versuchen Sie es erneut.',
  },
  ja: {
    title: 'この通話は接続できませんでした',
    private: '通話はプライベートなネットワークで利用できます — スマートフォンのモバイルデータ、またはご自宅や職場のWi-Fi。',
    public: '空港、レストラン、ホテルなどの公衆Wi-Fiではこうした通話は届かないため、そこでは完了できません。',
    try: 'モバイルデータまたはプライベートなWi-Fiに切り替えて、もう一度お試しください。',
  },
};
