import { FontAwesome } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthShell, authStyles } from '@/components/auth/AuthShell';
import { ApiError, EMAIL_VERIFICATION_REQUIRED_CODE, login, socialLogin } from '@/lib/api';
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
    const normalizedEmail = email.trim();

    setEmailError('');
    setPasswordError('');
    setFormError('');

    try {
      setSubmitting(true);
      const response = await login({
        email: normalizedEmail,
        password,
      });

      await setAuthSession(response);
      router.replace('/profile/select-profile');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors?.code === EMAIL_VERIFICATION_REQUIRED_CODE) {
          router.replace({
            pathname: '/auth/verify-registration',
            params: {
              email: error.errors.email ?? normalizedEmail,
              message: error.message,
            },
          });
          return;
        }

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
    <AuthShell
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục theo dõi hành trình chăm sóc mẹ và bé."
    >
      <View style={authStyles.inputGroup}>
        <Text style={authStyles.label}>Email</Text>
        <TextInput
          style={authStyles.input}
          placeholder="mebau@gmail.com"
          placeholderTextColor="#AAB7C2"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        {!!emailError && <Text style={authStyles.errorText}>{emailError}</Text>}
      </View>

      <View style={authStyles.inputGroup}>
        <Text style={authStyles.label}>Mật khẩu</Text>
        <TextInput
          style={authStyles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#AAB7C2"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {!!passwordError && <Text style={authStyles.errorText}>{passwordError}</Text>}
      </View>

      <TouchableOpacity style={authStyles.forgotButton} onPress={() => router.push('/auth/forgot-password')}>
        <Text style={authStyles.linkText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {!!formError && !emailError && !passwordError && <Text style={authStyles.formErrorText}>{formError}</Text>}

      <TouchableOpacity
        style={[authStyles.primaryButton, submitting && authStyles.disabledButton]}
        onPress={handleLogin}
        disabled={submitting || googleSubmitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={authStyles.primaryButtonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <View style={authStyles.dividerRow}>
        <View style={authStyles.dividerLine} />
        <Text style={authStyles.dividerText}>hoặc</Text>
        <View style={authStyles.dividerLine} />
      </View>

      <TouchableOpacity
        style={authStyles.socialButton}
        onPress={startGoogleLogin}
        disabled={!googleRequest || googleSubmitting || submitting}
      >
        {googleSubmitting ? (
          <ActivityIndicator color="#5C7A8A" />
        ) : (
          <>
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text style={authStyles.socialButtonText}>Tiếp tục với Google</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={authStyles.promptRow}>
        <Text style={authStyles.promptText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={authStyles.promptLink}>Tạo tài khoản</Text>
        </TouchableOpacity>
      </View>
    </AuthShell>
  );
}
