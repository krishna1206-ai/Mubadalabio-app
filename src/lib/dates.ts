// Article dates are shown as "21 October 2026" / "21 أكتوبر 2026", matching the website.
// Shared by the server (formatting new posts) and the app (sorting all posts by date).

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

/** "2026-10-21" → "21 October 2026" (or the Arabic month name). */
export function formatArticleDate(iso: string, lang: 'en' | 'ar') {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[lang][m - 1]} ${y}`;
}

/** "21 October 2026" / "21 أكتوبر 2026" → sortable number (yyyymmdd), or 0 if unrecognised. */
export function articleDateValue(date: string) {
  const [d, month, y] = date.trim().split(/\s+/);
  let m = MONTHS.en.indexOf(month);
  if (m < 0) m = MONTHS.ar.indexOf(month);
  if (m < 0 || !Number(d) || !Number(y)) return 0;
  return Number(y) * 10000 + (m + 1) * 100 + Number(d);
}

/** Today's date as YYYY-MM-DD in local time. */
export function todayIso() {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
