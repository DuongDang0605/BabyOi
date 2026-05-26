import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
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

import { ApiError, login } from '@/lib/api';
import { setAuthSession } from '@/lib/auth-session';
import { ensureCurrentUserSelectedProfile } from '@/lib/profile-session';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');

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
      await ensureCurrentUserSelectedProfile();
      router.replace('/home/home');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.errors?.email || error.errors?.password) {
          setEmailError(error.errors?.email ?? '');
          setPasswordError(error.errors?.password ?? '');
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError('Dang nhap that bai.');
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
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image source={require('../../assets/images/logo1.png')} style={styles.logo} />
          <Text style={styles.title}>Dang nhap</Text>
          <Text style={styles.subtitle}>Dang nhap hoac tao tai khoan moi de vao BabyOi</Text>
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
          <Text style={styles.label}>Mat khau</Text>
          <TextInput
            style={styles.inputRounded}
            placeholder="Nhap mat khau"
            placeholderTextColor="#b0bec5"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
        </View>

        {!!formError && !emailError && !passwordError && <Text style={styles.formErrorText}>{formError}</Text>}

        <TouchableOpacity
          style={[styles.loginButton, submitting && styles.disabledButton]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Dang nhap</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Chua co tai khoan? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Dang ky ngay</Text>
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
  baseUrl: {
    marginTop: 8,
    fontSize: 12,
    color: '#8899aa',
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
  hintBox: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5c7a8a',
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    color: '#5c7a8a',
    marginBottom: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
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
