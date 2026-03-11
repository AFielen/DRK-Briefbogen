'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MagicLinkContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      window.location.href = `/api/auth/magic?token=${token}`;
    }
  }, [token]);

  if (!token) {
    return (
      <div className="drk-card text-center">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
          Ungültiger Link
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-light)' }}>
          Dieser Link ist ungültig. Bitte fordern Sie einen neuen Code an.
        </p>
        <Link href="/" className="drk-btn-primary inline-block">
          Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <div className="drk-card text-center">
      <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
           style={{ borderColor: 'var(--border)', borderTopColor: 'var(--drk)' }} />
      <p className="text-sm" style={{ color: 'var(--text-light)' }}>
        Sie werden angemeldet...
      </p>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-md mx-auto">
        <Suspense fallback={
          <div className="drk-card text-center">
            <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
                 style={{ borderColor: 'var(--border)', borderTopColor: 'var(--drk)' }} />
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>Wird geladen...</p>
          </div>
        }>
          <MagicLinkContent />
        </Suspense>
      </div>
    </div>
  );
}
