import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text as RNText,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { card, colors, radius, space, type } from '@/constants/theme';
import {
  AuthError,
  FieldError,
  saveLeader,
  type AdminLeader,
  type LeaderGroup,
  type LeaderPayload,
  type SavedLeader,
} from '@/lib/admin';
import { detectLang, pickAndShrinkImage, type PickedImage } from '@/lib/pickImage';

const GROUPS: { key: LeaderGroup; label: string }[] = [
  { key: 'board', label: 'Board of Directors' },
  { key: 'team', label: 'Leadership Team' },
];

/** Common titles, so admins can tap instead of type. */
const ROLES = {
  en: { board: ['Chairman', 'Board Member'], team: ['Group Chief Executive Officer', 'Chief Executive Officer'] },
  ar: { board: ['رئيس مجلس الإدارة', 'عضو مجلس الإدارة'], team: ['الرئيس التنفيذي للمجموعة', 'الرئيس التنفيذي'] },
};

const FIELD_ERRORS: Record<string, string> = {
  photo: 'Add a photo (JPG, PNG or WebP, up to 4 MB) or a photo URL.',
  photoUrl: 'Photo URL must start with http:// or https://',
  name: 'Enter the name.',
  role: 'Enter the job title.',
  grp: 'Choose a section.',
};

type Props = {
  token: string;
  /** Profile being edited; omitted when adding. */
  leader?: AdminLeader;
  /** Section to preselect when adding. */
  defaultGroup?: LeaderGroup;
  /** Everyone currently listed, to offer positions relative to them. */
  all: AdminLeader[];
  onSaved: (saved: SavedLeader, name: string) => void;
  onCancel: () => void;
  onAuthError: () => void;
};

/** Add or edit a Board / Leadership profile, with a live preview in the Leadership page's style. */
export function LeaderForm({ token, leader, defaultGroup = 'board', all, onSaved, onCancel, onAuthError }: Props) {
  const [lang, setLang] = useState<'en' | 'ar'>(leader?.lang ?? 'en');
  const [langPicked, setLangPicked] = useState(!!leader);
  const [grp, setGrp] = useState<LeaderGroup>(leader?.grp ?? defaultGroup);
  const [name, setName] = useState(leader?.name ?? '');
  const [role, setRole] = useState(leader?.role ?? '');
  const [bio, setBio] = useState(leader?.bio ?? '');
  // 'end' = last in the section; otherwise the 1-based place in the list.
  const [position, setPosition] = useState<number | 'end'>(leader ? leader.sort_order : 'end');
  const [photoUrl, setPhotoUrl] = useState(leader?.photo_url ?? '');
  const [upload, setUpload] = useState<PickedImage | null>(null);
  const [translate, setTranslate] = useState(true);
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const photo = upload?.preview || photoUrl || leader?.photo || '';
  const paragraphs = bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const other = lang === 'en' ? 'العربية' : 'English';

  // The other people in this section and language, in page order.
  const siblings = all
    .filter((l) => l.grp === grp && l.lang === lang && l.id !== leader?.id)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);
  const slots = siblings.length + 1;
  const place = position === 'end' || position > slots ? slots : position;
  const slotLabel = (n: number) => {
    if (n === 1) return siblings[0] ? `At the top (before ${siblings[0].name})` : 'First';
    if (n === slots) return `At the end (after ${siblings[n - 2].name})`;
    return `After ${siblings[n - 2].name}`;
  };
  const rtl = lang === 'ar';

  const switchLang = (next: 'en' | 'ar') => {
    // Swap a preset title for the same one in the other language.
    const i = ROLES[lang][grp].indexOf(role);
    if (i >= 0) setRole(ROLES[next][grp][i]);
    setLang(next);
  };

  /** Typing an Arabic name switches the profile to Arabic (and English to English), unless picked by hand. */
  const autoLang = (text: string) => {
    if (langPicked) return;
    const detected = detectLang(text);
    if (detected && detected !== lang) switchLang(detected);
  };

  const pickPhoto = async () => {
    setPicking(true);
    try {
      const picked = await pickAndShrinkImage(900);
      if (!picked) return;
      setUpload(picked);
      setPhotoUrl('');
      setErrors(({ photo: _p, photoUrl: _u, ...rest }) => rest);
    } catch {
      setError('Could not load that photo. Try a JPG or PNG file.');
    } finally {
      setPicking(false);
    }
  };

  const save = async () => {
    const local: Record<string, string> = {};
    if (!photo) local.photo = FIELD_ERRORS.photo;
    if (!name.trim()) local.name = FIELD_ERRORS.name;
    if (!role.trim()) local.role = FIELD_ERRORS.role;
    setErrors(local);
    setError('');
    if (Object.keys(local).length) return;

    const payload: LeaderPayload = {
      lang,
      grp,
      name,
      role,
      bio,
      // A new person placed at the end is simply appended; everything else is an explicit place.
      sortOrder: !leader && place === slots ? null : place,
      photoUrl,
      translate,
    };
    if (upload) payload.photo = { mime: upload.mime, base64: upload.base64 };

    setSaving(true);
    try {
      onSaved(await saveLeader(token, payload, leader?.id), name.trim());
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
          <RNText style={styles.backText}>Back to leadership</RNText>
        </Pressable>
        <RNText style={styles.h1}>{leader ? 'Edit person' : 'Add person'}</RNText>

        <View style={styles.columns}>
          {/* ---- Form ---- */}
          <View style={[styles.panel, styles.formPanel]}>
            <Label>Section *</Label>
            <View style={styles.chips}>
              {GROUPS.map((g) => (
                <Pressable key={g.key} onPress={() => setGrp(g.key)} style={[styles.chip, grp === g.key && styles.chipActive]}>
                  <RNText style={[styles.chipText, grp === g.key && { color: colors.white }]}>{g.label}</RNText>
                </Pressable>
              ))}
            </View>

            <Label>Language</Label>
            <View style={styles.segment}>
              {(['en', 'ar'] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => {
                    setLangPicked(true);
                    switchLang(l);
                  }}
                  style={[styles.segmentItem, lang === l && styles.segmentActive]}
                >
                  <RNText style={[styles.segmentText, lang === l && { color: colors.white }]}>
                    {l === 'en' ? 'English' : 'العربية'}
                  </RNText>
                </Pressable>
              ))}
            </View>
            <Hint>Detected from the name you type.</Hint>

            <Label>Photo *</Label>
            <View style={styles.photoRow}>
              <Pressable onPress={pickPhoto} style={[styles.photoBox, !!errors.photo && styles.inputError]}>
                {photo ? (
                  <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
                ) : (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Ionicons name="person-add-outline" size={26} color={colors.blue} />
                    <RNText style={{ color: colors.blue, fontWeight: '600', fontSize: 13 }}>Upload</RNText>
                  </View>
                )}
                {picking ? (
                  <View style={styles.busy}>
                    <ActivityIndicator color={colors.white} />
                  </View>
                ) : null}
              </Pressable>
              <View style={{ flex: 1, gap: space.sm }}>
                <Pressable onPress={pickPhoto} style={styles.secondaryBtn}>
                  <Ionicons name="image-outline" size={16} color={colors.blue} />
                  <RNText style={{ color: colors.blue, fontWeight: '600', fontSize: 13 }}>
                    {photo ? 'Change photo' : 'Upload photo'}
                  </RNText>
                </Pressable>
                <Hint>A portrait photo works best; the top of the photo is kept.</Hint>
              </View>
            </View>
            <Field
              placeholder="…or paste a photo URL (https://…)"
              value={photoUrl}
              onChangeText={(v) => {
                setPhotoUrl(v);
                if (v) setUpload(null);
              }}
              autoCapitalize="none"
              error={errors.photo ?? errors.photoUrl}
            />

            <Label>Name *</Label>
            <Field
              value={name}
              onChangeText={(v) => {
                setName(v);
                autoLang(v);
              }}
              placeholder={lang === 'ar' ? 'مثال: الدكتور بخيت الكثيري' : 'e.g. Dr. Bakheet Al Katheeri'}
              maxLength={150}
              error={errors.name}
              rtl={rtl}
            />

            <Label>Job title *</Label>
            <View style={styles.chips}>
              {ROLES[lang][grp].map((r) => (
                <Pressable key={r} onPress={() => setRole(r)} style={[styles.chip, role === r && styles.chipActive]}>
                  <RNText style={[styles.chipText, role === r && { color: colors.white }]}>{r}</RNText>
                </Pressable>
              ))}
            </View>
            <Field value={role} onChangeText={setRole} placeholder="Or type the title" maxLength={200} error={errors.role} rtl={rtl} />

            <Label>Biography</Label>
            <Field
              value={bio}
              onChangeText={setBio}
              placeholder="Shown when someone taps “Read More”."
              multiline
              style={{ height: 200, textAlignVertical: 'top' }}
              rtl={rtl}
            />
            <Hint>Leave an empty line between paragraphs.</Hint>

            <Label>Position on the page</Label>
            <View style={styles.slots}>
              {Array.from({ length: slots }, (_, i) => i + 1).map((n) => {
                const active = place === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => setPosition(n === slots ? 'end' : n)}
                    style={[styles.slot, active && styles.slotActive]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
                    <RNText style={styles.slotNum}>{n}</RNText>
                    <RNText style={[styles.slotText, active && { color: colors.ink, fontWeight: '600' }]} numberOfLines={1}>
                      {slotLabel(n)}
                    </RNText>
                  </Pressable>
                );
              })}
            </View>
            <Hint>
              Everyone from this place on moves down one.{grp === 'board' ? ' Board of Directors' : ' Leadership Team'},{' '}
              {lang === 'ar' ? 'العربية' : 'English'} page.
            </Hint>

            <View style={styles.translateRow}>
              <Ionicons name="language-outline" size={20} color={colors.blue} />
              <View style={{ flex: 1 }}>
                <RNText style={styles.translateTitle}>
                  {leader?.pair_id ? `Also update the ${other} version` : `Auto-translate to ${other}`}
                </RNText>
                <RNText style={styles.translateHint}>
                  {leader?.pair_id
                    ? 'Re-translates it from this text. Photo, section and position are kept in sync.'
                    : 'Adds the same person to the other language’s page, translated automatically.'}
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
                    <Ionicons name={leader ? 'save-outline' : 'person-add-outline'} size={17} color={colors.white} />
                    <RNText style={styles.primaryText}>{leader ? 'Save changes' : 'Add person'}</RNText>
                  </>
                )}
              </Pressable>
              <Pressable onPress={onCancel} style={styles.secondary}>
                <RNText style={{ color: colors.ink, fontWeight: '600' }}>Cancel</RNText>
              </Pressable>
            </View>
          </View>

          {/* ---- Live preview: same look as the Leadership page's card and bio sheet ---- */}
          <View style={[styles.panel, styles.previewPanel]}>
            <RNText style={styles.previewLabel}>PREVIEW · CARD</RNText>
            <View style={[styles.previewCardWrap, rtl && { direction: 'rtl' }]}>
              <View style={styles.card}>
                {photo ? (
                  <Image source={photo} style={styles.photo} contentFit="cover" contentPosition="top" />
                ) : (
                  <View style={styles.photo} />
                )}
                <View style={styles.cardBody}>
                  <RNText style={[styles.name, rtl && rtlText]} numberOfLines={2}>
                    {name || (rtl ? 'الاسم' : 'Name')}
                  </RNText>
                  <RNText style={[styles.role, rtl && rtlText]} numberOfLines={2}>
                    {role || (rtl ? 'المسمى الوظيفي' : 'Job title')}
                  </RNText>
                  <View style={styles.readMore}>
                    <RNText style={styles.readMoreText}>{rtl ? 'اقرأ المزيد' : 'Read More'}</RNText>
                    <Ionicons name={rtl ? 'arrow-back' : 'arrow-forward'} size={12} color={colors.teal} />
                  </View>
                </View>
              </View>
            </View>

            <RNText style={[styles.previewLabel, { marginTop: space.lg }]}>PREVIEW · READ MORE</RNText>
            <View style={[styles.sheet, rtl && { direction: 'rtl' }]}>
              <View style={styles.sheetHead}>
                {photo ? (
                  <Image source={photo} style={styles.sheetPhoto} contentFit="cover" contentPosition="top" />
                ) : (
                  <View style={styles.sheetPhoto} />
                )}
                <View style={{ flex: 1 }}>
                  <RNText style={[type.h3, rtl && rtlText]}>{name || (rtl ? 'الاسم' : 'Name')}</RNText>
                  <RNText style={[styles.role, { fontSize: 14, marginTop: 4 }, rtl && rtlText]}>
                    {role || (rtl ? 'المسمى الوظيفي' : 'Job title')}
                  </RNText>
                </View>
              </View>
              {(paragraphs.length ? paragraphs : [rtl ? 'السيرة الذاتية' : 'Biography']).map((p, i) => (
                <RNText key={i} style={[type.body, { marginBottom: space.md }, rtl && rtlText]}>
                  {p}
                </RNText>
              ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const rtlText = { textAlign: 'right', writingDirection: 'rtl' } as const;

function Label({ children }: { children: ReactNode }) {
  return <RNText style={styles.label}>{children}</RNText>;
}

function Hint({ children }: { children: ReactNode }) {
  return <RNText style={styles.hint}>{children}</RNText>;
}

function Field({ error, style, rtl, ...props }: TextInputProps & { error?: string; rtl?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: space.md }}>
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          rtl && { textAlign: 'right', writingDirection: 'rtl' },
          style,
          focused && { borderColor: colors.blue },
          !!error && styles.inputError,
        ]}
      />
      {error ? <RNText style={styles.error}>{error}</RNText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inner: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingHorizontal: space.md },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  backText: { color: colors.blue, fontWeight: '600' },
  h1: { fontSize: 24, fontWeight: '600', color: colors.ink, marginTop: space.sm, marginBottom: space.md },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg, alignItems: 'flex-start' },
  panel: { ...card, padding: space.lg },
  formPanel: { flexGrow: 1, flexBasis: 460, minWidth: 280 },
  previewPanel: { flexGrow: 1, flexBasis: 360, minWidth: 280, padding: space.md, backgroundColor: colors.bgSoft },
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.md },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.blue },
  chipActive: { backgroundColor: colors.blue },
  chipText: { color: colors.blue, fontSize: 13, fontWeight: '500' },
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
  photoRow: { flexDirection: 'row', gap: space.md, alignItems: 'center', marginBottom: space.sm },
  photoBox: {
    width: 110,
    aspectRatio: 618 / 770,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.blue,
    backgroundColor: colors.bgSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  busy: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  slots: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSoft,
    paddingVertical: 4,
    marginBottom: space.md,
  },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8 },
  slotActive: { backgroundColor: '#eaf3ff' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.blue },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.blue },
  slotNum: { width: 18, fontSize: 13, fontWeight: '700', color: colors.muted },
  slotText: { flex: 1, fontSize: 13.5, color: colors.text },
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
  errorBox: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: radius.sm, backgroundColor: '#fdecec', marginBottom: space.md },
  formActions: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 11,
    minWidth: 130,
    justifyContent: 'center',
  },
  primaryText: { color: colors.white, fontWeight: '600', fontSize: 14.5 },
  secondary: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.line },
  previewLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1, marginBottom: space.sm },
  previewCardWrap: { width: 200 },
  // The styles below mirror src/app/leadership.tsx.
  card: { ...card, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 618 / 770, backgroundColor: colors.line },
  cardBody: { padding: space.sm, paddingBottom: space.md },
  name: { fontSize: 14, fontWeight: '700', color: colors.ink },
  role: { fontSize: 12, color: colors.blue, marginTop: 2 },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: space.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    borderColor: colors.teal,
  },
  readMoreText: { fontSize: 11, color: colors.teal, fontWeight: '600' },
  sheet: { backgroundColor: colors.white, borderRadius: 24, padding: space.lg },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginBottom: space.lg },
  sheetPhoto: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.line },
});
