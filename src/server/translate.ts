// Server-only module: English ⇄ Arabic translation of media posts and leadership profiles.
//
// Translator, first one that is set up wins:
//   1. Claude, via ANTHROPIC_API_KEY (Claude API) or NEON_AI_GATEWAY_TOKEN + NEON_AI_GATEWAY_BASE_URL
//      (Neon AI Gateway; needs AI Gateway credits: Neon Console → Billing).
//   2. Gemini, via GEMINI_API_KEY (free key, no card: https://aistudio.google.com/apikey).
import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { z } from 'zod';

const MODEL = 'claude-opus-5-5';

export type Lang = 'en' | 'ar';
export type TranslatableFields = { badge: string; title: string; body: string };

/** Translation could not run: no credentials, or the account has no access/credits yet. */
export class TranslationUnavailableError extends Error {}

const Translation = z.object({
  badge: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string()),
});

const SYSTEM = `You translate press releases and news posts for Mubadala Bio, a UAE life sciences company, between English and Arabic.
- Arabic output: formal Modern Standard Arabic in the style of Gulf corporate press releases (as on mubadalabio.ae/ar).
- English output: clear, formal corporate English.
- Translate faithfully: do not add, drop, summarise or comment. Keep every number, date, and quotation.
- Use the established spelling for organisations, people, places, products and drug names (e.g. "مبادلة بايو" for Mubadala Bio, "أبوظبي" for Abu Dhabi). Keep a Latin brand name in Latin letters when it has no established Arabic form.
- Return exactly one translated paragraph for each input paragraph, in the same order.
- The badge is a short label such as "Press Release" / "بيان صحفي"; translate it the same way.`;

/** What is being translated. A profile reuses the same fields: badge = job title, title = name, body = bio. */
export type TranslationKind = 'post' | 'profile';

const PROFILE_NOTE = `

This item is a leadership profile, not a post:
- "title" is the person's full name. Transliterate it the way that person's name is normally written in the target language (e.g. "Dr. Bakheet Al Katheeri" ⇄ "الدكتور بخيت الكثيري"); never translate the meaning of a name.
- "badge" is their job title (e.g. "Chairman" ⇄ "رئيس مجلس الإدارة", "Board Member" ⇄ "عضو مجلس الإدارة", "Group Chief Executive Officer" ⇄ "الرئيس التنفيذي للمجموعة").
- "paragraphs" is their biography.`;

const systemFor = (kind: TranslationKind) => (kind === 'profile' ? SYSTEM + PROFILE_NOTE : SYSTEM);

function makeClient(): { client: Anthropic; direct: boolean } | null {
  if (process.env.ANTHROPIC_API_KEY) return { client: new Anthropic({ timeout: 55_000 }), direct: true };
  const token = process.env.NEON_AI_GATEWAY_TOKEN;
  const base = process.env.NEON_AI_GATEWAY_BASE_URL;
  if (token && base) {
    return {
      client: new Anthropic({ apiKey: token, baseURL: `${base.replace(/\/$/, '')}/anthropic`, timeout: 55_000 }),
      direct: false,
    };
  }
  return null;
}

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'ar' : 'en');

const splitParagraphs = (body: string) =>
  body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Translates badge, title and body from `from` into the other language. */
export async function translatePost(
  fields: TranslatableFields,
  from: Lang,
  kind: TranslationKind = 'post',
): Promise<TranslatableFields> {
  try {
    return await translateWithClaude(fields, from, kind);
  } catch (e) {
    // Claude isn't set up (or has no credits): use Gemini instead.
    if (!(e instanceof TranslationUnavailableError)) throw e;
  }
  return translateWithGemini(fields, from, kind);
}

/** Badges the admin form offers, translated exactly rather than by machine. */
const BADGE_PAIRS: [string, string][] = [
  ['Press Release', 'بيان صحفي'],
  ['News', 'أخبار'],
  ['Announcement', 'إعلان'],
  ['Event', 'فعالية'],
];

/** Fixes names a model may still get wrong, matching the official website's wording. */
const GLOSSARY: Record<Lang, [RegExp, string][]> = {
  ar: [
    [/مبادلة\s+(?:بيو|للبيولوجيا|للعلوم\s+الحيوية|للعلوم\s+البيولوجية)/g, 'مبادلة بايو'],
    [/أبو\s+ظبي/g, 'أبوظبي'],
  ],
  en: [[/Mubadala\s+(?:Bio\s*sciences|Life\s+Sciences|Biological\s+Sciences|Biology|Bayo)\b/gi, 'Mubadala Bio']],
};

const applyGlossary = (text: string, lang: Lang) =>
  GLOSSARY[lang].reduce((t, [re, value]) => t.replace(re, value), text);

// ---- Gemini (free key from https://aistudio.google.com/apikey) ------------

// Tried in order: when one is busy, retired or slow, the next is used. Chosen by testing on a free
// key (Nov 2026): flash-lite answers in ~2 s; the newest models were too slow for a save button.
// Set GEMINI_MODEL to put a different model first.
const GEMINI_MODELS = [...new Set([process.env.GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-3.5-flash'].filter(Boolean))] as string[];

type GeminiResponse = { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };

/** Calls one model. Returns null when this model can't serve right now, so the next one is tried. */
async function callGemini(model: string, key: string, body: string): Promise<GeminiResponse | null> {
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: AbortSignal.timeout(25_000),
      body,
    });
  } catch {
    return null; // timed out or network hiccup
  }
  if (res.status === 401 || res.status === 403 || res.status === 400) {
    const detail = await res.text();
    if (/API key|API_KEY|PERMISSION_DENIED|UNAUTHENTICATED/i.test(detail)) {
      throw new TranslationUnavailableError('The Gemini API key was rejected');
    }
    throw new Error(`Gemini rejected the request (${res.status})`);
  }
  if (res.status === 404 || res.status === 429 || res.status >= 500) return null; // retired, rate-limited or busy
  if (!res.ok) throw new Error(`Gemini returned an error (${res.status})`);
  return (await res.json()) as GeminiResponse;
}

async function translateWithGemini(fields: TranslatableFields, from: Lang, kind: TranslationKind): Promise<TranslatableFields> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new TranslationUnavailableError('No GEMINI_API_KEY configured');
  const to = otherLang(from);
  const names = { en: 'English', ar: 'Arabic' };
  const source = { badge: fields.badge, title: fields.title, paragraphs: splitParagraphs(fields.body) };

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: systemFor(kind) }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: `Translate this ${names[from]} ${kind} into ${names[to]}.\n\n${JSON.stringify(source, null, 2)}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          badge: { type: 'STRING' },
          title: { type: 'STRING' },
          paragraphs: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['badge', 'title', 'paragraphs'],
      },
    },
  });

  let data: GeminiResponse | null = null;
  for (const model of GEMINI_MODELS) {
    data = await callGemini(model, key, body);
    if (data) break;
  }
  if (!data) throw new Error('Gemini is busy right now. Try saving again in a minute.');

  const text =
    data.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought)
      .map((p) => p.text ?? '')
      .join('') ?? '';
  let json: unknown = null;
  try {
    json = JSON.parse(text || '{}');
  } catch {
    // handled below as an empty translation
  }
  const parsed = Translation.safeParse(json);
  if (!parsed.success || !parsed.data.title.trim() || !parsed.data.paragraphs.length) {
    throw new Error('The translation came back empty');
  }
  const out = parsed.data;
  const fromIndex = from === 'en' ? 0 : 1;
  const preset = kind === 'post' ? BADGE_PAIRS.find((pair) => pair[fromIndex] === fields.badge.trim()) : undefined;
  return {
    badge: preset ? preset[1 - fromIndex] : applyGlossary(out.badge.trim() || fields.badge, to),
    title: applyGlossary(out.title.trim(), to),
    body: out.paragraphs.map((p) => applyGlossary(p.trim(), to)).join('\n\n'),
  };
}

// ---- Claude ----------------------------------------------------------------

async function translateWithClaude(fields: TranslatableFields, from: Lang, kind: TranslationKind): Promise<TranslatableFields> {
  const setup = makeClient();
  if (!setup) throw new TranslationUnavailableError('No Claude credentials configured');
  const to = otherLang(from);
  const names = { en: 'English', ar: 'Arabic' };

  const source = { badge: fields.badge, title: fields.title, paragraphs: splitParagraphs(fields.body) };

  try {
    const response = await setup.client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: systemFor(kind),
      output_config: { effort: 'medium', format: betaZodOutputFormat(Translation) },
      // On the Claude API, a declined request is retried on a fallback model in the same call.
      // The Neon gateway proxies plain Messages requests, so the beta is only sent directly.
      ...(setup.direct ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      messages: [
        {
          role: 'user',
          content: `Translate this ${names[from]} ${kind} into ${names[to]}.\n\n${JSON.stringify(source, null, 2)}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') throw new Error('The translation request was declined');
    if (response.stop_reason === 'max_tokens') throw new Error('The post is too long to translate in one go');
    const out = response.parsed_output;
    if (!out?.title.trim() || !out.paragraphs.length) throw new Error('The translation came back empty');

    return { badge: out.badge.trim() || fields.badge, title: out.title.trim(), body: out.paragraphs.join('\n\n') };
  } catch (e) {
    // 401/403 here means missing access (e.g. no AI Gateway credits), not a bad request.
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
      throw new TranslationUnavailableError(e.message);
    }
    throw e;
  }
}
