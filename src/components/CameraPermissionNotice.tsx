import { Button } from '@/components/ui/button';
const copy = {
 en: ['Allow camera access', 'Your camera is used only while it is open and is released when you close it or leave this screen.', 'Continue', 'Cancel'],
 es: ['Permite el acceso a la cámara', 'La cámara solo se usa mientras está abierta y se apaga al cerrarla o salir de esta pantalla.', 'Continuar', 'Cancelar'],
 zh: ['允许使用相机', '相机仅在开启期间使用，关闭相机或离开此页面后停止使用。', '继续', '取消'],
 de: ['Kamerazugriff erlauben', 'Die Kamera wird nur verwendet, solange sie geöffnet ist, und beim Schließen oder Verlassen dieser Ansicht freigegeben.', 'Weiter', 'Abbrechen'],
 tl: ['Payagan ang camera', 'Ginagamit lang ang camera habang bukas ito at ihihinto kapag isinara o umalis sa screen na ito.', 'Magpatuloy', 'Kanselahin'],
 ja: ['カメラの使用を許可', 'カメラは開いている間のみ使用し、閉じるかこの画面を離れると停止します。', '続ける', 'キャンセル'],
};
export default function CameraPermissionNotice({ locale, onContinue, onCancel }: { locale: string; onContinue: () => void; onCancel: () => void }) {
 const c = copy[locale as keyof typeof copy] ?? copy.en;
 return <div data-camera-permission role="region" aria-label={c[0]} className="w-full space-y-3 text-center">
  <p className="text-sm font-bold">{c[0]}</p><p className="text-xs text-muted-foreground">{c[1]}</p>
  <div className="flex justify-center gap-2"><Button onClick={onContinue}>{c[2]}</Button><Button variant="outline" onClick={onCancel}>{c[3]}</Button></div>
 </div>;
}