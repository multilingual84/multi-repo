import { describe, expect, it } from 'vitest';
import { departmentContactCopy, departmentEmail, departmentIds, type DepartmentLocale } from '@/lib/department-contacts';

describe('department contact aliases', () => {
  it('offers the existing departments plus three additional public aliases', () => {
    expect(departmentIds).toEqual(['support', 'legal', 'abuse', 'marketing', 'operations', 'community-outreach', 'partnerships', 'accessibility']);
    for (const id of departmentIds) {
      expect(departmentEmail(id)).toBe(`${id}@multi-lingual.tech`);
    }
  });

  it('never exposes the owner private inbox', () => {
    const serialized = JSON.stringify(departmentContactCopy) + departmentIds.map(departmentEmail).join(',');
    expect(serialized).not.toContain('gmail.com');
  });

  it('has a label for every department in all six locales', () => {
    const locales: DepartmentLocale[] = ['en', 'es', 'tl', 'zh', 'de', 'ja'];
    for (const locale of locales) {
      const copy = departmentContactCopy[locale];
      expect(copy.title.length).toBeGreaterThan(0);
      for (const id of departmentIds) {
        expect(copy.labels[id].length).toBeGreaterThan(0);
      }
    }
  });
});
