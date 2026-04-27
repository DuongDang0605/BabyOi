import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router } from 'expo-router';

import { getCurrentUser, logout } from '@/lib/api';
import { clearAuthSession, getAccessToken, hydrateAuthSession } from '@/lib/auth-session';

type ProfileData = {
  id: number;
  userName: string;
  email: string;
  role: string | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const session = await hydrateAuthSession();
        if (!session?.accessToken) {
          router.replace('/auth/login');
          return;
        }

        const user = await getCurrentUser(session.accessToken);
        if (mounted) {
          setProfile(user);
        }
      } catch (error) {
        await clearAuthSession();
        if (mounted) {
          Alert.alert('Phien dang nhap het han', 'Vui long dang nhap lai.');
          router.replace('/auth/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      const token = getAccessToken();
      if (token) {
        await logout(token);
      }
    } catch {
    } finally {
      await clearAuthSession();
      router.replace('/auth/login');
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff8fab" />
        <Text style={styles.loadingText}>Dang tai thong tin tai khoan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Ho so', headerShadowVisible: false }} />
      <View style={styles.card}>
        <Text style={styles.title}>Thong tin tai khoan</Text>
        <Text style={styles.label}>User name</Text>
        <Text style={styles.value}>{profile?.userName ?? '-'}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile?.email ?? '-'}</Text>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{profile?.role ?? '-'}</Text>

        <TouchableOpacity
          style={[styles.logoutButton, loggingOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutButtonText}>
            {loggingOut ? 'Dang dang xuat...' : 'Dang xuat'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
    padding: 24,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    backgroundColor: '#fef9f3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#5c7a8a',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8899aa',
    marginTop: 12,
  },
  value: {
    fontSize: 17,
    color: '#334155',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 28,
    backgroundColor: '#ff8fab',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});
