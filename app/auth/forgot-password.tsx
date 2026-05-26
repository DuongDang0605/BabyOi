import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiError, forgotPassword, resetPassword, verifyPasswordResetCode } from '@/lib/api';

type Step = 'email' | 'code' | 'password';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('Nhập email để tìm tài khoản BabyOi của bạn.');

  function normalizeCode(value: string) {
    return value.replace(/\D/g, '').slice(0, 6);
  }

  async function handleFindAccount() {
    setFormError('');
    setMessage('');

    if (!email.trim()) {
      setFormError('Vui lòng nhập email.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await forgotPassword({ email: email.trim() });
      setStep('code');
      setMessage(`Đã tìm thấy tài khoản. Mã xác nhận có hiệu lực ${response.expiresInMinutes} phút.`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Không tìm thấy tài khoản.');
      setMessage('Nhập email để tìm tài khoản BabyOi của bạn.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode() {
    setFormError('');

    if (code.length !== 6) {
      setFormError('Mã xác nhận phải gồm 6 số.');
      return;
    }

    try {
      setSubmitting(true);
      await verifyPasswordResetCode({
        email: email.trim(),
        code,
      });
      setStep('password');
      setMessage('Mã xác nhận hợp lệ. Vui lòng tạo mật khẩu mới.');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Mã xác nhận không hợp lệ.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetPassword() {
    setFormError('');

    if (newPassword.length < 8) {
      setFormError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (!/[A-Z]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setFormError('Mật khẩu mới cần có chữ in hoa và ký tự đặc biệt.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword({
        email: email.trim(),
        code,
        newPassword,
      });

      router.replace('/auth/login');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Đổi mật khẩu thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendCode() {
    setCode('');
    await handleFindAccount();
  }

  function renderPrimaryLabel() {
    if (step === 'email') {
      return 'Tìm tài khoản';
    }
    if (step === 'code') {
      return 'Xác nhận mã';
    }
    return 'Đổi mật khẩu';
  }

  function handlePrimaryPress() {
    if (step === 'email') {
      return handleFindAccount();
    }
    if (step === 'code') {
      return handleVerifyCode();
    }
    return handleResetPassword();
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tìm lại tài khoản</Text>
        <Text style={styles.subtitle}>{message}</Text>

        {step === 'email' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="me@gmail.com"
              placeholderTextColor="#aab7c2"
            />
          </View>
        )}

        {step !== 'email' && <Text style={styles.emailText}>{email}</Text>}

        {step === 'code' && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mã xác nhận</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={code}
              onChangeText={(value) => setCode(normalizeCode(value))}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#d8a6b6"
            />
          </View>
        )}

        {step === 'password' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Ít nhất 8 ký tự"
                placeholderTextColor="#aab7c2"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor="#aab7c2"
              />
            </View>
          </>
        )}

        {!!formError && <Text style={styles.formErrorText}>{formError}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handlePrimaryPress}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{renderPrimaryLabel()}</Text>}
        </TouchableOpacity>

        {step === 'code' && (
          <TouchableOpacity style={styles.secondaryButton} onPress={handleResendCode} disabled={submitting}>
            <Text style={styles.secondaryButtonText}>Gửi lại mã</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.mutedLink}>Quay về đăng nhập</Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5c7a8a',
    marginBottom: 28,
    textAlign: 'center',
    fontWeight: '700',
  },
  emailText: {
    color: '#5c7a8a',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 22,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5c7a8a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 22,
    fontSize: 16,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#ff8fab',
  },
  formErrorText: {
    marginBottom: 6,
    color: '#d64545',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#ff8fab',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#ff8fab',
    fontSize: 14,
    fontWeight: '800',
  },
  mutedLink: {
    color: '#5c7a8a',
    fontSize: 14,
    fontWeight: '700',
  },
});
