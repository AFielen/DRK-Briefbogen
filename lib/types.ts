// ── Gemeinsame Typen für DRK-Apps ──

/** Unterstützte Sprachen */
export type Locale = 'de' | 'en';

/** API Health Response */
export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}

/** Standard API Error */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// ── Briefbogen-spezifische Typen ──

/** Gespeichert als JSONB in tenant_units.config */
export interface UnitConfig {
  nameZeile1: string;
  nameZeile2: string;
  zusatz: string;
  strasse: string;
  plzOrt: string;
  ort: string;
  tel: string;
  fax: string;
  email: string;
  web: string;
  praesidentLabel: string;
  praesidentName: string;
  vorsitzenderLabel: string;
  vorsitzenderName: string;
  amtsgericht: string;
  vrNummer: string;
  ustId: string;
  bankName: string;
  bankIban: string;
  bankBic: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

export interface TenantUnit {
  id: string;
  tenant_id: string;
  name: string;
  config: UnitConfig;
  sort_order: number;
}

export interface User {
  id: string;
  email: string;
}

export interface TenantMember {
  user_id: string;
  tenant_id: string;
  role: 'admin' | 'member';
  email?: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
}

/** Für den localStorage (MA-Daten) */
export interface MAData {
  name: string;
  funktion: string;
  abteilung: string;
  telDirekt: string;
  faxDirekt: string;
  emailDirekt: string;
}

/** Brief-Entwurf (localStorage) */
export interface BriefData {
  empfaengerFirma: string;
  empfaengerName: string;
  empfaengerStrasse: string;
  empfaengerPlzOrt: string;
  datum: string;
  betreff: string;
  anrede: string;
  ihreNachrichtVom: string;
  ihrZeichen: string;
  text: string;
  grussformel: string;
}

export const defaultUnitConfig = (): UnitConfig => ({
  nameZeile1: '', nameZeile2: '', zusatz: '',
  strasse: '', plzOrt: '', ort: '',
  tel: '', fax: '', email: '', web: '',
  praesidentLabel: 'Präsident/in', praesidentName: '',
  vorsitzenderLabel: 'Vorsitzende/r des Vorstands', vorsitzenderName: '',
  amtsgericht: '', vrNummer: '', ustId: '',
  bankName: '', bankIban: '', bankBic: '',
});

export const defaultMAData = (): MAData => ({
  name: '', funktion: '', abteilung: '',
  telDirekt: '', faxDirekt: '', emailDirekt: '',
});

export const defaultBriefData = (): BriefData => ({
  empfaengerFirma: '', empfaengerName: '',
  empfaengerStrasse: '', empfaengerPlzOrt: '',
  datum: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  betreff: '', anrede: 'Sehr geehrte Damen und Herren,',
  ihreNachrichtVom: '', ihrZeichen: '',
  text: '', grussformel: 'Mit freundlichen Grüßen',
});
