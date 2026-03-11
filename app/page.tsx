'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'expired') setError('Der Link ist abgelaufen. Bitte fordern Sie einen neuen Code an.');
    if (err === 'invalid') setError('Ungültiger Link. Bitte fordern Sie einen neuen Code an.');
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Fehler beim Senden');
        return;
      }
      setState('sent');
      setCooldown(60);
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }

  const handleVerify = useCallback(async (fullCode: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ungültiger Code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  function handleCodeInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const full = newCode.join('');
    if (full.length === 6) {
      handleVerify(full);
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      handleVerify(pasted);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setCooldown(60);
    } catch {
      setError('Netzwerkfehler.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="drk-card text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: 'var(--drk-bg)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--drk)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            DRK Briefbogen-Generator
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-light)' }}>
            Erstellen Sie professionelle Briefbögen für Ihren DRK-Kreisverband
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-left"
                 style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {state === 'email' && (
            <form onSubmit={handleSendCode}>
              <p className="text-sm mb-4 text-left" style={{ color: 'var(--text-light)' }}>
                Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Anmeldecode.
              </p>
              <input
                type="email"
                className="drk-input w-full mb-4"
                placeholder="ihre.email@drk-beispiel.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" className="drk-btn-primary w-full" disabled={loading}>
                {loading ? 'Wird gesendet...' : 'Code senden'}
              </button>
            </form>
          )}

          {state === 'sent' && (
            <div>
              <p className="text-sm mb-2 text-left" style={{ color: 'var(--text-light)' }}>
                Wir haben einen 6-stelligen Code an <strong style={{ color: 'var(--text)' }}>{email}</strong> gesendet.
              </p>
              <p className="text-xs mb-6 text-left" style={{ color: 'var(--text-muted)' }}>
                Alternativ klicken Sie auf den Link in der E-Mail.
              </p>

              <div className="flex gap-2 justify-center mb-6" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 focus:outline-none transition-colors"
                    style={{
                      borderColor: digit ? 'var(--drk)' : 'var(--border)',
                      color: 'var(--text)',
                    }}
                    value={digit}
                    onChange={e => handleCodeInput(i, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    onFocus={e => e.target.select()}
                    autoFocus={i === 0}
                    disabled={loading}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="underline"
                  style={{ color: 'var(--text-light)' }}
                  onClick={() => { setState('email'); setCode(['', '', '', '', '', '']); setError(''); }}
                >
                  Andere E-Mail?
                </button>
                <button
                  type="button"
                  className="underline disabled:opacity-50"
                  style={{ color: cooldown > 0 ? 'var(--text-muted)' : 'var(--drk)' }}
                  onClick={handleResend}
                  disabled={cooldown > 0 || loading}
                >
                  {cooldown > 0 ? `Erneut senden (${cooldown}s)` : 'Code erneut senden'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="drk-card text-center">
            <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
                 style={{ borderColor: 'var(--border)', borderTopColor: 'var(--drk)' }} />
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
