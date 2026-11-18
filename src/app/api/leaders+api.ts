import { db } from '@/server/db';
import { toLeader, type LeaderRow } from '@/server/leaders';

/** Public: Board of Directors and Leadership Team for one language. GET /api/leaders?lang=en */
export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const sql = await db();
  const rows = (await sql`
    SELECT id, lang, grp, name, role, bio, photo_id, photo_url, sort_order, pair_id
    FROM leaders
    WHERE lang = ${lang}
    ORDER BY sort_order, id`) as LeaderRow[];
  return Response.json(
    {
      board: rows.filter((r) => r.grp === 'board').map(toLeader),
      team: rows.filter((r) => r.grp === 'team').map(toLeader),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
