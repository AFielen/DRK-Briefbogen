import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await pool.query(
    `SELECT id, slug, name FROM tenants WHERE slug = $1`,
    [slug]
  );
  if (tenant.rowCount === 0) {
    return NextResponse.json({ error: 'Organisation nicht gefunden' }, { status: 404 });
  }

  const units = await pool.query(
    `SELECT id, name, config, sort_order FROM tenant_units
     WHERE tenant_id = $1 ORDER BY sort_order, name`,
    [tenant.rows[0].id]
  );

  return NextResponse.json({
    tenant: tenant.rows[0],
    units: units.rows,
  });
}
