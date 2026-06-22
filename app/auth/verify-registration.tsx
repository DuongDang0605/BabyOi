import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthShell, authStyles } from '@/components/auth/AuthShell';
import { ApiError, cancelRegistration, resendRegistrationOtp, verifyRegistration } from '@/lib/api';
import { setAuthSession } from '@/lib/auth-session';

export default function VerifyRegistrationScreen() {
  const params = useLocalSearchParams<{ email?: string; message?: string }>();
  const initialEmail = useMemo(() => String(params.email ?? ''), [params.email]);
  const initialMessage = useMemo(() => {
    const value = String(params.message ?? '').trim();
    return value || 'Nhập mã 6 số đã gửi vào email của bạn.';
  }, [params.message]);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState(initialMessage);

  function normalizeCode(value: string) {
    return value.replace(/\D/g, '').slice(0, 6);
  }

  async function handleVerify() {
    setFormError('');

    if (!initialEmail.trim()) {
      setFormError('Không tìm thấy email đang tạo tài khoản.');
      return;
    }

    if (code.length !== 6) {
      setFormError('Mã xác nhận phải gồm 6 số.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await verifyRegistration({
        email: initialEmail.trim(),
        code,
      });

      await setAuthSession(response);
      router.replace('/profile/select-profile');
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Xác nhận email thất bại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setFormError('');
    setMessage('');

    if (!initialEmail.trim()) {
      setFormError('Không tìm thấy email để gửi lại mã.');
      return;
    }

    try {
      setResending(true);
      const response = await resendRegistrationOtp({ email: initialEmail.trim() });
      setMessage(`Mã mới đã được gửi. Mã có hiệu lực ${response.expiresInMinutes} phút.`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Không gửi lại được mã.');
    } finally {
      setResending(false);
    }
  }

  function handleCancel() {
    if (!initialEmail.trim()) {
      router.replace('/auth/login');
      return;
    }

    Alert.alert(
      'Hủy tạo tài khoản',
      'Tài khoản đang tạo sẽ bị xóa khỏi hệ thống. Bạn có chắc muốn hủy không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy tạo',
          style: 'destructive',
          onPress: async () => {
            setFormError('');
            try {
              setCanceling(true);
              await cancelRegistration({ email: initialEmail.trim() });
              router.replace('/auth/login');
            } catch (error) {
              setFormError(error instanceof ApiError ? error.message : 'Không hủy được tài khoản đang tạo.');
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  }

  return (
    <AuthShell
      title="Xác nhận email"
      subtitle={message}
      onBack={() => router.replace('/auth/login')}
    >
      <Text style={authStyles.emailBadge}>{initialEmail}</Text>

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

      {!!formError && <Text style={authStyles.formErrorText}>{formError}</Text>}

      <TouchableOpacity
        style={[authStyles.primaryButton, submitting && authStyles.disabledButton]}
        onPress={handleVerify}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={authStyles.primaryButtonText}>Xác nhận</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={authStyles.secondaryButton} onPress={handleResend} disabled={resending}>
        <Text style={authStyles.secondaryButtonText}>{resending ? 'Đang gửi lại...' : 'Gửi lại mã 6 số'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={authStyles.secondaryButton} onPress={handleCancel} disabled={canceling}>
        <Text style={authStyles.dangerLink}>{canceling ? 'Đang hủy...' : 'Hủy tạo tài khoản'}</Text>
      </TouchableOpacity>
    </AuthShell>
  );
}
