import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCurrentUser } from '@/lib/api';
import { clearAuthSession, hydrateAuthSession } from '@/lib/auth-session';
import { ensureCurrentUserSelectedProfile } from '@/lib/profile-session';

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

        await getCurrentUser();
        await ensureCurrentUserSelectedProfile();

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
        <ActivityIndicator size="large" color="#FF8FAB" />
        <Text style={styles.loadingText}>Đang kiểm tra phiên đăng nhập...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FEF9F3', '#FFF4F8', '#EFFBFF']} style={styles.screenGradient}>
        <LinearGradient colors={['#FFEEF4', '#E9F8FD', '#F2FFF7']} style={styles.headerBand} />
        <View style={[styles.accentBar, styles.accentBarPink]} />
        <View style={[styles.accentBar, styles.accentBarBlue]} />
        <View style={[styles.accentBar, styles.accentBarYellow]} />

        <View style={styles.content}>
          <View style={styles.iconRail}>
            <View style={[styles.iconTile, styles.iconTilePink]}>
              <Ionicons name="heart" size={19} color="#FF6F9B" />
            </View>
            <View style={[styles.iconTile, styles.iconTileYellow]}>
              <Ionicons name="sparkles" size={19} color="#D99A00" />
            </View>
            <View style={[styles.iconTile, styles.iconTileBlue]}>
              <Ionicons name="calendar" size={18} color="#45B8D8" />
            </View>
          </View>

          <LinearGradient colors={['#FFFFFF', '#FFF2F7', '#EFFBFF']} style={styles.logoFrame}>
            <View style={styles.logoSparkle}>
              <Ionicons name="sparkles-outline" size={18} color="#FFD166" />
            </View>
            <Image
              source={require('../../assets/images/logo1.png')}
              style={styles.logo}
            />
          </LinearGradient>
        <Text style={styles.title}>BabyOi</Text>
        <Text style={styles.subtitle}>Chăm sóc mẹ và bé nhẹ nhàng hơn mỗi ngày.</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/auth/login')}
        >
          <LinearGradient colors={['#FF6F9B', '#FF8FAB', '#FFD166']} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>Bắt đầu ngay</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.secondaryButtonText}>Tạo tài khoản mới</Text>
        </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FEF9F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#5C7A8A',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  screenGradient: {
    flex: 1,
  },
  headerBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 42,
  },
  accentBar: {
    position: 'absolute',
    borderRadius: 999,
  },
  accentBarPink: {
    top: 74,
    left: 24,
    width: 96,
    height: 12,
    backgroundColor: '#FFB6C1',
    transform: [{ rotate: '-9deg' }],
  },
  accentBarBlue: {
    top: 128,
    right: 18,
    width: 118,
    height: 12,
    backgroundColor: '#A7E4F5',
    transform: [{ rotate: '8deg' }],
  },
  accentBarYellow: {
    top: 196,
    left: 58,
    width: 70,
    height: 10,
    backgroundColor: '#FFD166',
    transform: [{ rotate: '7deg' }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  iconRail: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  iconTile: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    height: 42,
    justifyContent: 'center',
    shadowColor: '#FFB6C1',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: 42,
    elevation: 3,
  },
  iconTilePink: { backgroundColor: '#FFF1F6' },
  iconTileYellow: { backgroundColor: '#FFF4D6' },
  iconTileBlue: { backgroundColor: '#EFFBFF' },
  logoFrame: {
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderRadius: 38,
    borderWidth: 3,
    height: 164,
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#FF8FAB',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    width: 164,
    elevation: 8,
  },
  logoSparkle: {
    position: 'absolute',
    right: -8,
    top: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 7,
  },
  logo: {
    width: 124,
    height: 124,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#334455',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5C7A8A',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 30,
    maxWidth: 280,
  },
  button: {
    borderRadius: 24,
    width: '92%',
    overflow: 'hidden',
    shadowColor: '#FF8FAB',
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 7,
  },
  buttonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 58,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: '#DDF5FB',
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 12,
    width: '92%',
  },
  secondaryButtonText: {
    color: '#5C7A8A',
    fontSize: 15,
    fontWeight: '900',
  },
});
