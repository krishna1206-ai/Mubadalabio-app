import { isAdmin, unauthorized } from '@/server/auth';
import { db } from '@/server/db';

/** Lists contact messages, newest first. */
export async function GET(request: Request) {
  if (!(await isAdmin(request))) return unauthorized();
  const sql = await db();
  const messages = await sql`
    SELECT id, name, email, mobile, department, message, status, created_at
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT 500`;
  return Response.json({ messages });
}
