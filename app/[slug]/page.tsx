'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TenantUnit, UnitConfig, MAData, BriefData } from '@/lib/types';
import { defaultMAData, defaultBriefData } from '@/lib/types';
import { getMAData, saveMAData, getBriefDraft, saveBriefDraft, clearBriefDraft } from '@/lib/storage';
import { generateDocx } from '@/lib/docx-export';

interface TenantData {
  tenant: { id: string; slug: string; name: string };
  units: TenantUnit[];
}

interface UserData {
  user: { id: string; email: string } | null;
  tenants: Array<{ slug: string; role: string }>;
}

export default function WizardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tenantData, setTenantData] = useState<TenantData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TenantUnit | null>(null);
  const [maData, setMaData] = useState<MAData>(defaultMAData());
  const [briefData, setBriefData] = useState<BriefData>(defaultBriefData());
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isAdmin = userData?.tenants?.some(t => t.slug === slug && t.role === 'admin') ?? false;

  useEffect(() => {
    Promise.all([
      fetch(`/api/tenants/${slug}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([td, ud]) => {
      if (td.error) { router.push('/'); return; }
      setTenantData(td);
      setUserData(ud);
      setMaData(getMAData());
      if (td.units.length > 0) {
        setSelectedUnit(td.units[0]);
        setBriefData(getBriefDraft(slug, td.units[0].id));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug, router]);

  const handleMaChange = useCallback((field: keyof MAData, value: string) => {
    setMaData(prev => {
      const next = { ...prev, [field]: value };
      saveMAData(next);
      return next;
    });
  }, []);

  const handleBriefChange = useCallback((field: keyof BriefData, value: string) => {
    setBriefData(prev => {
      const next = { ...prev, [field]: value };
      if (selectedUnit) saveBriefDraft(slug, selectedUnit.id, next);
      return next;
    });
  }, [slug, selectedUnit]);

  function handleUnitChange(unitId: string) {
    const unit = tenantData?.units.find(u => u.id === unitId);
    if (unit) {
      setSelectedUnit(unit);
      setBriefData(getBriefDraft(slug, unit.id));
    }
  }

  async function handleDownload() {
    if (!selectedUnit) return;
    await generateDocx(selectedUnit.config, maData, briefData);
  }

  function handleNewLetter() {
    if (selectedUnit) clearBriefDraft(slug, selectedUnit.id);
    setBriefData(defaultBriefData());
    setStep(1);
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto drk-card text-center">
          <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
               style={{ borderColor: 'var(--border)', borderTopColor: 'var(--drk)' }} />
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>Wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!tenantData) return null;

  const unit = selectedUnit?.config as UnitConfig | undefined;

  return (
    <div className="py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {tenantData.tenant.name}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Briefbogen-Generator</p>
          </div>
          <div className="relative">
            {userData?.user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="text-sm hidden sm:inline" style={{ color: 'var(--text-light)' }}>{userData.user.email}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-50" style={{ borderColor: 'var(--border)' }}>
                    <div className="px-3 py-2 text-xs truncate sm:hidden" style={{ color: 'var(--text-muted)' }}>
                      {userData.user.email}
                    </div>
                    {isAdmin && (
                      <Link href={`/${slug}/admin`} className="block px-3 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--text)' }}>
                        Admin-Bereich
                      </Link>
                    )}
                    <Link href="/dashboard" className="block px-3 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--text)' }}>
                      Organisationen
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" style={{ color: 'var(--drk)' }}>
                      Abmelden
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link href="/" className="text-sm underline" style={{ color: 'var(--drk)' }}>
                Anmelden
              </Link>
            )}
          </div>
        </div>

        {/* Admin-Banner wenn keine Units */}
        {tenantData.units.length === 0 && isAdmin && (
          <div className="drk-card mb-6 border-l-4" style={{ borderLeftColor: 'var(--warning)' }}>
            <p className="text-sm" style={{ color: 'var(--text)' }}>
              Noch keine Gesellschaft angelegt.{' '}
              <Link href={`/${slug}/admin`} className="font-semibold underline" style={{ color: 'var(--drk)' }}>
                Zum Admin-Bereich &rarr;
              </Link>
            </p>
          </div>
        )}

        {tenantData.units.length === 0 && !isAdmin && (
          <div className="drk-card text-center">
            <p style={{ color: 'var(--text-light)' }}>
              Es sind noch keine Gesellschaften konfiguriert. Bitte wenden Sie sich an einen Administrator.
            </p>
          </div>
        )}

        {tenantData.units.length > 0 && (
          <>
            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {['Setup', 'Empfänger', 'Brief', 'Vorschau'].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setStep(i + 1)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{
                      background: step === i + 1 ? 'var(--drk)' : step > i + 1 ? 'var(--success)' : 'var(--bg)',
                      color: step >= i + 1 ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    <span>{i + 1}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                  {i < 3 && <div className="w-8 h-0.5" style={{ background: step > i + 1 ? 'var(--success)' : 'var(--border)' }} />}
                </div>
              ))}
            </div>

            {/* Step 1: Setup */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="drk-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Gesellschaft wählen</h3>
                  <select
                    className="drk-input w-full"
                    value={selectedUnit?.id || ''}
                    onChange={e => handleUnitChange(e.target.value)}
                  >
                    {tenantData.units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="drk-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Ihre Daten</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Diese Daten werden nur lokal auf Ihrem Gerät gespeichert.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="drk-label">Name</label>
                      <input className="drk-input w-full" value={maData.name} onChange={e => handleMaChange('name', e.target.value)} placeholder="Max Mustermann" />
                    </div>
                    <div>
                      <label className="drk-label">Funktion</label>
                      <input className="drk-input w-full" value={maData.funktion} onChange={e => handleMaChange('funktion', e.target.value)} placeholder="Sachbearbeiter/in" />
                    </div>
                    <div>
                      <label className="drk-label">Abteilung</label>
                      <input className="drk-input w-full" value={maData.abteilung} onChange={e => handleMaChange('abteilung', e.target.value)} placeholder="Verwaltung" />
                    </div>
                    <div>
                      <label className="drk-label">Telefon (Durchwahl)</label>
                      <input className="drk-input w-full" value={maData.telDirekt} onChange={e => handleMaChange('telDirekt', e.target.value)} placeholder="02405 555-0" />
                    </div>
                    <div>
                      <label className="drk-label">Fax (Durchwahl)</label>
                      <input className="drk-input w-full" value={maData.faxDirekt} onChange={e => handleMaChange('faxDirekt', e.target.value)} placeholder="02405 555-11" />
                    </div>
                    <div>
                      <label className="drk-label">E-Mail (direkt)</label>
                      <input className="drk-input w-full" type="email" value={maData.emailDirekt} onChange={e => handleMaChange('emailDirekt', e.target.value)} placeholder="m.mustermann@drk-aachen.de" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="drk-btn-primary" onClick={() => setStep(2)}>Weiter</button>
                </div>
              </div>
            )}

            {/* Step 2: Empfänger */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="drk-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Empfänger</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="drk-label">Firma/Organisation</label>
                      <input className="drk-input w-full" value={briefData.empfaengerFirma} onChange={e => handleBriefChange('empfaengerFirma', e.target.value)} />
                    </div>
                    <div>
                      <label className="drk-label">Name</label>
                      <input className="drk-input w-full" value={briefData.empfaengerName} onChange={e => handleBriefChange('empfaengerName', e.target.value)} />
                    </div>
                    <div>
                      <label className="drk-label">Straße + Hausnr.</label>
                      <input className="drk-input w-full" value={briefData.empfaengerStrasse} onChange={e => handleBriefChange('empfaengerStrasse', e.target.value)} />
                    </div>
                    <div>
                      <label className="drk-label">PLZ + Ort</label>
                      <input className="drk-input w-full" value={briefData.empfaengerPlzOrt} onChange={e => handleBriefChange('empfaengerPlzOrt', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="drk-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Referenzen</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="drk-label">Ihre Nachricht vom</label>
                      <input className="drk-input w-full" value={briefData.ihreNachrichtVom} onChange={e => handleBriefChange('ihreNachrichtVom', e.target.value)} />
                    </div>
                    <div>
                      <label className="drk-label">Ihr Zeichen</label>
                      <input className="drk-input w-full" value={briefData.ihrZeichen} onChange={e => handleBriefChange('ihrZeichen', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="drk-btn-secondary" onClick={() => setStep(1)}>Zurück</button>
                  <button className="drk-btn-primary" onClick={() => setStep(3)}>Weiter</button>
                </div>
              </div>
            )}

            {/* Step 3: Briefinhalt */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="drk-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Brief verfassen</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="drk-label">Datum</label>
                        <input className="drk-input w-full" value={briefData.datum} onChange={e => handleBriefChange('datum', e.target.value)} />
                      </div>
                      <div>
                        <label className="drk-label">Anrede</label>
                        <input className="drk-input w-full" value={briefData.anrede} onChange={e => handleBriefChange('anrede', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="drk-label">Betreff</label>
                      <input className="drk-input w-full" value={briefData.betreff} onChange={e => handleBriefChange('betreff', e.target.value)} placeholder="Betreff des Briefes" />
                    </div>
                    <div>
                      <label className="drk-label">Text</label>
                      <textarea
                        className="drk-input w-full"
                        rows={10}
                        value={briefData.text}
                        onChange={e => handleBriefChange('text', e.target.value)}
                        placeholder="Ihr Brieftext..."
                      />
                    </div>
                    <div>
                      <label className="drk-label">Grußformel</label>
                      <input className="drk-input w-full" value={briefData.grussformel} onChange={e => handleBriefChange('grussformel', e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="drk-btn-secondary" onClick={() => setStep(2)}>Zurück</button>
                  <button className="drk-btn-primary" onClick={() => setStep(4)}>Vorschau</button>
                </div>
              </div>
            )}

            {/* Step 4: Vorschau */}
            {step === 4 && unit && (
              <div className="space-y-6">
                <div className="drk-card">
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Vorschau</h3>

                  {/* Brief-Vorschau als Box */}
                  <div className="border rounded-lg p-8 bg-white text-sm" style={{ borderColor: 'var(--border)', fontFamily: 'serif', lineHeight: '1.6' }}>
                    {/* Absender-Zeile */}
                    <div className="text-xs mb-6" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                      {unit.nameZeile1} {unit.nameZeile2} · {unit.strasse} · {unit.plzOrt}
                    </div>

                    {/* Empfänger */}
                    <div className="mb-8">
                      {briefData.empfaengerFirma && <div>{briefData.empfaengerFirma}</div>}
                      {briefData.empfaengerName && <div>{briefData.empfaengerName}</div>}
                      {briefData.empfaengerStrasse && <div>{briefData.empfaengerStrasse}</div>}
                      {briefData.empfaengerPlzOrt && <div>{briefData.empfaengerPlzOrt}</div>}
                    </div>

                    {/* Ort, Datum */}
                    <div className="text-right mb-6">
                      {unit.ort}, den {briefData.datum}
                    </div>

                    {/* Betreff */}
                    {briefData.betreff && (
                      <div className="font-bold mb-4">{briefData.betreff}</div>
                    )}

                    {/* Anrede */}
                    <div className="mb-4">{briefData.anrede}</div>

                    {/* Text */}
                    <div className="mb-6 whitespace-pre-wrap">{briefData.text}</div>

                    {/* Grußformel */}
                    <div className="mb-8">{briefData.grussformel}</div>

                    {/* Unterschrift */}
                    <div>
                      <div className="font-semibold">{maData.name}</div>
                      {maData.funktion && <div>{maData.funktion}</div>}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button className="drk-btn-secondary" onClick={() => setStep(3)}>Zurück</button>
                  <div className="flex gap-3">
                    <button className="drk-btn-secondary" onClick={handleNewLetter}>Neuer Brief</button>
                    <button className="drk-btn-primary flex items-center gap-2" onClick={handleDownload}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      .docx herunterladen
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
