import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { CustomHeader } from '../../components/common/CustomHeader';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { StatCard } from '../../components/profile/StatCard';

export default function ProfileScreen() {
  const babyData = {
    name: "Bé Ốc (Gia Bảo)",
    dob: "01/07/2025",
    gender: "Nam",
    avatar: require('../../assets/images/avt.png'),
    weight: 8.5,
    height: 72,
    vaccineDone: 4,
  };

  const menuOptions = [
    { id: '1', title: 'Sổ tiêm chủng', icon: 'shield-checkmark-outline', color: '#4CAF50', route: '/lichtiem/listlichtiem' },
    { id: '2', title: 'Lịch sử sức khỏe', icon: 'pulse-outline', color: '#2196F3', route: '/phattrien/health-history' },
    { id: '3', title: 'Nhật ký khoảnh khắc', icon: 'book-outline', color: '#FF9800', route: '/nhatki/nhatki' },
    { id: '4', title: 'Cài đặt tài khoản', icon: 'settings-outline', color: '#7a8c99', route: '/setting/setting' },
  ];

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
          name={babyData.name}
          dob={babyData.dob}
          gender={babyData.gender}
          avatarSource={babyData.avatar}
          onEditPress={() => console.log("Edit Avatar")}
        />

        {/* --- THỐNG KÊ NHANH --- */}
        <View style={styles.statsRow}>
          <StatCard
            label="Cân nặng"
            value={`${babyData.weight}kg`}
            icon="speedometer-outline"
            color="#FF8FAB"
          />
          <StatCard
            label="Chiều cao"
            value={`${babyData.height}cm`}
            icon="resize-outline"
            color="#FFD166"
          />
        </View>
        <View style={[styles.statsRow, { marginTop: 15 }]}>
          <StatCard
            label="Mũi đã tiêm"
            value={babyData.vaccineDone}
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
          onPress={() => router.replace('/auth/login')}
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
