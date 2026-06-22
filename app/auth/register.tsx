import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthShell, authStyles } from '@/components/auth/AuthShell';
import { ApiError, register } from '@/lib/api';

export default function RegisterScreen() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userNameError, setUserNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [formError, setFormError] = useState('');

  async function handleRegister() {
    setUserNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    setFormError('');

    if (!acceptedTerms) {
      setTermsError('Vui lòng đồng ý với Điều khoản dịch vụ trước khi tạo tài khoản.');
      return;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await register({
        userName: userName.trim(),
        email: email.trim(),
        password,
      });

      router.push({
        pathname: '/auth/verify-registration',
        params: {
          email: response.email,
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setUserNameError(error.errors?.userName ?? '');
        setEmailError(error.errors?.email ?? '');
        setPasswordError(error.errors?.password ?? '');
        setFormError(error.message);
      } else {
        setFormError('Tạo tài khoản thất bại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Bắt đầu với một tài khoản BabyOi để lưu hồ sơ và theo dõi chăm sóc hằng ngày."
      onBack={() => router.replace('/auth/login')}
    >
      <View style={authStyles.inputGroup}>
        <Text style={authStyles.label}>Tên người dùng</Text>
        <TextInput
          style={authStyles.input}
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
          placeholder="Tên của mẹ"
          placeholderTextColor="#AAB7C2"
        />
        {!!userNameError && <Text style={authStyles.errorText}>{userNameError}</Text>}
      </View>

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
        {!!emailError && <Text style={authStyles.errorText}>{emailError}</Text>}
      </View>

      <View style={authStyles.inputGroup}>
        <Text style={authStyles.label}>Mật khẩu</Text>
        <TextInput
          style={authStyles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Ít nhất 8 ký tự"
          placeholderTextColor="#AAB7C2"
        />
        {!!passwordError && <Text style={authStyles.errorText}>{passwordError}</Text>}
      </View>

      <View style={authStyles.inputGroup}>
        <Text style={authStyles.label}>Xác nhận mật khẩu</Text>
        <TextInput
          style={authStyles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#AAB7C2"
        />
        {!!confirmPasswordError && <Text style={authStyles.errorText}>{confirmPasswordError}</Text>}
      </View>

      <View style={styles.termsRow}>
        <TouchableOpacity
          accessibilityLabel="Đồng ý Điều khoản dịch vụ"
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acceptedTerms }}
          activeOpacity={0.82}
          hitSlop={8}
          onPress={() => {
            setAcceptedTerms((current) => !current);
            setTermsError('');
          }}
          style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
        >
          {acceptedTerms && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </TouchableOpacity>
        <View style={styles.termsContent}>
          <Text style={styles.termsText}>Tôi đã đọc và đồng ý với</Text>
          <View style={styles.termsLinkRow}>
            <TouchableOpacity onPress={() => router.push('/legal/terms-of-service' as any)}>
              <Text style={styles.termsLink}>Điều khoản dịch vụ</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}> và </Text>
            <TouchableOpacity onPress={() => router.push('/legal/privacy-policy' as any)}>
              <Text style={styles.termsLink}>Chính sách bảo mật</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>.</Text>
          </View>
        </View>
      </View>
      {!!termsError && <Text style={authStyles.errorText}>{termsError}</Text>}

      {!!formError && !userNameError && !emailError && !passwordError && !confirmPasswordError && !termsError && (
        <Text style={authStyles.formErrorText}>{formError}</Text>
      )}

      <TouchableOpacity
        style={[authStyles.primaryButton, submitting && authStyles.disabledButton]}
        onPress={handleRegister}
        disabled={submitting}
      >
        {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={authStyles.primaryButtonText}>Tạo tài khoản</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={authStyles.secondaryButton} onPress={() => router.replace('/auth/login')}>
        <Text style={authStyles.mutedLink}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  termsRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    marginTop: 2,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FF9DB8',
    borderRadius: 5,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: '#FF6F9B',
    borderColor: '#FF6F9B',
  },
  termsText: {
    color: '#5C7A8A',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  termsContent: {
    flex: 1,
  },
  termsLinkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsLink: {
    color: '#FF6F9B',
    fontWeight: '900',
  },
});
