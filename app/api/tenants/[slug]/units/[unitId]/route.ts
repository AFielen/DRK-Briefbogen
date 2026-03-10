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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; unitId: string }> }
) {
  const { slug, unitId } = await params;
  const session = await getSession();
  try {
    await requireAdmin(slug, session);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'ERROR';
    return NextResponse.json({ error: msg }, { status: msg === 'UNAUTHORIZED' ? 401 : 403 });
  }

  const { name, config, sort_order } = await req.json();
  const result = await pool.query(
    `UPDATE tenant_units SET name = $1, config = $2, sort_order = COALESCE($3, sort_order)
     WHERE id = $4 RETURNING *`,
    [name, JSON.stringify(config), sort_order, unitId]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; unitId: string }> }
) {
  const { slug, unitId } = await params;
  const session = await getSession();
  try {
    await requireAdmin(slug, session);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'ERROR';
    return NextResponse.json({ error: msg }, { status: msg === 'UNAUTHORIZED' ? 401 : 403 });
  }

  await pool.query(`DELETE FROM tenant_units WHERE id = $1`, [unitId]);
  return NextResponse.json({ ok: true });
}
