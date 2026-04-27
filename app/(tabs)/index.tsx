import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import { getCurrentUser } from '@/lib/api';
import { clearAuthSession, hydrateAuthSession } from '@/lib/auth-session';

export default function WelcomeScreen() {
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrapSession() {
      try {
        const savedSession = await hydrateAuthSession();

        if (!savedSession?.accessToken) {
          return;
        }

        await getCurrentUser(savedSession.accessToken);

        if (mounted) {
          router.replace('/home/home');
        }
      } catch {
        await clearAuthSession();
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    bootstrapSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff8fab" />
        <Text style={styles.loadingText}>Dang kiem tra phien dang nhap...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Image
          source={require('../../assets/images/logo1.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>BabyOi</Text>
        <Text style={styles.subtitle}>So tay suc khoe va dinh duong{'\n'}danh cho Me va Be</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.buttonText}>Bat dau ngay</Text>
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2632/2632839.png' }}
        style={styles.bottomDecoration}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fef9f3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#5c7a8a',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBox: {
    backgroundColor: '#ffffff',
    padding: 35,
    borderRadius: 35,
    alignItems: 'center',
    width: '85%',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 2,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 25,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ff8fab',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: '#5c7a8a',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#ff8fab',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 35,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: -20,
    width: 150,
    height: 150,
    opacity: 0.5,
    zIndex: 1,
  },
});
