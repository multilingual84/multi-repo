import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Copy = { title: string; dateLabel: string; intervalsLabel: string; intervals: [string, string, string]; body: string; confirm: string; queued: string; need: string };

const copy: Record<'en' | 'es' | 'tl' | 'zh' | 'de' | 'ja', Copy> = {
  en: {
    title: '📅 Multi-Lingual™ Automated Schedule & Reminder Matrix',
    dateLabel: 'Set Cross-Border Event Time',
    intervalsLabel: 'Reminder intervals',
    intervals: ['15 Minutes Before', '1 Hour Before', '24 Hours Before'],
    body: 'Plan international conversations, legal appointments, and property walkthroughs with text and email countdown reminders at your chosen intervals. Preview only — automated delivery is not connected yet.',
    confirm: 'Lock In Event Schedule',
    queued: 'Event scheduled (preview only — no reminders are sent yet)',
    need: 'Pick a time and at least one reminder',
  },
  es: {
    title: '📅 Matriz de Agenda y Recordatorios Automáticos Multi-Lingual™',
    dateLabel: 'Fijar hora del evento transfronterizo',
    intervalsLabel: 'Intervalos de recordatorio',
    intervals: ['15 minutos antes', '1 hora antes', '24 horas antes'],
    body: 'Planifique conversaciones internacionales, citas legales y visitas inmobiliarias con recordatorios de cuenta regresiva por texto y correo en los intervalos elegidos. Solo vista previa — el envío automático aún no está conectado.',
    confirm: 'Confirmar agenda del evento',
    queued: 'Evento programado (solo vista previa — aún no se envían recordatorios)',
    need: 'Elija una hora y al menos un recordatorio',
  },
  tl: {
    title: '📅 Multi-Lingual™ Awtomatikong Iskedyul at Paalala Matrix',
    dateLabel: 'Itakda ang Oras ng Cross-Border na Kaganapan',
    intervalsLabel: 'Mga pagitan ng paalala',
    intervals: ['15 Minuto Bago', '1 Oras Bago', '24 Oras Bago'],
    body: 'Magplano ng internasyonal na usapan, legal na appointment, at pagtingin sa ari-arian na may countdown na paalala sa text at email sa napiling pagitan. Preview lamang — hindi pa konektado ang awtomatikong pagpapadala.',
    confirm: 'I-lock ang Iskedyul',
    queued: 'Naka-iskedyul ang kaganapan (preview lamang — wala pang ipinapadalang paalala)',
    need: 'Pumili ng oras at kahit isang paalala',
  },
  zh: {
    title: '📅 Multi-Lingual™ 自动日程与提醒矩阵',
    dateLabel: '设置跨境活动时间',
    intervalsLabel: '提醒间隔',
    intervals: ['提前15分钟', '提前1小时', '提前24小时'],
    body: '安排国际交流、法律预约和房产看房，并按所选间隔设置短信和邮件倒计时提醒。仅预览 — 自动发送尚未连接。',
    confirm: '锁定活动日程',
    queued: '活动已安排(仅预览 — 尚未发送提醒)',
    need: '请选择时间并至少选择一个提醒',
  },
  de: {
    title: '📅 Multi-Lingual™ Automatisierte Termin- & Erinnerungsmatrix',
    dateLabel: 'Grenzüberschreitende Terminzeit festlegen',
    intervalsLabel: 'Erinnerungsintervalle',
    intervals: ['15 Minuten vorher', '1 Stunde vorher', '24 Stunden vorher'],
    body: 'Planen Sie internationale Gespräche, Rechtstermine und Besichtigungen mit SMS- und E-Mail-Countdown-Erinnerungen in gewählten Intervallen. Nur Vorschau — automatischer Versand noch nicht verbunden.',
    confirm: 'Terminplan festlegen',
    queued: 'Termin geplant (nur Vorschau — es werden noch keine Erinnerungen gesendet)',
    need: 'Wählen Sie eine Zeit und mindestens eine Erinnerung',
  },
  ja: {
    title: '📅 Multi-Lingual™ 自動スケジュール&リマインダーマトリクス',
    dateLabel: '越境イベント時刻を設定',
    intervalsLabel: 'リマインダー間隔',
    intervals: ['15分前', '1時間前', '24時間前'],
    body: '国際会話、法律相談、不動産内見を予定し、選択した間隔でSMSとメールのカウントダウン通知を設定できます。プレビューのみ — 自動送信は未接続です。',
    confirm: 'イベントスケジュールを確定',
    queued: 'イベントを予約しました(プレビューのみ — リマインダーはまだ送信されません)',
    need: '時刻と少なくとも1つのリマインダーを選択してください',
  },
};

export default function ScheduleReminderMatrix({ locale }: { locale: string }) {
  const c = copy[(locale in copy ? locale : 'en') as keyof typeof copy];
  const [when, setWhen] = useState('');
  const [picked, setPicked] = useState<boolean[]>([false, false, false]);
  const [status, setStatus] = useState('');

  return (
    <div className="min-w-0 space-y-4 rounded-2xl border border-thunder bg-thunder p-6" data-schedule-matrix>
      <h3 className="break-words font-black text-ink">{c.title}</h3>
      <label className="block min-w-0">
        <span className="text-xs font-bold uppercase text-ink/70">{c.dateLabel}</span>
        <input type="datetime-local" value={when} onChange={e => { setWhen(e.target.value); setStatus(''); }} className="mt-1 w-full min-w-0 rounded-xl border border-ink/20 bg-ink-foreground px-4 py-2.5 text-sm text-ink focus:border-ink focus:outline-none" />
      </label>
      <fieldset className="min-w-0">
        <legend className="text-xs font-bold uppercase text-ink/70">{c.intervalsLabel}</legend>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          {c.intervals.map((label, i) => (
            <label key={i} className={`flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold break-words ${picked[i] ? 'border-ink bg-ink text-ink-foreground' : 'border-ink/20 bg-ink-foreground text-ink/70'}`}>
              <input type="checkbox" checked={picked[i]} onChange={() => { setPicked(p => p.map((v, j) => (j === i ? !v : v))); setStatus(''); }} className="accent-ink" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="break-words text-sm leading-relaxed text-ink/80">{c.body}</p>
      <Button type="button" onClick={() => setStatus(when && picked.some(Boolean) ? c.queued : c.need)} className="h-auto w-full whitespace-normal break-words rounded-xl bg-ink py-3 text-xs font-black uppercase tracking-widest text-ink-foreground">{c.confirm}</Button>
      {status && <p role="status" className="break-words text-xs font-bold text-ink">{status}</p>}
    </div>
  );
}
