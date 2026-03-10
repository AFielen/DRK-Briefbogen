import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';
import type { SessionPayload } from '@/lib/types';

async function requireAdmin(slug: string, session: SessionPayload | null) {
  if (!session) throw new Error('UNAUTHORIZED');
  const result = await pool.query(
    `SELECT tm.role FROM tenant_members tm
     JOIN tenants t ON t.id = tm.tenant_id
     WHERE t.slug = $1 AND tm.user_id = $2`,
    [slug, session.userId]
  );
  if (result.rowCount === 0 || result.rows[0].role !== 'admin') throw new Error('FORBIDDEN');
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();
  try {
    await requireAdmin(slug, session);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'ERROR';
    return NextResponse.json({ error: msg }, { status: msg === 'UNAUTHORIZED' ? 401 : 403 });
  }

  const result = await pool.query(
    `SELECT u.email, tm.role, tm.user_id, tm.created_at
     FROM tenant_members tm
     JOIN users u ON u.id = tm.user_id
     JOIN tenants t ON t.id = tm.tenant_id
     WHERE t.slug = $1
     ORDER BY tm.created_at`,
    [slug]
  );

  return NextResponse.json(result.rows);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();
  try {
    await requireAdmin(slug, session);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'ERROR';
    return NextResponse.json({ error: msg }, { status: msg === 'UNAUTHORIZED' ? 401 : 403 });
  }

  const { userId, role } = await req.json();
  if (!['admin', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Ungültige Rolle' }, { status: 400 });
  }

  const tenant = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  await pool.query(
    `UPDATE tenant_members SET role = $1 WHERE user_id = $2 AND tenant_id = $3`,
    [role, userId, tenant.rows[0].id]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getSession();
  try {
    await requireAdmin(slug, session);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'ERROR';
    return NextResponse.json({ error: msg }, { status: msg === 'UNAUTHORIZED' ? 401 : 403 });
  }

  const { userId } = await req.json();
  const tenant = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  await pool.query(
    `DELETE FROM tenant_members WHERE user_id = $1 AND tenant_id = $2`,
    [userId, tenant.rows[0].id]
  );

  return NextResponse.json({ ok: true });
}
