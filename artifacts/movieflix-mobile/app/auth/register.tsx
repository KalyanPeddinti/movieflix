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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useRegister } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { mutateAsync: doRegister, isPending } = useRegister();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    try {
      const result = await doRegister({ data: { name: name.trim(), email: email.trim(), password } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await login(result.token, result.user);
      router.back();
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message ?? '';
      if (message.includes('409') || message.toLowerCase().includes('email')) {
        setError('An account with this email already exists');
      } else {
        setError('Something went wrong. Please try again.');
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 34 : insets.bottom + 16;

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.container,
        { paddingTop: topPad + 20, paddingBottom: bottomPad },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
        <Ionicons name="close" size={24} color={colors.foreground} />
      </Pressable>

      <View style={styles.brandRow}>
        <Text style={[styles.brand, { color: colors.primary, fontFamily: 'Outfit_700Bold' }]}>
          MovieFlix
        </Text>
      </View>

      <Text style={[styles.heading, { color: colors.foreground, fontFamily: 'Outfit_700Bold' }]}>
        Create Account
      </Text>
      <Text style={[styles.subheading, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
        Start building your watchlist today
      </Text>

      <View style={styles.form}>
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: colors.primary }]}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.errorText, { color: colors.primary, fontFamily: 'Outfit_400Regular' }]}>
              {error}
            </Text>
          </View>
        ) : null}

        <View>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}>
            Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: colors.radius,
                fontFamily: 'Outfit_400Regular',
              },
            ]}
            placeholder="Jane Doe"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
            textContentType="name"
            autoComplete="name"
          />
        </View>

        <View>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}>
            Email
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.input,
                color: colors.foreground,
                borderColor: colors.border,
                borderRadius: colors.radius,
                fontFamily: 'Outfit_400Regular',
              },
            ]}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
        </View>

        <View>
          <Text style={[styles.label, { color: colors.foreground, fontFamily: 'Outfit_500Medium' }]}>
            Password
          </Text>
          <View style={[
            styles.passwordRow,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}>
            <TextInput
              style={[styles.passwordInput, { color: colors.foreground, fontFamily: 'Outfit_400Regular' }]}
              placeholder="Min. 8 characters"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="new-password"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleRegister}
          disabled={isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed || isPending ? 0.8 : 1,
            },
          ]}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.submitText, { fontFamily: 'Outfit_600SemiBold' }]}>Create Account</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.mutedForeground, fontFamily: 'Outfit_400Regular' }]}>
          Already have an account?{' '}
        </Text>
        <Pressable onPress={() => router.replace('/auth/login')}>
          <Text style={[styles.footerLink, { color: colors.primary, fontFamily: 'Outfit_600SemiBold' }]}>
            Sign In
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    paddingHorizontal: 24,
    gap: 16,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 28,
  },
  heading: {
    fontSize: 26,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 8,
  },
  form: {
    gap: 14,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  submitBtn: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
  },
});
