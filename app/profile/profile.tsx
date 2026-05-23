import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CustomHeader } from '../../components/common/CustomHeader';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { StatCard } from '../../components/profile/StatCard';
import { ProfileResponse } from '../../lib/api';
import { clearAuthSession } from '../../lib/auth-session';
import { clearSelectedProfile, getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadProfile() {
      const selected = getSelectedProfile() || await hydrateSelectedProfile();
      if (mounted) {
        setProfile(selected);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []));

  const menuOptions = [
    { id: '1', title: 'Sổ tiêm chủng', icon: 'shield-checkmark-outline', color: '#4CAF50', route: '/lichtiem/listlichtiem' },
    { id: '2', title: 'Lịch sử sức khỏe', icon: 'pulse-outline', color: '#2196F3', route: '/phattrien/health-history' },
    { id: '3', title: 'Nhật ký khoảnh khắc', icon: 'book-outline', color: '#FF9800', route: '/nhatki/nhatki' },
    { id: '4', title: 'Cài đặt tài khoản', icon: 'settings-outline', color: '#7a8c99', route: '/setting/setting' },
  ];

  const displayName = profile?.name || 'Chưa chọn hồ sơ';
  const displayDob = profile?.dateOfBirth || 'Chưa có ngày sinh';
  const displayGender = profile?.sex === 'MALE' ? 'Nam' : profile?.sex === 'FEMALE' ? 'Nữ' : 'Khác';
  const displayAvatar = profile?.imageUrl ? { uri: profile.imageUrl } : require('../../assets/images/avt.png');

  const handleLogout = async () => {
    await clearSelectedProfile();
    await clearAuthSession();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <CustomHeader
        title="Hồ Sơ Của Bé"
        rightElement={
          <TouchableOpacity onPress={() => router.push('/setting/setting')}>
            <Ionicons name="settings-outline" size={24} color="#ff8fab" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- THÔNG TIN CƠ BẢN --- */}
        <ProfileInfo
          name={displayName}
          dob={displayDob}
          gender={displayGender}
          avatarSource={displayAvatar}
          onEditPress={() => router.push('/profile/select-profile')}
        />

        {/* --- THỐNG KÊ NHANH --- */}
        <View style={styles.statsRow}>
          <StatCard
            label="Cân nặng"
            value="-"
            icon="speedometer-outline"
            color="#FF8FAB"
          />
          <StatCard
            label="Chiều cao"
            value="-"
            icon="resize-outline"
            color="#FFD166"
          />
        </View>
        <View style={[styles.statsRow, { marginTop: 15 }]}>
          <StatCard
            label="Mũi đã tiêm"
            value="-"
            icon="checkmark-circle-outline"
            color="#4CAF50"
          />
          <StatCard
            label="BMI"
            value="16.4"
            icon="bar-chart-outline"
            color="#A7E4F5"
          />
        </View>

        {/* --- DANH SÁCH TÙY CHỌN --- */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tiện ích & Quản lý</Text>
          {menuOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* --- NÚT ĐĂNG XUẤT --- */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  menuSection: {
    marginTop: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5C7A8A',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#334455',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 15,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F44336',
  },
});
