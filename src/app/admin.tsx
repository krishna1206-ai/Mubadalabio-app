import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { clearToken, loadToken, saveToken } from '@/lib/admin';
import { colors } from '@/constants/theme';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

/** /admin — sign in with the admin email and password, then manage contact messages. */
export default function AdminScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Stable so the panel's polling effect isn't restarted on every render.
  const signOut = useCallback(() => {
    clearToken();
    setToken(null);
  }, []);

  useEffect(() => {
    loadToken().then((t) => {
      setToken(t);
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSoft }}>
        <ActivityIndicator color={colors.blue} />
      </View>
    );
  }

  if (!token) {
    return (
      <AdminLogin
        onSignedIn={(t) => {
          saveToken(t);
          setToken(t);
        }}
      />
    );
  }

  return (
    <AdminPanel token={token} onSignOut={signOut} />
  );
}
