import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import pool from '@/lib/db';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Nicht angemeldet' }, { status: 401 });

  const { name, slug: customSlug, parentSlug } = await req.json();
  if (!name) return NextResponse.json({ error: 'Name fehlt' }, { status: 400 });

  const slug = customSlug ? customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '') : generateSlug(name);

  const existing = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [slug]);
  if (existing.rowCount! > 0) {
    return NextResponse.json({ error: 'Dieser Slug ist bereits vergeben' }, { status: 409 });
  }

  let parentId: string | null = null;
  if (parentSlug) {
    const parent = await pool.query(`SELECT id FROM tenants WHERE slug = $1`, [parentSlug]);
    if (parent.rowCount! > 0) parentId = parent.rows[0].id;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tenantResult = await client.query(
      `INSERT INTO tenants (slug, name, parent_id) VALUES ($1, $2, $3) RETURNING id`,
      [slug, name, parentId]
    );
    const tenantId = tenantResult.rows[0].id;

    await client.query(
      `INSERT INTO tenant_members (user_id, tenant_id, role) VALUES ($1, $2, 'admin')`,
      [session.userId, tenantId]
    );

    await client.query('COMMIT');
    return NextResponse.json({ ok: true, slug, id: tenantId });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
