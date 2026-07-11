import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Login failed');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: topPad + 48,
          paddingBottom: bottomPad + 24,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[s.logo, { color: colors.primary }]}>MovieFlix</Text>
        <Text style={[s.title, { color: colors.foreground }]}>Sign In</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          Welcome back
        </Text>

        <TextInput
          style={[
            s.input,
            {
              backgroundColor: colors.input,
              borderColor: emailFocused ? colors.primary : colors.border,
              color: colors.foreground,
              borderRadius: colors.radius,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.mutedForeground}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />
        <TextInput
          style={[
            s.input,
            {
              backgroundColor: colors.input,
              borderColor: passwordFocused ? colors.primary : colors.border,
              color: colors.foreground,
              borderRadius: colors.radius,
            },
          ]}
          placeholder="Password"
          placeholderTextColor={colors.mutedForeground}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />

        {!!error && <Text style={[s.error, { color: colors.destructive }]}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            s.button,
            { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[s.buttonText, { color: colors.primaryForeground }]}>Sign In</Text>
          )}
        </Pressable>

        <View style={s.footer}>
          <Text style={[s.footerText, { color: colors.mutedForeground }]}>New to MovieFlix? </Text>
          <Link href="/(auth)/signup">
            <Text style={[s.footerLink, { color: colors.primary }]}>Sign up</Text>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  logo: { fontSize: 34, fontFamily: 'Inter_700Bold', marginBottom: 48, letterSpacing: -0.5 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 6 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 32 },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 14,
    borderWidth: 1,
  },
  error: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  button: { paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  buttonText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
