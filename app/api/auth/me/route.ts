import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const result = await pool.query(
    `SELECT t.id, t.slug, t.name, tm.role
     FROM tenants t
     JOIN tenant_members tm ON tm.tenant_id = t.id
     WHERE tm.user_id = $1
     ORDER BY t.name`,
    [session.userId]
  );

  return NextResponse.json({
    user: { id: session.userId, email: session.email },
    tenants: result.rows,
  });
}
