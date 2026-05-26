import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiError, cancelRegistration, resendRegistrationOtp, verifyRegistration } from '@/lib/api';
import { setAuthSession } from '@/lib/auth-session';

export default function VerifyRegistrationScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = useMemo(() => String(params.email ?? ''), [params.email]);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('Nhập mã 6 số đã gửi vào email của bạn.');

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Xác nhận email</Text>
        <Text style={styles.subtitle}>{message}</Text>
        <Text style={styles.emailText}>{initialEmail}</Text>

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

        {!!formError && <Text style={styles.formErrorText}>{formError}</Text>}

        <TouchableOpacity
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handleVerify}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Xác nhận</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleResend} disabled={resending}>
          <Text style={styles.secondaryButtonText}>{resending ? 'Đang gửi lại...' : 'Gửi lại mã 6 số'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleCancel} disabled={canceling}>
          <Text style={styles.dangerLink}>{canceling ? 'Đang hủy...' : 'Hủy tạo tài khoản'}</Text>
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
  inputGroup: {
    marginBottom: 18,
  },
  emailText: {
    color: '#5c7a8a',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 22,
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
  dangerLink: {
    color: '#d64545',
    fontSize: 14,
    fontWeight: '800',
  },
});
