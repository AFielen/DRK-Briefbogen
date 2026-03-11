import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashCode, signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();
  const normalizedEmail = email.toLowerCase().trim();

  const result = await pool.query(
    `SELECT id FROM auth_tokens
     WHERE email = $1
       AND code = $2
       AND expires_at > now()
       AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedEmail, hashCode(code)]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Ungültiger oder abgelaufener Code' }, { status: 401 });
  }

  await pool.query(
    `UPDATE auth_tokens SET used_at = now() WHERE id = $1`,
    [result.rows[0].id]
  );

  const userResult = await pool.query(
    `INSERT INTO users (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    [normalizedEmail]
  );
  const userId = userResult.rows[0].id;

  const token = signToken({ userId, email: normalizedEmail });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
