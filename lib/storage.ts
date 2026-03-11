import type { MAData, BriefData } from './types';
import { defaultMAData, defaultBriefData } from './types';

const MA_KEY = 'drk-brief:ma-data';
const DRAFT_KEY = (slug: string, unitId: string) => `drk-brief:draft:${slug}:${unitId}`;

export function getMAData(): MAData {
  if (typeof window === 'undefined') return defaultMAData();
  try {
    const raw = localStorage.getItem(MA_KEY);
    if (!raw) return defaultMAData();
    return JSON.parse(raw) as MAData;
  } catch {
    return defaultMAData();
  }
}

export function saveMAData(data: MAData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MA_KEY, JSON.stringify(data));
}

export function getBriefDraft(slug: string, unitId: string): BriefData {
  if (typeof window === 'undefined') return defaultBriefData();
  try {
    const raw = localStorage.getItem(DRAFT_KEY(slug, unitId));
    if (!raw) return defaultBriefData();
    return JSON.parse(raw) as BriefData;
  } catch {
    return defaultBriefData();
  }
}

export function saveBriefDraft(slug: string, unitId: string, data: BriefData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DRAFT_KEY(slug, unitId), JSON.stringify(data));
}

export function clearBriefDraft(slug: string, unitId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFT_KEY(slug, unitId));
}
