export function phonePairingLink(origin: string, id: string): string {
  if (!/^[a-zA-Z0-9]{12}$/.test(id)) throw new Error('Invalid pairing room');
  const url = new URL('/', origin);
  url.hash = `meeting-${id}`;
  return url.href;
}

export const phonePairingCopy = {
  en: { title: 'Pair phones with QR', scan: 'Scan this QR with the other phone’s camera. Open the link and choose Answer.', start: 'Start talking', copy: 'Copy link', copied: 'Link copied', close: 'Close', error: 'QR unavailable. Try again.', retry: 'Try again' },
  es: { title: 'Conectar teléfonos por QR', scan: 'Escanea este QR con la cámara del otro teléfono. Abre el enlace y elige Responder.', start: 'Empezar a hablar', copy: 'Copiar enlace', copied: 'Enlace copiado', close: 'Cerrar', error: 'QR no disponible. Inténtalo de nuevo.', retry: 'Reintentar' },
  zh: { title: '通过二维码配对手机', scan: '用另一部手机的相机扫描此二维码。打开链接并选择接听。', start: '开始通话', copy: '复制链接', copied: '链接已复制', close: '关闭', error: '二维码不可用。请重试。', retry: '重试' },
  de: { title: 'Telefone per QR verbinden', scan: 'Scanne diesen QR-Code mit der Kamera des anderen Telefons. Öffne den Link und wähle Annehmen.', start: 'Gespräch starten', copy: 'Link kopieren', copied: 'Link kopiert', close: 'Schließen', error: 'QR nicht verfügbar. Bitte erneut versuchen.', retry: 'Erneut versuchen' },
  tl: { title: 'Ipares ang mga telepono gamit ang QR', scan: 'I-scan ang QR gamit ang camera ng kabilang telepono. Buksan ang link at piliin ang Sagutin.', start: 'Magsimulang magsalita', copy: 'Kopyahin ang link', copied: 'Nakopya ang link', close: 'Isara', error: 'Hindi available ang QR. Subukan muli.', retry: 'Subukan muli' },
  ja: { title: 'QRでスマートフォンを接続', scan: '相手のスマートフォンのカメラでこのQRを読み取ってください。リンクを開き、応答を選んでください。', start: '通話を開始', copy: 'リンクをコピー', copied: 'リンクをコピーしました', close: '閉じる', error: 'QRを表示できません。もう一度お試しください。', retry: '再試行' },
};