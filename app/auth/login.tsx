import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Stack, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ApiError, login, socialLogin } from '@/lib/api';
import { setAuthSession } from '@/lib/auth-session';

WebBrowser.maybeCompleteAuthSession();

function readExtraString(key: string) {
  const value = Constants.expoConfig?.extra?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

  const googleWebClientId = useMemo(() => readExtraString('googleWebClientId'), []);
  const googleAndroidClientId = useMemo(() => readExtraString('googleAndroidClientId'), []);
  const googleIosClientId = useMemo(() => readExtraString('googleIosClientId'), []);

  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    webClientId: googleWebClientId || 'babyoi-google-web-client-id-not-configured',
    androidClientId: googleAndroidClientId || 'babyoi-google-android-client-id-not-configured',
    iosClientId: googleIosClientId || 'babyoi-google-ios-client-id-not-configured',
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') {
      return;
    }

    const idToken = googleResponse.params.id_token;
    if (!idToken) {
      setFormError('Google không trả về mã đăng nhập.');
      setGoogleSubmitting(false);
      return;
    }

    handleGoogleLogin(idToken);
  }, [googleResponse]);

  async function handleLogin() {
    setEmailError('');
    setPasswordError('');
    setFormError('');

    try {
      setSubmitting(true);
      const response = await login({
        email: email.trim(),
        password,
      });

      await setAuthSession(response);
      router.replace('/profile/select-profile');
    } catch (error) {
      if (__DEV__) {
        console.error('[Login] Email login failed', error);
      }

      if (error instanceof ApiError) {
        if (error.errors?.email || error.errors?.password) {
          setEmailError(error.errors?.email ?? '');
          setPasswordError(error.errors?.password ?? '');
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Đăng nhập thất bại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin(idToken: string) {
    setFormError('');

    try {
      setGoogleSubmitting(true);
      const response = await socialLogin({
        provider: 'GOOGLE',
        idToken,
      });

      await setAuthSession(response);
      router.replace('/profile/select-profile');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Đăng nhập Google thất bại.');
    } finally {
      setGoogleSubmitting(false);
    }
  }

  async function startGoogleLogin() {
    setFormError('');

    const hasPlatformClientId =
      Platform.OS === 'ios'
        ? !!googleIosClientId
        : Platform.OS === 'android'
          ? !!googleAndroidClientId
          : !!googleWebClientId;

    if (!hasPlatformClientId) {
      setFormError('Chưa cấu hình Google Client ID cho nền tảng đang chạy trong app.json.');
      return;
    }

    setGoogleSubmitting(true);
    const result = await promptGoogleAsync();
    if (result.type !== 'success') {
      setGoogleSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/logo1.png')} style={styles.logo} />
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>Đăng nhập hoặc tạo tài khoản mới để vào BabyOi</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="mebau@gmail.com"
            placeholderTextColor="#b0bec5"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#b0bec5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {!!formError && !emailError && !passwordError && <Text style={styles.formErrorText}>{formError}</Text>}

        <TouchableOpacity
          style={[styles.loginButton, submitting && styles.disabledButton]}
          onPress={handleLogin}
          disabled={submitting || googleSubmitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.socialButton}
          onPress={startGoogleLogin}
          disabled={!googleRequest || googleSubmitting || submitting}
        >
          {googleSubmitting ? (
            <ActivityIndicator color="#5c7a8a" />
          ) : (
            <>
              <FontAwesome name="google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Tiếp tục với Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Tạo tài khoản</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5c7a8a',
    textAlign: 'center',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5c7a8a',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 22,
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  errorText: {
    marginTop: 8,
    marginLeft: 4,
    color: '#d64545',
    fontSize: 13,
    fontWeight: '700',
  },
  formErrorText: {
    marginBottom: 6,
    color: '#d64545',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginTop: -6,
  },
  forgotText: {
    color: '#ff8fab',
    fontSize: 14,
    fontWeight: '800',
  },
  loginButton: {
    backgroundColor: '#ff8fab',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f0d7df',
  },
  dividerText: {
    color: '#7c91a0',
    fontSize: 13,
    fontWeight: '800',
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f0d7df',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  socialButtonText: {
    color: '#5c7a8a',
    fontSize: 15,
    fontWeight: '900',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  registerText: {
    fontSize: 15,
    color: '#5c7a8a',
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ff8fab',
  },
});
