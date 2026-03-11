'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { TenantUnit, UnitConfig } from '@/lib/types';
import { defaultUnitConfig } from '@/lib/types';

interface Member {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'units' | 'members'>('units');
  const [units, setUnits] = useState<TenantUnit[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<TenantUnit | null>(null);
  const [editConfig, setEditConfig] = useState<UnitConfig>(defaultUnitConfig());
  const [editName, setEditName] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tenantName, setTenantName] = useState('');

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData.user) { router.push('/'); return; }
      const isAdminForSlug = meData.tenants?.some((t: { slug: string; role: string }) => t.slug === slug && t.role === 'admin');
      if (!isAdminForSlug) { router.push(`/${slug}`); return; }

      const [tenantRes, membersRes] = await Promise.all([
        fetch(`/api/tenants/${slug}`),
        fetch(`/api/tenants/${slug}/members`),
      ]);
      const tenantData = await tenantRes.json();
      const membersData = await membersRes.json();

      setTenantName(tenantData.tenant?.name || slug);
      setUnits(tenantData.units || []);
      setMembers(Array.isArray(membersData) ? membersData : []);
      setLoading(false);
    }
    init().catch(() => router.push('/'));
  }, [slug, router]);

  function handleSelectUnit(unit: TenantUnit) {
    setSelectedUnit(unit);
    setEditName(unit.name);
    setEditConfig(unit.config);
    setIsNew(false);
    setError('');
  }

  function handleNewUnit() {
    setSelectedUnit(null);
    setEditName('');
    setEditConfig(defaultUnitConfig());
    setIsNew(true);
    setError('');
  }

  async function handleSaveUnit() {
    if (!editName.trim()) { setError('Name ist erforderlich'); return; }
    setSaving(true);
    setError('');
    try {
      if (isNew) {
        const res = await fetch(`/api/tenants/${slug}/units`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName, config: editConfig }),
        });
        if (!res.ok) { setError('Fehler beim Erstellen'); return; }
        const newUnit = await res.json();
        setUnits(prev => [...prev, newUnit]);
        setSelectedUnit(newUnit);
        setIsNew(false);
      } else if (selectedUnit) {
        const res = await fetch(`/api/tenants/${slug}/units/${selectedUnit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName, config: editConfig }),
        });
        if (!res.ok) { setError('Fehler beim Speichern'); return; }
        const updated = await res.json();
        setUnits(prev => prev.map(u => u.id === updated.id ? updated : u));
        setSelectedUnit(updated);
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUnit() {
    if (!selectedUnit) return;
    if (!confirm(`"${selectedUnit.name}" wirklich löschen?`)) return;
    try {
      await fetch(`/api/tenants/${slug}/units/${selectedUnit.id}`, { method: 'DELETE' });
      setUnits(prev => prev.filter(u => u.id !== selectedUnit.id));
      setSelectedUnit(null);
      setIsNew(false);
      setEditConfig(defaultUnitConfig());
      setEditName('');
    } catch {
      setError('Fehler beim Löschen');
    }
  }

  async function handleChangeRole(userId: string, newRole: string) {
    try {
      await fetch(`/api/tenants/${slug}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
    } catch {
      setError('Fehler');
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Mitglied wirklich entfernen?')) return;
    try {
      await fetch(`/api/tenants/${slug}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } catch {
      setError('Fehler');
    }
  }

  function updateConfig(field: keyof UnitConfig, value: string) {
    setEditConfig(prev => ({ ...prev, [field]: value }));
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

  const configFields: Array<{ key: keyof UnitConfig; label: string; section: string }> = [
    { key: 'nameZeile1', label: 'Name Zeile 1', section: 'Organisation' },
    { key: 'nameZeile2', label: 'Name Zeile 2', section: 'Organisation' },
    { key: 'zusatz', label: 'Zusatz / Abteilung', section: 'Organisation' },
    { key: 'strasse', label: 'Straße', section: 'Adresse' },
    { key: 'plzOrt', label: 'PLZ + Ort', section: 'Adresse' },
    { key: 'ort', label: 'Ort (für Datum-Zeile)', section: 'Adresse' },
    { key: 'tel', label: 'Telefon', section: 'Kontakt' },
    { key: 'fax', label: 'Fax', section: 'Kontakt' },
    { key: 'email', label: 'E-Mail', section: 'Kontakt' },
    { key: 'web', label: 'Website', section: 'Kontakt' },
    { key: 'praesidentLabel', label: 'Präsident/in Label', section: 'Vorstand' },
    { key: 'praesidentName', label: 'Präsident/in Name', section: 'Vorstand' },
    { key: 'vorsitzenderLabel', label: 'Vorsitzende/r Label', section: 'Vorstand' },
    { key: 'vorsitzenderName', label: 'Vorsitzende/r Name', section: 'Vorstand' },
    { key: 'amtsgericht', label: 'Amtsgericht', section: 'Recht & Bank' },
    { key: 'vrNummer', label: 'VR-Nummer', section: 'Recht & Bank' },
    { key: 'ustId', label: 'USt-IdNr.', section: 'Recht & Bank' },
    { key: 'bankName', label: 'Bank', section: 'Recht & Bank' },
    { key: 'bankIban', label: 'IBAN', section: 'Recht & Bank' },
    { key: 'bankBic', label: 'BIC', section: 'Recht & Bank' },
  ];

  const sections = [...new Set(configFields.map(f => f.section))];

  return (
    <div className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href={`/${slug}`} className="text-sm underline mb-1 inline-block" style={{ color: 'var(--text-muted)' }}>
              &larr; Zurück zum Briefbogen
            </Link>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Admin: {tenantName}
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <button
            className="px-4 py-2 text-sm font-semibold -mb-px"
            style={{
              borderBottom: activeTab === 'units' ? '2px solid var(--drk)' : '2px solid transparent',
              color: activeTab === 'units' ? 'var(--drk)' : 'var(--text-light)',
            }}
            onClick={() => setActiveTab('units')}
          >
            Gesellschaften ({units.length})
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold -mb-px"
            style={{
              borderBottom: activeTab === 'members' ? '2px solid var(--drk)' : '2px solid transparent',
              color: activeTab === 'members' ? 'var(--drk)' : 'var(--text-light)',
            }}
            onClick={() => setActiveTab('members')}
          >
            Mitglieder ({members.length})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {/* Units Tab */}
        {activeTab === 'units' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Liste */}
            <div className="space-y-2">
              <button onClick={handleNewUnit} className="drk-btn-primary w-full text-sm mb-4">
                + Neue Gesellschaft
              </button>
              {units.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUnit(u)}
                  className="w-full text-left p-3 rounded-lg border transition-colors"
                  style={{
                    borderColor: selectedUnit?.id === u.id ? 'var(--drk)' : 'var(--border)',
                    background: selectedUnit?.id === u.id ? 'var(--drk-bg)' : 'var(--bg-card)',
                  }}
                >
                  <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{u.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {u.config.nameZeile1} {u.config.nameZeile2}
                  </div>
                </button>
              ))}
              {units.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Noch keine Gesellschaften
                </p>
              )}
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
              {(selectedUnit || isNew) ? (
                <div className="drk-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      {isNew ? 'Neue Gesellschaft' : 'Bearbeiten'}
                    </h3>
                    {!isNew && (
                      <button onClick={handleDeleteUnit} className="text-sm px-3 py-1 rounded hover:bg-red-50" style={{ color: 'var(--drk)' }}>
                        Löschen
                      </button>
                    )}
                  </div>

                  <div className="mb-6">
                    <label className="drk-label">Kurzname *</label>
                    <input className="drk-input w-full" value={editName} onChange={e => setEditName(e.target.value)} placeholder="z.B. DRK Rettungsdienst GmbH" />
                  </div>

                  {sections.map(section => (
                    <div key={section} className="mb-6">
                      <h4 className="text-sm font-bold mb-3 pb-1 border-b" style={{ color: 'var(--text)', borderColor: 'var(--border)' }}>
                        {section}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {configFields.filter(f => f.section === section).map(f => (
                          <div key={f.key}>
                            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-light)' }}>{f.label}</label>
                            <input
                              className="drk-input w-full text-sm"
                              value={editConfig[f.key]}
                              onChange={e => updateConfig(f.key, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    <button className="drk-btn-secondary" onClick={() => { setSelectedUnit(null); setIsNew(false); }}>
                      Abbrechen
                    </button>
                    <button className="drk-btn-primary" onClick={handleSaveUnit} disabled={saving}>
                      {saving ? 'Speichern...' : isNew ? 'Erstellen' : 'Speichern'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="drk-card text-center py-12">
                  <p style={{ color: 'var(--text-muted)' }}>
                    Wählen Sie eine Gesellschaft aus oder erstellen Sie eine neue.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            {/* Einladungs-Banner */}
            <div className="drk-card" style={{ background: 'var(--drk-bg)' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>
                Mitarbeiter einladen
              </p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>
                Teilen Sie diese URL mit Ihren Mitarbeitern. Sie melden sich an und treten der Organisation bei:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded text-sm bg-white border" style={{ borderColor: 'var(--border)' }}>
                  {typeof window !== 'undefined' ? window.location.origin : ''}/{slug}
                </code>
                <button
                  className="drk-btn-secondary text-sm"
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${slug}`)}
                >
                  Kopieren
                </button>
              </div>
            </div>

            {/* Mitglieder-Tabelle */}
            <div className="drk-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--text)' }}>E-Mail</th>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--text)' }}>Rolle</th>
                    <th className="text-left py-2 font-semibold" style={{ color: 'var(--text)' }}>Beigetreten</th>
                    <th className="text-right py-2 font-semibold" style={{ color: 'var(--text)' }}>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.user_id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="py-3" style={{ color: 'var(--text)' }}>{m.email}</td>
                      <td className="py-3">
                        <select
                          className="text-sm border rounded px-2 py-1"
                          style={{ borderColor: 'var(--border)' }}
                          value={m.role}
                          onChange={e => handleChangeRole(m.user_id, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Mitglied</option>
                        </select>
                      </td>
                      <td className="py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(m.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          className="text-xs px-2 py-1 rounded hover:bg-red-50"
                          style={{ color: 'var(--drk)' }}
                          onClick={() => handleRemoveMember(m.user_id)}
                        >
                          Entfernen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
