// Server-only module: imports the built-in press releases (media_posts) and leaders once, so admins can
// edit and delete them like any other post. Runs from db() on first use of a fresh database.
import type { NeonQueryFunction } from '@neondatabase/serverless';

import type { Article } from '@/constants/content';
import { articlesEn } from '@/constants/news';
import { articlesAr } from '@/constants/news.ar';
import { board as boardEn, team as teamEn } from '@/constants/leadership';
import { board as boardAr, team as teamAr } from '@/constants/leadership.ar';
import { articleDateValue } from '@/lib/dates';

type Sql = NeonQueryFunction<false, false>;

const SEED_KEY = 'media_seeded_v1';
const BADGE = { en: 'Press Release', ar: 'بيان صحفي' };

const toIso = (date: string) => {
  const v = articleDateValue(date); // yyyymmdd
  if (!v) throw new Error(`Unrecognised article date: ${date}`);
  const s = String(v);
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
};

/**
 * Seeds once per database. A flag row records that it ran, so posts an admin deletes later are
 * not brought back. Inserts skip slugs that already exist, so running twice is harmless.
 */
export async function seedMediaPosts(sql: Sql) {
  const [done] = await sql`SELECT 1 FROM app_meta WHERE key = ${SEED_KEY}`;
  if (done) return;

  const rows: { lang: 'en' | 'ar'; a: Article }[] = [
    ...articlesEn.map((a) => ({ lang: 'en' as const, a })),
    ...articlesAr.map((a) => ({ lang: 'ar' as const, a })),
  ];
  // Lists are newest first; insert oldest first so same-day posts keep their order (id DESC).
  rows.reverse();

  await sql.transaction([
    ...rows.map(
      ({ lang, a }) => sql`
        INSERT INTO media_posts (lang, slug, badge, title, date, body, url, image_url)
        VALUES (${lang}, ${a.id}, ${a.badge ?? BADGE[lang]}, ${a.title}, ${toIso(a.date)},
                ${a.body.join('\n\n')}, ${a.url}, ${a.image})
        ON CONFLICT (lang, slug) DO NOTHING`,
    ),
    sql`INSERT INTO app_meta (key, value) VALUES (${SEED_KEY}, now()::text) ON CONFLICT (key) DO NOTHING`,
  ]);
}

const LEADERS_SEED_KEY = 'leaders_seeded_v1';

/**
 * Imports the built-in Board of Directors and Leadership Team (English + Arabic) into `leaders`
 * once, so admins can edit them. The two languages list the same people in the same order with
 * the same photos, so each English profile is paired with its Arabic one.
 */
export async function seedLeaders(sql: Sql) {
  const [done] = await sql`SELECT 1 FROM app_meta WHERE key = ${LEADERS_SEED_KEY}`;
  if (done) return;

  const groups = [
    { grp: 'board', en: boardEn, ar: boardAr },
    { grp: 'team', en: teamEn, ar: teamAr },
  ] as const;

  const inserts = groups.flatMap(({ grp, en, ar }) =>
    (['en', 'ar'] as const).flatMap((lang) =>
      (lang === 'en' ? en : ar).map(
        (p, i) => sql`
          INSERT INTO leaders (lang, grp, name, role, bio, photo_url, sort_order)
          VALUES (${lang}, ${grp}, ${p.name}, ${p.role}, ${p.bio.join('\n\n')}, ${p.photo}, ${i + 1})`,
      ),
    ),
  );

  await sql.transaction([
    ...inserts,
    sql`
      UPDATE leaders a SET pair_id = b.id
      FROM leaders b
      WHERE a.pair_id IS NULL AND a.lang <> b.lang AND a.grp = b.grp
        AND a.sort_order = b.sort_order AND a.photo_url = b.photo_url`,
    sql`INSERT INTO app_meta (key, value) VALUES (${LEADERS_SEED_KEY}, now()::text) ON CONFLICT (key) DO NOTHING`,
  ]);
}
