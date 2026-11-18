import { isAdmin, unauthorized } from '@/server/auth';
import { db } from '@/server/db';

const parseId = (id: string) => (/^\d+$/.test(id) ? Number(id) : null);
const notFound = () => Response.json({ error: 'Not found' }, { status: 404 });

/** Marks a message as read or new. Body: { status: 'new' | 'read' } */
export async function PATCH(request: Request, { id }: Record<string, string>) {
  if (!(await isAdmin(request))) return unauthorized();
  const messageId = parseId(id);
  if (messageId === null) return notFound();

  const body = await request.json().catch(() => ({}));
  if (body.status !== 'new' && body.status !== 'read') {
    return Response.json({ error: "status must be 'new' or 'read'" }, { status: 400 });
  }
  const sql = await db();
  const rows = await sql`UPDATE contact_messages SET status = ${body.status} WHERE id = ${messageId} RETURNING id`;
  return rows.length ? Response.json({ ok: true }) : notFound();
}

export async function DELETE(request: Request, { id }: Record<string, string>) {
  if (!(await isAdmin(request))) return unauthorized();
  const messageId = parseId(id);
  if (messageId === null) return notFound();

  const sql = await db();
  const rows = await sql`DELETE FROM contact_messages WHERE id = ${messageId} RETURNING id`;
  return rows.length ? Response.json({ ok: true }) : notFound();
}
