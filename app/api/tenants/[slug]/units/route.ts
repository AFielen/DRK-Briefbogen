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
  return result;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  if (tenant.rowCount === 0) {
    return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
  }

  const units = await pool.query(
    `SELECT id, name, config, sort_order FROM tenant_units
     WHERE tenant_id = $1 ORDER BY sort_order, name`,
    [tenant.rows[0].id]
  );

  return NextResponse.json(units.rows);
}

export async function POST(
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

  const { name, config } = await req.json();
  const tenant = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  const result = await pool.query(
    `INSERT INTO tenant_units (tenant_id, name, config) VALUES ($1, $2, $3) RETURNING *`,
    [tenant.rows[0].id, name, JSON.stringify(config)]
  );
  return NextResponse.json(result.rows[0]);
}
