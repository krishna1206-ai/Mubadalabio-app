import { db } from '@/server/db';

const MAX = { name: 120, email: 200, mobile: 40, department: 80, message: 5000 };

/** Saves a contact form submission. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const field = (k: keyof typeof MAX) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '');
  const form = {
    name: field('name'),
    email: field('email'),
    mobile: field('mobile'),
    department: field('department'),
    message: field('message'),
  };

  const errors: string[] = [];
  if (!form.name) errors.push('name');
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errors.push('email');
  if (!form.department) errors.push('department');
  if (!form.message) errors.push('message');
  for (const k of Object.keys(MAX) as (keyof typeof MAX)[]) {
    if (form[k].length > MAX[k]) errors.push(k);
  }
  if (errors.length) return Response.json({ error: 'Invalid fields', fields: errors }, { status: 400 });

  const sql = await db();
  const [row] = await sql`
    INSERT INTO contact_messages (name, email, mobile, department, message)
    VALUES (${form.name}, ${form.email}, ${form.mobile}, ${form.department}, ${form.message})
    RETURNING id`;
  return Response.json({ ok: true, id: row.id }, { status: 201 });
}
