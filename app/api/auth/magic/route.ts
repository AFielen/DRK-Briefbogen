import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/?error=invalid', req.url));

  const result = await pool.query(
    `SELECT id, email FROM auth_tokens
     WHERE token = $1
       AND expires_at > now()
       AND used_at IS NULL`,
    [token]
  );

  if (result.rowCount === 0) {
    return NextResponse.redirect(new URL('/?error=expired', req.url));
  }

  const { id, email } = result.rows[0];
  await pool.query(`UPDATE auth_tokens SET used_at = now() WHERE id = $1`, [id]);

  const userResult = await pool.query(
    `INSERT INTO users (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
     RETURNING id`,
    [email]
  );
  const userId = userResult.rows[0].id;

  const jwt = signToken({ userId, email });
  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set(COOKIE_NAME, jwt, {
    httpOnly: true, sameSite: 'lax', path: '/',
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
