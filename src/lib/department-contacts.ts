// Public-facing department contact aliases. Owner directive (2026-10-25):
// eight uniform department addresses on the public domain; every one of them
// is delivered to the owner's private inbox (OWNER_EMAIL secret, server-side
// only). The private address must never appear here or anywhere public.

import { commercialIdentity } from '@/lib/compliance/identity';

export type DepartmentId = 'support' | 'legal' | 'abuse' | 'marketing' | 'operations' | 'community-outreach' | 'partnerships' | 'accessibility';

export type DepartmentLocale = 'en' | 'es' | 'tl' | 'zh' | 'de' | 'ja';

const domain = commercialIdentity.publicDomain.replace(/^https?:\/\//, '');

/** Public alias for a department, e.g. legal@multi-lingual.tech. */
export function departmentEmail(id: DepartmentId): string {
  return `${id}@${domain}`;
}

export const departmentIds: readonly DepartmentId[] = ['support', 'legal', 'abuse', 'marketing', 'operations', 'community-outreach', 'partnerships', 'accessibility'] as const;

interface DepartmentCopy {
  title: string;
  note: string;
  labels: Record<DepartmentId, string>;
}

export const departmentContactCopy: Record<DepartmentLocale, DepartmentCopy> = {
  en: {
    title: 'Contact our departments',
    note: 'Every message reaches our team directly — pick the department that fits.',
    labels: { support: 'Support', legal: 'Legal', abuse: 'Report Abuse', marketing: 'Marketing', operations: 'Operations', 'community-outreach': 'Community Outreach', partnerships: 'Partnerships', accessibility: 'Accessibility' },
  },
  es: {
    title: 'Contacta nuestros departamentos',
    note: 'Cada mensaje llega directamente a nuestro equipo: elige el departamento adecuado.',
    labels: { support: 'Soporte', legal: 'Legal', abuse: 'Reportar abuso', marketing: 'Marketing', operations: 'Operaciones', 'community-outreach': 'Alcance comunitario', partnerships: 'Alianzas', accessibility: 'Accesibilidad' },
  },
  tl: {
    title: 'Makipag-ugnayan sa aming mga departamento',
    note: 'Ang bawat mensahe ay direktang umaabot sa aming koponan — piliin ang angkop na departamento.',
    labels: { support: 'Suporta', legal: 'Legal', abuse: 'Iulat ang Abuso', marketing: 'Marketing', operations: 'Operasyon', 'community-outreach': 'Pakikipag-ugnayan sa Komunidad', partnerships: 'Pakikipagsosyo', accessibility: 'Accessibility' },
  },
  zh: {
    title: '联系我们的各部门',
    note: '每条信息都会直接送达我们的团队——请选择对应的部门。',
    labels: { support: '支持', legal: '法务', abuse: '举报滥用', marketing: '市场', operations: '运营', 'community-outreach': '社区外展', partnerships: '合作伙伴', accessibility: '无障碍' },
  },
  de: {
    title: 'Kontaktieren Sie unsere Abteilungen',
    note: 'Jede Nachricht erreicht unser Team direkt — wählen Sie die passende Abteilung.',
    labels: { support: 'Support', legal: 'Recht', abuse: 'Missbrauch melden', marketing: 'Marketing', operations: 'Betrieb', 'community-outreach': 'Community-Outreach', partnerships: 'Partnerschaften', accessibility: 'Barrierefreiheit' },
  },
  ja: {
    title: '各部門へのお問い合わせ',
    note: 'すべてのメッセージはチームに直接届きます。該当する部門をお選びください。',
    labels: { support: 'サポート', legal: '法務', abuse: '不正利用の報告', marketing: 'マーケティング', operations: '運営', 'community-outreach': 'コミュニティアウトリーチ', partnerships: 'パートナーシップ', accessibility: 'アクセシビリティ' },
  },
};
