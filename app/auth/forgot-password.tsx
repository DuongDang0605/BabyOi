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

  const steps: { id: Step; label: string }[] = [
    { id: 'email', label: 'Email' },
    { id: 'code', label: 'Mã OTP' },
    { id: 'password', label: 'Mật khẩu' },
  ];

  return (
    <AuthShell
      title="Tìm lại tài khoản"
      subtitle={message}
      onBack={() => router.replace('/auth/login')}
    >
      <View style={authStyles.stepRow}>
        {steps.map((item) => {
          const active = item.id === step;
          return (
            <View key={item.id} style={[authStyles.stepChip, active && authStyles.stepChipActive]}>
              <Text style={[authStyles.stepText, active && authStyles.stepTextActive]}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      {step === 'email' && (
        <View style={authStyles.inputGroup}>
          <Text style={authStyles.label}>Email</Text>
          <TextInput
            style={authStyles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="me@gmail.com"
            placeholderTextColor="#AAB7C2"
          />
        </View>
      )}

      {step !== 'email' && <Text style={authStyles.emailBadge}>{email}</Text>}

      {step === 'code' && (
        <View style={authStyles.inputGroup}>
          <Text style={authStyles.label}>Mã xác nhận</Text>
          <TextInput
            style={[authStyles.input, authStyles.otpInput]}
            value={code}
            onChangeText={(value) => setCode(normalizeCode(value))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#D8A6B6"
          />
        </View>
      )}

      {step === 'password' && (
        <>
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Mật khẩu mới</Text>
            <TextInput
              style={authStyles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="Ít nhất 8 ký tự"
              placeholderTextColor="#AAB7C2"
            />
          </View>

          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={authStyles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#AAB7C2"
            />
          </View>
        </>
      )}

      {!!formError && <Text style={authStyles.formErrorText}>{formError}</Text>}

      <TouchableOpacity
        style={[authStyles.primaryButton, submitting && authStyles.disabledButton]}
        onPress={handlePrimaryPress}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={authStyles.primaryButtonText}>{renderPrimaryLabel()}</Text>}
      </TouchableOpacity>

      {step === 'code' && (
        <TouchableOpacity style={authStyles.secondaryButton} onPress={handleResendCode} disabled={submitting}>
          <Text style={authStyles.secondaryButtonText}>Gửi lại mã</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={authStyles.secondaryButton} onPress={() => router.replace('/auth/login')}>
        <Text style={authStyles.mutedLink}>Quay về đăng nhập</Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
