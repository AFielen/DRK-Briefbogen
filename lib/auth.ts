import jwt from 'jsonwebtoken';
import { createHash, randomInt } from 'crypto';
import { cookies } from 'next/headers';
import type { SessionPayload } from './types';

const SECRET = process.env.JWT_SECRET!;
const COOKIE = 'drk_session';

export function generateCode(): string {
  return String(randomInt(100000, 999999));
}

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export const COOKIE_NAME = COOKIE;
