import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text as RNText,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Button } from '@/components/ui';
import { card, colors, radius, space, type } from '@/constants/theme';
import { AuthError, FieldError, saveMediaPost, type MediaPayload, type MediaPost, type SavedPost } from '@/lib/admin';
import { formatArticleDate, todayIso } from '@/lib/dates';
import { detectLang, pickAndShrinkImage, type PickedImage } from '@/lib/pickImage';

const BADGES = {
  en: ['Press Release', 'News', 'Announcement', 'Event'],
  ar: ['بيان صحفي', 'أخبار', 'إعلان', 'فعالية'],
};

const FIELD_ERRORS: Record<string, string> = {
  image: 'Add an image (JPG, PNG or WebP, up to 4 MB) or an image URL.',
  imageUrl: 'Image URL must start with http:// or https://',
  badge: 'Enter a badge.',
  title: 'Enter a title.',
  date: 'Enter a valid date.',
  body: 'Enter a description.',
  url: 'Link must start with http:// or https://',
};

type Upload = PickedImage;

type Props = {
  token: string;
  /** Post being edited; omitted when adding a new one. */
  post?: MediaPost;
  onSaved: (saved: SavedPost, title: string) => void;
  onCancel: () => void;
  onAuthError: () => void;
};

/** Add or edit a media post, with a live preview in the style of the app's article page. */
export function MediaForm({ token, post, onSaved, onCancel, onAuthError }: Props) {
  const [lang, setLang] = useState<'en' | 'ar'>(post?.lang ?? 'en');
  const [badge, setBadge] = useState(post?.badge ?? BADGES.en[0]);
  const [title, setTitle] = useState(post?.title ?? '');
  const [date, setDate] = useState(post?.date ?? todayIso());
  const [body, setBody] = useState(post?.body ?? '');
  const [url, setUrl] = useState(post?.url ?? '');
  const [imageUrl, setImageUrl] = useState(post?.image_url ?? '');
  const [upload, setUpload] = useState<Upload | null>(null);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  // Language follows what is typed until the admin picks one by hand.
  const [langPicked, setLangPicked] = useState(!!post);
  const [translate, setTranslate] = useState(true);

  const previewImage = upload?.preview || imageUrl || post?.image || '';
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const switchLang = (next: 'en' | 'ar') => {
    // Swap a preset badge for the same one in the other language.
    const i = BADGES[lang].indexOf(badge);
    if (i >= 0) setBadge(BADGES[next][i]);
    setLang(next);
  };

  const pickLang = (next: 'en' | 'ar') => {
    setLangPicked(true);
    switchLang(next);
  };

  /** Typing Arabic switches the post to Arabic (and English to English), unless picked by hand. */
  const autoLang = (text: string) => {
    if (langPicked) return;
    const detected = detectLang(text);
    if (detected && detected !== lang) switchLang(detected);
  };

  const pickImage = async () => {
    setPicking(true);
    try {
      const picked = await pickAndShrinkImage();
      if (!picked) return;
      setUpload(picked);
      setImageUrl('');
      setErrors(({ image: _i, imageUrl: _u, ...rest }) => rest);
    } catch {
      setError('Could not load that image. Try a JPG or PNG file.');
    } finally {
      setPicking(false);
    }
  };

  const save = async () => {
    const local: Record<string, string> = {};
    if (!previewImage) local.image = FIELD_ERRORS.image;
    if (!badge.trim()) local.badge = FIELD_ERRORS.badge;
    if (!title.trim()) local.title = FIELD_ERRORS.title;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) local.date = FIELD_ERRORS.date;
    if (!body.trim()) local.body = FIELD_ERRORS.body;
    setErrors(local);
    setError('');
    if (Object.keys(local).length) return;

    const payload: MediaPayload = { lang, badge, title, date, body, url, imageUrl, translate };
    if (upload) payload.image = { mime: upload.mime, base64: upload.base64 };

    setSaving(true);
    try {
      const saved = await saveMediaPost(token, payload, post?.id);
      onSaved(saved, title.trim());
    } catch (e) {
      if (e instanceof AuthError) return onAuthError();
      if (e instanceof FieldError) {
        setErrors(Object.fromEntries(e.fields.map((f) => [f, FIELD_ERRORS[f] ?? 'Check this field.'])));
      } else {
        setError(e instanceof Error ? e.message : 'Could not save. Try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: space.lg }} keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        <Pressable onPress={onCancel} style={styles.back}>
          <Ionicons name="arrow-back" size={18} color={colors.blue} />
          <RNText style={styles.backText}>Back to media</RNText>
        </Pressable>
        <RNText style={styles.h1}>{post ? 'Edit media' : 'Add media'}</RNText>

        <View style={styles.columns}>
          {/* ---- Form ---- */}
          <View style={[styles.panel, styles.formPanel]}>
            <Label>Language</Label>
            <View style={styles.segment}>
              {(['en', 'ar'] as const).map((l) => (
                <Pressable key={l} onPress={() => pickLang(l)} style={[styles.segmentItem, lang === l && styles.segmentActive]}>
                  <RNText style={[styles.segmentText, lang === l && { color: colors.white }]}>
                    {l === 'en' ? 'English' : 'العربية'}
                  </RNText>
                </Pressable>
              ))}
            </View>
            <Hint>Detected from what you type. Shown on the Media page in this language.</Hint>

            <Label>Image *</Label>
            <Pressable onPress={pickImage} style={[styles.imageBox, !!errors.image && styles.inputError]}>
              {previewImage ? (
                <Image source={previewImage} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <View style={{ alignItems: 'center', gap: 6 }}>
                  <Ionicons name="cloud-upload-outline" size={30} color={colors.blue} />
                  <RNText style={{ color: colors.blue, fontWeight: '600' }}>Upload image</RNText>
                  <RNText style={{ color: colors.muted, fontSize: 12 }}>JPG, PNG or WebP</RNText>
                </View>
              )}
              {picking ? (
                <View style={styles.imageBusy}>
                  <ActivityIndicator color={colors.white} />
                </View>
              ) : null}
            </Pressable>
            {previewImage ? (
              <Pressable onPress={pickImage} style={styles.changeImage}>
                <Ionicons name="image-outline" size={16} color={colors.blue} />
                <RNText style={{ color: colors.blue, fontWeight: '600', fontSize: 13 }}>Change image</RNText>
              </Pressable>
            ) : null}
            <Field
              placeholder="…or paste an image URL (https://…)"
              value={imageUrl}
              onChangeText={(v) => {
                setImageUrl(v);
                if (v) setUpload(null);
              }}
              autoCapitalize="none"
              error={errors.image ?? errors.imageUrl}
            />

            <Label>Badge *</Label>
            <View style={styles.chips}>
              {BADGES[lang].map((b) => (
                <Pressable key={b} onPress={() => setBadge(b)} style={[styles.chip, badge === b && styles.chipActive]}>
                  <RNText style={[styles.chipText, badge === b && { color: colors.white }]}>{b}</RNText>
                </Pressable>
              ))}
            </View>
            <Field value={badge} onChangeText={setBadge} placeholder="Or type your own" maxLength={60} error={errors.badge} />

            <Label>Title *</Label>
            <Field
              value={title}
              onChangeText={(v) => {
                setTitle(v);
                autoLang(v);
              }}
              placeholder="Headline" maxLength={300} error={errors.title} />

            <Label>Date *</Label>
            {Platform.OS === 'web' ? (
              <View style={{ marginBottom: space.md }}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    ...webInput,
                    borderColor: errors.date ? '#d64545' : colors.line,
                  }}
                />
                {errors.date ? <RNText style={styles.error}>{errors.date}</RNText> : null}
              </View>
            ) : (
              <Field value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" error={errors.date} />
            )}

            <Label>Description *</Label>
            <Field
              value={body}
              onChangeText={(v) => {
                setBody(v);
                if (!title.trim()) autoLang(v);
              }}
              placeholder="Write the article…"
              multiline
              error={errors.body}
              style={{ height: 220, textAlignVertical: 'top' }}
            />
            <Hint>Leave an empty line between paragraphs.</Hint>

            <Label>View online link</Label>
            <Field
              value={url}
              onChangeText={setUrl}
              placeholder="https://mubadalabio.ae/media/… (optional)"
              autoCapitalize="none"
              error={errors.url}
            />
            <Hint>Where “View online” leads. Leave empty to hide that button.</Hint>

            <View style={styles.translateRow}>
              <Ionicons name="language-outline" size={20} color={colors.blue} />
              <View style={{ flex: 1 }}>
                <RNText style={styles.translateTitle}>
                  {post?.pair_id
                    ? `Also update the ${lang === 'en' ? 'العربية' : 'English'} version`
                    : `Auto-translate to ${lang === 'en' ? 'العربية' : 'English'}`}
                </RNText>
                <RNText style={styles.translateHint}>
                  {post?.pair_id
                    ? 'Re-translates it from this text. Its image and date are kept in sync.'
                    : 'Publishes the same post in the other language, translated automatically.'}
                </RNText>
              </View>
              <Switch
                value={translate}
                onValueChange={setTranslate}
                trackColor={{ true: colors.blue, false: colors.line }}
                thumbColor={colors.white}
                accessibilityLabel="Auto-translate"
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color="#b33636" />
                <RNText style={{ color: '#b33636', flex: 1 }}>{error}</RNText>
              </View>
            ) : null}

            <View style={styles.formActions}>
              <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
                {saving ? (
                  <>
                    <ActivityIndicator color={colors.white} />
                    {translate ? <RNText style={styles.primaryText}>Translating…</RNText> : null}
                  </>
                ) : (
                  <>
                    <Ionicons name={post ? 'save-outline' : 'paper-plane-outline'} size={17} color={colors.white} />
                    <RNText style={styles.primaryText}>{post ? 'Save changes' : 'Publish'}</RNText>
                  </>
                )}
              </Pressable>
              <Pressable onPress={onCancel} style={styles.secondary}>
                <RNText style={{ color: colors.ink, fontWeight: '600' }}>Cancel</RNText>
              </Pressable>
            </View>
          </View>

          {/* ---- Live preview, same look as the app's article page ---- */}
          <View style={[styles.panel, styles.previewPanel]}>
            <RNText style={styles.previewLabel}>PREVIEW</RNText>
            <View style={styles.previewCard}>
              <View style={styles.hero}>
                {previewImage ? <Image source={previewImage} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
              </View>
              <View style={[styles.body, lang === 'ar' && { direction: 'rtl' }]}>
                <RNText style={[styles.tag, lang === 'ar' && rtl]}>{badge || 'Badge'}</RNText>
                <RNText style={[type.h1, lang === 'ar' && rtl]}>{title || 'Title'}</RNText>
                <RNText style={[type.small, { marginTop: space.sm, marginBottom: space.lg }, lang === 'ar' && rtl]}>
                  {/^\d{4}-\d{2}-\d{2}$/.test(date) ? formatArticleDate(date, lang) : date}
                </RNText>
                {(paragraphs.length ? paragraphs : ['Description']).map((p, i) => (
                  <RNText key={i} style={[type.body, { marginBottom: space.md }, lang === 'ar' && rtl]}>
                    {p}
                  </RNText>
                ))}
                <View style={styles.previewActions} pointerEvents="none">
                  <Button title={lang === 'ar' ? 'مشاركة' : 'Share'} icon="share-social" onPress={() => {}} />
                  {url ? (
                    <Button title={lang === 'ar' ? 'عرض على الموقع' : 'View online'} variant="outline" icon="arrow-forward" onPress={() => {}} />
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const rtl = { textAlign: 'right', writingDirection: 'rtl' } as const;

function Label({ children }: { children: ReactNode }) {
  return <RNText style={styles.label}>{children}</RNText>;
}

function Hint({ children }: { children: ReactNode }) {
  return <RNText style={styles.hint}>{children}</RNText>;
}

function Field({ error, style, ...props }: TextInputProps & { error?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: space.md }}>
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.muted}
        style={[styles.input, style, focused && { borderColor: colors.blue }, !!error && styles.inputError]}
      />
      {error ? <RNText style={styles.error}>{error}</RNText> : null}
    </View>
  );
}

const webInput = {
  width: '100%',
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  fontSize: 15,
  color: colors.ink,
  backgroundColor: colors.bgSoft,
  border: '1.5px solid',
  borderRadius: radius.sm,
  padding: '10px 12px',
};

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: space.md },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { color: colors.blue, fontWeight: '600' },
  h1: { fontSize: 24, fontWeight: '600', color: colors.ink, marginTop: space.sm, marginBottom: space.md },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, alignItems: 'flex-start' },
  panel: { ...card, padding: space.lg },
  formPanel: { flexGrow: 1, flexBasis: 420, minWidth: 280 },
  previewPanel: { flexGrow: 1, flexBasis: 420, minWidth: 280, padding: space.md, backgroundColor: colors.bgSoft },
  label: { color: colors.ink, fontWeight: '600', marginBottom: 6 },
  hint: { color: colors.muted, fontSize: 12, marginTop: -8, marginBottom: space.md },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.bgSoft,
  },
  inputError: { borderColor: '#d64545' },
  error: { color: '#d64545', fontSize: 12, marginTop: 4 },
  segment: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: colors.blue,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: space.md,
  },
  segmentItem: { paddingHorizontal: 18, paddingVertical: 7 },
  segmentActive: { backgroundColor: colors.blue },
  segmentText: { color: colors.blue, fontWeight: '600', fontSize: 13 },
  imageBox: {
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.blue,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: space.sm,
  },
  imageBusy: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  changeImage: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.blue },
  chipActive: { backgroundColor: colors.blue },
  chipText: { color: colors.blue, fontSize: 13, fontWeight: '500' },
  errorBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.sm, backgroundColor: '#fdecec', marginBottom: space.md },
  translateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.sm,
    backgroundColor: '#eaf3ff',
    marginBottom: space.md,
  },
  translateTitle: { color: colors.ink, fontWeight: '600' },
  translateHint: { color: colors.muted, fontSize: 12, marginTop: 2 },
  formActions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 11,
    minWidth: 120,
    justifyContent: 'center',
  },
  primaryText: { color: colors.white, fontWeight: '600', fontSize: 14.5 },
  secondary: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line },
  previewLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1, marginBottom: space.sm },
  previewCard: { backgroundColor: colors.bg, borderRadius: radius.md, overflow: 'hidden' },
  // The styles below mirror src/app/news/[id].tsx.
  hero: { height: 220, backgroundColor: colors.line },
  body: { backgroundColor: colors.bg, padding: space.lg, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  tag: { color: colors.teal, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  previewActions: { flexDirection: 'row', gap: space.sm, marginTop: space.md, flexWrap: 'wrap' },
});
