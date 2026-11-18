import { db } from '@/server/db';

/** Public: serves an uploaded media image. Image ids never change content, so it caches for a year. */
export async function GET(_request: Request, { id }: Record<string, string>) {
  if (!/^\d+$/.test(id)) return new Response('Not found', { status: 404 });
  const sql = await db();
  const [row] = await sql`SELECT mime, encode(data, 'base64') AS data FROM media_images WHERE id = ${Number(id)}`;
  if (!row) return new Response('Not found', { status: 404 });

  const bytes = Uint8Array.from(atob(row.data.replace(/\s/g, '')), (c) => c.charCodeAt(0));
  return new Response(bytes, {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
