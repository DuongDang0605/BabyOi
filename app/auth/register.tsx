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
  const [formError, setFormError] = useState('');

  async function handleRegister() {
    setUserNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setFormError('');

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: 'Tạo tài khoản', headerShadowVisible: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tạo tài khoản BabyOi</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên người dùng</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="none"
            placeholder="Tên của mẹ"
            placeholderTextColor="#aab7c2"
          />
          {!!userNameError && <Text style={styles.errorText}>{userNameError}</Text>}
        </View>

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
          {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Ít nhất 8 ký tự"
            placeholderTextColor="#aab7c2"
          />
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#aab7c2"
          />
          {!!confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}
        </View>

        {!!formError && !userNameError && !emailError && !passwordError && !confirmPasswordError && (
          <Text style={styles.formErrorText}>{formError}</Text>
        )}

        <TouchableOpacity
          style={[styles.primaryButton, submitting && styles.disabledButton]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Tạo tài khoản</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.secondaryButtonText}>Đã có tài khoản? Đăng nhập</Text>
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
    fontSize: 28,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#5c7a8a',
    marginBottom: 28,
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
  errorText: {
    marginTop: 8,
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
    color: '#5c7a8a',
    fontSize: 14,
    fontWeight: '700',
  },
});
