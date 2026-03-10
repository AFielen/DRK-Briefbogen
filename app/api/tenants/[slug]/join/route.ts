import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const tenant = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  if (tenant.rowCount === 0) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

  await pool.query(
    `INSERT INTO tenant_members (user_id, tenant_id, role)
     VALUES ($1, $2, 'member')
     ON CONFLICT (user_id, tenant_id) DO NOTHING`,
    [session.userId, tenant.rows[0].id]
  );
  return NextResponse.json({ ok: true });
}
