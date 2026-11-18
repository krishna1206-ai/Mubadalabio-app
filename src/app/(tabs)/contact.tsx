import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { PressableScale } from '@/components/PressableScale';
import { Reveal, RevealScrollView } from '@/components/Reveal';
import { Text } from '@/components/Text';
import { Button, Footer, PageHeader, openLink } from '@/components/ui';
import { office } from '@/constants/content';
import { card, colors, radius, space, type } from '@/constants/theme';
import { useLanguage } from '@/i18n/LanguageProvider';
import { submitContact, validate, type ContactForm } from '@/lib/contact';

const empty: ContactForm = { name: '', email: '', mobile: '', department: '', message: '' };

function Field({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  const { isRTL } = useLanguage();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: space.md }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          { textAlign: isRTL ? 'right' : 'left' },
          props.multiline && { height: 120, textAlignVertical: 'top' },
          focused && { borderColor: colors.blue },
          !!error && { borderColor: '#d64545' },
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function Contact() {
  const { t, content, departments } = useLanguage();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  const success = useRef(new Animated.Value(0)).current;

  const set = (k: keyof ContactForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const runShake = () =>
    Animated.sequence(
      [10, -10, 7, -7, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 60, useNativeDriver: true })),
    ).start();

  const onSubmit = async () => {
    const e = validate(form, t);
    setErrors(e);
    if (Object.keys(e).length) return runShake();
    setSending(true);
    setFailed(false);
    try {
      await submitContact(form);
      setSent(true);
      setForm(empty);
      Animated.spring(success, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    } catch {
      // Shown inline: Alert.alert does nothing in web browsers.
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <RevealScrollView style={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <PageHeader title={t.contactUs} subtitle={t.contactSubtitle} />

        <View style={styles.section}>
          {sent ? (
            <Animated.View style={[styles.success, { opacity: success, transform: [{ scale: success }] }]}>
              <Ionicons name="checkmark-circle" size={56} color={colors.teal} />
              <Text style={styles.successText}>{t.sentThanks}</Text>
              <Button title={t.sendAnother} variant="outline" onPress={() => {
                  success.setValue(0); // so the tick animates again after the next submission
                  setSent(false);
                }} />
            </Animated.View>
          ) : (
            <Reveal>
              <Animated.View style={[styles.formCard, { transform: [{ translateX: shake }] }]}>
                <Field label={t.name} value={form.name} onChangeText={set('name')} error={errors.name} />
                <Field
                  label={t.email}
                  value={form.email}
                  onChangeText={set('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                />
                <Field label={t.mobile} value={form.mobile} onChangeText={set('mobile')} keyboardType="phone-pad" />

                <Text style={styles.label}>{t.department}</Text>
                <View style={styles.chips}>
                  {departments.map((d) => {
                    const active = form.department === d;
                    return (
                      <PressableScale
                        key={d}
                        onPress={() => set('department')(d)}
                        style={[styles.chip, active && styles.chipActive]}
                        scaleTo={0.92}
                      >
                        <Text style={[styles.chipText, active && { color: colors.white }]}>{content.departmentLabel(d)}</Text>
                      </PressableScale>
                    );
                  })}
                </View>
                {errors.department ? <Text style={[styles.error, { marginTop: -8 }]}>{errors.department}</Text> : null}

                <Field
                  label={t.message}
                  value={form.message}
                  onChangeText={set('message')}
                  multiline
                  error={errors.message}
                />

                {failed ? (
                  <View style={styles.failBox}>
                    <Ionicons name="alert-circle" size={20} color="#d64545" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.failTitle}>{t.errorTitle}</Text>
                      <Text style={styles.failText}>{t.errorText}</Text>
                    </View>
                  </View>
                ) : null}

                {sending ? (
                  <ActivityIndicator color={colors.blue} style={{ alignSelf: 'flex-start', margin: 12 }} />
                ) : (
                  <Button title={t.submit} icon="send" onPress={onSubmit} />
                )}
                <Text style={styles.terms}>
                  {t.acceptPrefix}
                  <Text style={{ color: colors.blue }} onPress={() => openLink(content.privacyUrl, t.privacyPolicy)}>
                    {t.privacyPolicy}
                  </Text>
                </Text>
              </Animated.View>
            </Reveal>
          )}

          <Reveal style={styles.officeCard}>
            <View style={styles.officeIcon}>
              <Ionicons name="location-outline" size={22} color={colors.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t.officeLocation}</Text>
              <Text style={type.body}>{content.officeAddress}</Text>
              <Button
                title={t.getDirections}
                icon="navigate-outline"
                variant="outline"
                onPress={() => Linking.openURL(office.mapsUrl)}
                style={{ marginTop: space.sm, paddingVertical: 8 }}
              />
            </View>
          </Reveal>
        </View>
        <Footer />
      </RevealScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  section: { padding: space.lg },
  formCard: { ...card, padding: space.lg },
  label: { color: colors.ink, fontWeight: '600', marginBottom: 6 },
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
  error: { color: '#d64545', fontSize: 12, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.md },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  chipActive: { backgroundColor: colors.blue },
  chipText: { color: colors.blue, fontSize: 13, fontWeight: '500' },
  failBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    marginBottom: space.md,
    borderRadius: radius.sm,
    backgroundColor: '#fdecec',
  },
  failTitle: { color: '#b33636', fontWeight: '600' },
  failText: { color: '#b33636', fontSize: 13 },
  terms: { marginTop: space.md, fontSize: 12, color: colors.muted },
  success: { ...card, padding: space.xl, alignItems: 'center', gap: space.md },
  successText: { fontSize: 17, color: colors.ink, textAlign: 'center', fontWeight: '500' },
  officeCard: { ...card, flexDirection: 'row', gap: space.md, padding: space.lg, marginTop: space.lg },
  officeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
