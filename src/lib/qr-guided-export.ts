import { qrPlacementCopy } from './venue-qr-copy';
// Preserve the QR and quiet zone; placement text is outside the code.
export function qrExportLayout(qrWidth: number, qrHeight: number) {
  if ([qrWidth, qrHeight].some(value => !Number.isFinite(value) || value <= 0)) {
    throw new Error('Invalid QR image dimensions');
  }
  const width = Math.max(960, qrWidth);
  return { width, height: qrHeight, qrX: Math.floor((width - qrWidth) / 2), qrY: 0 };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('QR image unavailable'));
    image.src = src;
  });
}

export async function createGuidedQrExport(qr: string): Promise<string> {
  const code = await loadImage(qr);
  const layout = qrExportLayout(code.naturalWidth, code.naturalHeight);
  const copy = qrPlacementCopy(document.documentElement.lang || 'en');
  const canvas = document.createElement('canvas');
  canvas.width = layout.width;
  canvas.height = layout.height + 280;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('QR export unavailable');
  // Use the QR's own opaque quiet-zone pixel as the export background.
  context.drawImage(code, 0, 0);
  const background = context.getImageData(0, 0, 1, 1).data;
  context.fillStyle = `rgb(${background[0]}, ${background[1]}, ${background[2]})`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(code, layout.qrX, layout.qrY);
  // Reuse the QR's own darkest pixel for legible print, not the page's dark theme.
  const pixels = context.getImageData(layout.qrX, 0, code.naturalWidth, code.naturalHeight).data;
  let darkest = 0;
  for (let i = 4; i < pixels.length; i += 4) {
    if ((pixels[i] ?? 255) + (pixels[i + 1] ?? 255) + (pixels[i + 2] ?? 255) < (pixels[darkest] ?? 255) + (pixels[darkest + 1] ?? 255) + (pixels[darkest + 2] ?? 255)) darkest = i;
  }
  context.fillStyle = `rgb(${pixels[darkest]}, ${pixels[darkest + 1]}, ${pixels[darkest + 2]})`;
  context.font = '28px sans-serif';
  context.textAlign = 'center';
  let y = layout.height + 48;
  for (const text of [copy.title, copy.notice]) {
    let line = '';
    for (const character of Array.from(text)) {
      if (context.measureText(line + character).width > layout.width - 80) { context.fillText(line, layout.width / 2, y); y += 38; line = ''; }
      line += character;
    }
    if (line) { context.fillText(line, layout.width / 2, y); y += 48; }
  }
  return canvas.toDataURL('image/png');
}
