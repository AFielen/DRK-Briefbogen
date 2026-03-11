import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateCode, hashCode } from '@/lib/auth';
import { sendMagicCode } from '@/lib/email';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const code = generateCode();
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const magicLink = `${baseUrl}/auth/magic?token=${token}`;

  await pool.query(
    `INSERT INTO auth_tokens (email, code, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [normalizedEmail, hashCode(code), token, expiresAt]
  );

  await sendMagicCode(normalizedEmail, code, magicLink);

  return NextResponse.json({ ok: true });
}
