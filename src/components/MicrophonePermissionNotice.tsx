import { Button } from '@/components/ui/button';
const copy = {
 en: ['Allow microphone access', 'Your microphone is used only during this conversation and is released when it ends.', 'A two-phone call ends automatically if either person hangs up or disconnects.', 'Continue', 'Cancel'],
 es: ['Permite el acceso al micrófono', 'El micrófono solo se usa durante esta conversación y se libera al terminar.', 'La llamada entre dos teléfonos termina automáticamente si alguien cuelga o se desconecta.', 'Continuar', 'Cancelar'],
 zh: ['允许使用麦克风', '麦克风仅在本次对话期间使用，结束后即停止使用。', '双手机通话中，任何一方挂断或断开连接都会自动结束通话。', '继续', '取消'],
 de: ['Mikrofonzugriff erlauben', 'Das Mikrofon wird nur während dieses Gesprächs genutzt und danach freigegeben.', 'Ein Anruf zwischen zwei Telefonen endet automatisch, wenn jemand auflegt oder die Verbindung verliert.', 'Weiter', 'Abbrechen'],
 tl: ['Payagan ang mikropono', 'Ginagamit lang ang mikropono sa pag-uusap na ito at ihihinto kapag natapos.', 'Awtomatikong matatapos ang tawag sa dalawang telepono kapag may nag-hang up o nadiskonekta.', 'Magpatuloy', 'Kanselahin'],
 ja: ['マイクの使用を許可', 'マイクはこの会話中のみ使用し、終了時に停止します。', '2台の電話での通話は、どちらかが切るか接続が切れると自動終了します。', '続ける', 'キャンセル'],
};
export default function MicrophonePermissionNotice({ locale, twoPhones = false, description, onContinue, onCancel }: { locale: string; twoPhones?: boolean; description?: string; onContinue: () => void; onCancel: () => void }) {
 const c = copy[locale as keyof typeof copy] ?? copy.en;
 return <div data-mic-permission role="region" aria-label={c[0]} className="w-full space-y-3 text-center">
  <p className="text-sm font-bold">{c[0]}</p><p className="text-xs text-muted-foreground">{description??c[1]}</p>
  {twoPhones && <p className="text-xs text-muted-foreground">{c[2]}</p>}
  <div className="flex justify-center gap-2"><Button onClick={onContinue}>{c[3]}</Button><Button variant="outline" onClick={onCancel}>{c[4]}</Button></div>
 </div>;
}