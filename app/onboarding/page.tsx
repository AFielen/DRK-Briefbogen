'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Create tab
  const [orgName, setOrgName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

  // Join tab
  const [joinSlug, setJoinSlug] = useState('');
  const [joinOrgName, setJoinOrgName] = useState('');
  const [joinFound, setJoinFound] = useState(false);

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50);
  }

  useEffect(() => {
    if (!slugManual && orgName) {
      setSlug(generateSlug(orgName));
    }
  }, [orgName, slugManual]);

  const checkSlug = useCallback(async (s: string) => {
    if (s.length < 3) { setSlugAvailable(null); return; }
    setSlugChecking(true);
    try {
      const res = await fetch(`/api/tenants/${s}`);
      setSlugAvailable(res.status === 404);
    } catch {
      setSlugAvailable(null);
    } finally {
      setSlugChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!slug || slug.length < 3) { setSlugAvailable(null); return; }
    const timer = setTimeout(() => checkSlug(slug), 500);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, slug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/${data.slug}`);
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearchOrg() {
    if (!joinSlug) return;
    setError('');
    try {
      const res = await fetch(`/api/tenants/${joinSlug.toLowerCase()}`);
      if (res.ok) {
        const data = await res.json();
        setJoinOrgName(data.tenant.name);
        setJoinFound(true);
      } else {
        setError('Organisation nicht gefunden');
        setJoinFound(false);
      }
    } catch {
      setError('Netzwerkfehler');
    }
  }

  async function handleJoin() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/tenants/${joinSlug.toLowerCase()}/join`, {
        method: 'POST',
      });
      if (res.ok) {
        router.push(`/${joinSlug.toLowerCase()}`);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      setError('Netzwerkfehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center" style={{ color: 'var(--text)' }}>
          Willkommen beim DRK Briefbogen-Generator
        </h2>

        {/* Tab-Auswahl */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <button
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={{
              background: tab === 'create' ? 'var(--drk)' : 'var(--bg-card)',
              color: tab === 'create' ? '#fff' : 'var(--text-light)',
            }}
            onClick={() => { setTab('create'); setError(''); }}
          >
            Neue Organisation
          </button>
          <button
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={{
              background: tab === 'join' ? 'var(--drk)' : 'var(--bg-card)',
              color: tab === 'join' ? '#fff' : 'var(--text-light)',
            }}
            onClick={() => { setTab('join'); setError(''); }}
          >
            Beitreten
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm"
               style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {tab === 'create' && (
          <form onSubmit={handleCreate} className="drk-card space-y-4">
            <div>
              <label className="drk-label">Organisationsname *</label>
              <input
                className="drk-input w-full"
                placeholder="z.B. DRK Kreisverband Aachen"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="drk-label">Slug (URL-Pfad)</label>
              <input
                className="drk-input w-full"
                placeholder="z.B. drk-aachen"
                value={slug}
                onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setSlugManual(true); }}
                minLength={3}
                maxLength={50}
                pattern="[a-z0-9-]+"
                required
              />
              <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                {slug && (
                  <span>
                    briefbogen.drk-aachen.de/<strong style={{ color: 'var(--text)' }}>{slug}</strong>
                  </span>
                )}
                {slugChecking && <span className="ml-2">Prüfe...</span>}
                {slugAvailable === true && (
                  <span className="ml-2" style={{ color: 'var(--success)' }}>Verfügbar</span>
                )}
                {slugAvailable === false && (
                  <span className="ml-2" style={{ color: 'var(--drk)' }}>Bereits vergeben</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="drk-btn-primary w-full"
              disabled={loading || slugAvailable === false || slug.length < 3}
            >
              {loading ? 'Wird erstellt...' : 'Organisation anlegen'}
            </button>
          </form>
        )}

        {tab === 'join' && (
          <div className="drk-card space-y-4">
            <div>
              <label className="drk-label">Slug der Organisation</label>
              <div className="flex gap-2">
                <input
                  className="drk-input flex-1"
                  placeholder="z.B. drk-aachen"
                  value={joinSlug}
                  onChange={e => { setJoinSlug(e.target.value); setJoinFound(false); }}
                />
                <button
                  type="button"
                  className="drk-btn-secondary"
                  onClick={handleSearchOrg}
                  disabled={!joinSlug}
                >
                  Suchen
                </button>
              </div>
            </div>
            {joinFound && (
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>{joinOrgName}</p>
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>/{joinSlug}</p>
                <button
                  className="drk-btn-primary w-full"
                  onClick={handleJoin}
                  disabled={loading}
                >
                  {loading ? 'Beitritt...' : 'Beitreten'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
