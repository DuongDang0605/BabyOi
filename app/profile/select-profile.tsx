import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { getCurrentUser, getProfilesByUserId, ProfileResponse } from '../../lib/api';
import { getAuthSession, hydrateAuthSession } from '../../lib/auth-session';
import { getSelectedProfile, hydrateSelectedProfile, setSelectedProfile } from '../../lib/profile-session';

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3532/3532361.png';

const FALLBACK_PROFILE: ProfileResponse = {
  id: 1,
  userId: 1,
  name: 'Hồ sơ hiện tại',
  dateOfBirth: '',
  sex: 'OTHER',
  profileType: 'CHILD',
  profileCode: null,
  functionCode: null,
  imageUrl: DEFAULT_AVATAR,
  status: 1,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
};

type SelectableProfile = ProfileResponse & { avatar: string };

export default function SelectProfileScreen() {
  const [profiles, setProfiles] = useState<SelectableProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfiles() {
      try {
        setLoading(true);
        setErrorMessage(null);

        const session = getAuthSession() || await hydrateAuthSession();
        let userId = session?.userId;

        if (!userId) {
          const currentUser = await getCurrentUser();
          userId = currentUser.id;
        }

        const data = await getProfilesByUserId(userId);

        const mappedProfiles = data.map((profile) => ({
          ...profile,
          avatar: profile.imageUrl || DEFAULT_AVATAR,
        }));

        if (!mounted) {
          return;
        }

        if (mappedProfiles.length > 0) {
          const storedProfile = getSelectedProfile() || await hydrateSelectedProfile();
          setProfiles(mappedProfiles);
          setSelectedProfileId(storedProfile?.id ?? mappedProfiles[0].id);
          return;
        }

        setProfiles([
          {
            ...FALLBACK_PROFILE,
            avatar: DEFAULT_AVATAR,
          },
        ]);
        setSelectedProfileId(FALLBACK_PROFILE.id);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setErrorMessage('Không thể tải danh sách hồ sơ. Vui lòng thử lại sau.');
        setProfiles([
          {
            ...FALLBACK_PROFILE,
            avatar: DEFAULT_AVATAR,
          },
        ]);
        setSelectedProfileId(FALLBACK_PROFILE.id);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfiles();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectProfile = async (profile: SelectableProfile) => {
    await setSelectedProfile(profile);
    setSelectedProfileId(profile.id);

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#ff8fab" />
        <Text style={styles.loadingText}>Đang tải hồ sơ của bạn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#ff8fab" />
        </TouchableOpacity>
        <Text style={styles.title}>Chọn hồ sơ</Text>
        <View style={styles.backButton} />
      </View>

      <Text style={styles.subtitle}>Vui lòng chọn hồ sơ đang sử dụng để tiếp tục.</Text>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {profiles.map((profile) => {
          const isSelected = profile.id === selectedProfileId;

          return (
            <TouchableOpacity
              key={profile.id}
              style={[styles.profileCard, isSelected && styles.profileCardActive]}
              onPress={() => handleSelectProfile(profile)}
            >
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileMeta}>{profile.profileType === 'CHILD' ? 'Hồ sơ bé' : 'Hồ sơ mẹ'}</Text>
              </View>
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={isSelected ? '#ff8fab' : '#cbd5e1'}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fef9f3',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#5c7a8a',
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 55,
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff8fab',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#5c7a8a',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    backgroundColor: '#fff4f4',
    color: '#d14343',
    padding: 12,
    borderRadius: 16,
    marginBottom: 18,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#f0f4f8',
  },
  profileCardActive: {
    borderColor: '#ffb6c1',
    backgroundColor: '#fff8fb',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#334455',
  },
  profileMeta: {
    fontSize: 13,
    color: '#8899aa',
    marginTop: 4,
  },
});
