import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Logo } from '@/components/ui';
import { card, colors, gradient, radius, space } from '@/constants/theme';
import { AuthError, login } from '@/lib/admin';

export function AdminLogin({ onSignedIn }: { onSignedIn: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    setError('');
    try {
      const { token } = await login(email, password);
      onSignedIn(token);
    } catch (e) {
      setError(e instanceof AuthError ? 'Incorrect email or password.' : 'Could not reach the server. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.screen}>
      <View style={styles.card}>
        <View style={{ alignItems: 'center', marginBottom: space.lg }}>
          <Logo width={150} />
          <Text style={styles.title}>Admin sign in</Text>
          <Text style={styles.subtitle}>Manage messages sent through the contact form</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="admin@mubadalabio.ae"
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.input}
          onSubmitEditing={submit}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            autoComplete="current-password"
            style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
            onSubmitEditing={submit}
          />
          <Pressable
            onPress={() => setShowPassword((s) => !s)}
            hitSlop={8}
            style={{ paddingHorizontal: 12 }}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color="#b33636" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable onPress={submit} disabled={busy} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
          {busy ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.md },
  card: { ...card, width: '100%', maxWidth: 400, padding: space.xl },
  title: { fontSize: 22, fontWeight: '600', color: colors.ink, marginTop: space.md },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center' },
  label: { color: colors.ink, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.bgSoft,
    marginBottom: space.md,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSoft,
    marginBottom: space.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.sm,
    backgroundColor: '#fdecec',
    marginBottom: space.md,
  },
  errorText: { color: '#b33636', fontSize: 13, flex: 1 },
  button: {
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: { color: colors.white, fontWeight: '600', fontSize: 15 },
});
