import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthShell, authStyles } from '@/components/auth/AuthShell';
import { ApiError, EMAIL_VERIFICATION_REQUIRED_CODE, login } from '@/lib/api';
import { setAuthSession } from '@/lib/auth-session';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

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
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={authStyles.primaryButtonText}>Đăng nhập</Text>
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
