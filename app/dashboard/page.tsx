'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [tenants, setTenants] = useState<TenantInfo[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) { router.push('/'); return; }
        setEmail(data.user.email);
        if (!data.tenants || data.tenants.length === 0) {
          router.push('/onboarding');
          return;
        }
        if (data.tenants.length === 1) {
          router.push(`/${data.tenants[0].slug}`);
          return;
        }
        setTenants(data.tenants);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, [router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="drk-card text-center">
            <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
                 style={{ borderColor: 'var(--border)', borderTopColor: 'var(--drk)' }} />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>Wird geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Ihre Organisationen
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{email}</span>
            <button onClick={handleLogout} className="text-sm underline" style={{ color: 'var(--text-light)' }}>
              Abmelden
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tenants.map(t => (
            <Link key={t.id} href={`/${t.slug}`} className="block">
              <div className="drk-card hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                      {t.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      /{t.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.role === 'admin' && (
                      <span className="text-xs font-semibold px-2 py-1 rounded-full"
                            style={{ background: 'var(--drk-bg)', color: 'var(--drk)' }}>
                        Admin
                      </span>
                    )}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/onboarding" className="drk-btn-secondary inline-block text-center w-full">
          Neue Organisation anlegen oder beitreten
        </Link>
      </div>
    </div>
  );
}
