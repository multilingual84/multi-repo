// Continent grouping for the all-languages grid; purely organizational, so
// visitors can see many options at once without a long scroll.
import { PRIMARY_FLAGS, type FlagEntry } from './flag-catalog';

export type FlagRegion = 'africa' | 'americas' | 'asia' | 'europe' | 'mena' | 'oceania';

const REGION_BY_COUNTRY: Record<string, FlagRegion> = {
  // Americas
  us: 'americas', mx: 'americas', br: 'americas', ht: 'americas', pe: 'americas', py: 'americas', ca: 'americas',
  jm: 'americas', tt: 'americas', co: 'americas', ar: 'americas', cl: 'americas', ve: 'americas', ec: 'americas',
  gt: 'americas', cu: 'americas', bo: 'americas', do: 'americas', hn: 'americas', sv: 'americas', ni: 'americas',
  cr: 'americas', pa: 'americas', uy: 'americas', pr: 'americas',
  // Europe
  fr: 'europe', it: 'europe', pt: 'europe', ru: 'europe', ua: 'europe', pl: 'europe', nl: 'europe', se: 'europe',
  no: 'europe', dk: 'europe', fi: 'europe', is: 'europe', ie: 'europe', gr: 'europe', tr: 'europe', cz: 'europe',
  sk: 'europe', hu: 'europe', ro: 'europe', bg: 'europe', rs: 'europe', hr: 'europe', si: 'europe', lt: 'europe',
  lv: 'europe', ee: 'europe', al: 'europe', mt: 'europe', lu: 'europe', by: 'europe', mk: 'europe', ba: 'europe',
  gb: 'europe', 'gb-wls': 'europe', 'gb-sct': 'europe', es: 'europe', be: 'europe', ch: 'europe', at: 'europe', de: 'europe',
  // Middle East & North Africa
  sa: 'mena', il: 'mena', ir: 'mena', ae: 'mena', iq: 'mena', jo: 'mena', kw: 'mena', qa: 'mena', ye: 'mena',
  ma: 'mena', dz: 'mena', tn: 'mena', ly: 'mena', eg: 'mena', sd: 'mena',
  // Africa
  et: 'africa', so: 'africa', ke: 'africa', ng: 'africa', za: 'africa', zw: 'africa', rw: 'africa', mg: 'africa',
  gh: 'africa', gq: 'africa', ao: 'africa', mz: 'africa', cv: 'africa', ci: 'africa', sn: 'africa', cm: 'africa',
  cd: 'africa', er: 'africa', tz: 'africa', ug: 'africa',
  // Asia
  in: 'asia', pk: 'asia', bd: 'asia', lk: 'asia', np: 'asia', kr: 'asia', tw: 'asia', vn: 'asia', th: 'asia',
  la: 'asia', kh: 'asia', mm: 'asia', id: 'asia', my: 'asia', mn: 'asia', kz: 'asia', uz: 'asia', tj: 'asia',
  kg: 'asia', tm: 'asia', ge: 'asia', am: 'asia', az: 'asia', af: 'asia', hk: 'asia', sg: 'asia', cn: 'asia',
  jp: 'asia', ph: 'asia',
  // Oceania
  au: 'oceania', nz: 'oceania', ws: 'oceania',
};

export const FLAG_REGION_ORDER: FlagRegion[] = ['americas', 'europe', 'mena', 'africa', 'asia', 'oceania'];

export function regionFor(country: string): FlagRegion {
  return REGION_BY_COUNTRY[country] ?? 'africa';
}

export function flagsByRegion(): { region: FlagRegion; flags: FlagEntry[] }[] {
  return FLAG_REGION_ORDER.map((region) => ({
    region,
    flags: PRIMARY_FLAGS.filter((flag) => regionFor(flag.country) === region),
  }));
}
