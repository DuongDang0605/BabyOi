import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { AlertCard } from '../../components/home/AlertCard';
import { FeatureGrid } from '../../components/home/FeatureGrid';
import { HomeHeader } from '../../components/home/HomeHeader';
import { MoreFeatures } from '../../components/home/MoreFeatures';
import { TipBox } from '../../components/home/TipBox';

const { width } = Dimensions.get('window');

const MAIN_FEATURES = [
  { id: '1', title: 'Sức khỏe', icon: require('../../assets/images/suckhoe.png') , route: '/phattrien/growth-charts' },
  { id: '2', title: 'Sổ tiêm', icon: require('../../assets/images/tiemchung.png'), route: '/lichtiem/listlichtiem' },
  { id: '3', title: 'Dinh dưỡng', icon:require('../../assets/images/doan.png'), route: '/dinhduong/listdoan' },
  { id: '4', title: 'Nhật ký', icon: require('../../assets/images/nhatki.png'), route: '/nhatki/nhatki' },
];

const MORE_FEATURES = [
  { id: '5', title: 'Cửa hàng', icon:  require('../../assets/images/shop.png'), route: '#' },
  { id: '6', title: 'Cẩm nang', icon: require('../../assets/images/camnangicon.png'), route: '/camnang/camnang' },
  { id: '7', title: 'Đặt lịch', icon: require('../../assets/images/booking.png'), route: '/datlich/doctor-booking' },
  { id: '8', title: 'Giáo trình', icon: require('../../assets/images/edu.png'), route: '/AI/lesson-list' },
];

export default function AppHomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const handleFeaturePress = (route: string) => {
    if (route !== '#') {
      router.push(route as any);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* --- Header --- */}
        <HomeHeader
          babyName="bé Ốc"
          babyAge="8 tháng tuổi"
          avatarSource={require('../../assets/images/avt.png')}
          onAvatarPress={toggleMenu}
        />

        {/* --- ALERT CARD --- */}
        <AlertCard
          title="Lịch tiêm nhắc bé"
          subtitle="Mũi Sởi đơn (Lúc 9 tháng)"
          badgeText="Còn 30 ngày nữa!"
        />

        {/* --- PHẦN 1: CHĂM SÓC BÉ --- */}
        <FeatureGrid
          title="Chăm sóc bé 🧸"
          features={MAIN_FEATURES}
          onFeaturePress={handleFeaturePress}
        />

        {/* --- PHẦN 2: TIỆN ÍCH THÊM --- */}
        <MoreFeatures
          title="Tiện ích thêm ✨"
          features={MORE_FEATURES}
          onFeaturePress={handleFeaturePress}
        />

        {/* --- TIP BOX --- */}
        <TipBox
          tip="Mẹ ơi, bé đang vào giai đoạn tập bò, mẹ nhớ che các ổ điện nhé!"
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- Floating AI Button --- */}
      <TouchableOpacity style={styles.floatingAiButton} onPress={() => router.push('/AI/chatboxAI')}>
        <View style={styles.aiSparkleContainer}>
          <Ionicons name="sparkles" size={20} color="#ff8fab" />
        </View>
        <Text style={styles.aiLabel}>Hỏi AI</Text>
      </TouchableOpacity>

      {/* --- MODAL MENU DROPDOWN KHI BẤM VÀO AVATAR --- */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <View style={styles.menuArrow} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/profile/profile'); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E8F9ED' }]}>
                    <Ionicons name="person-outline" size={18} color="#2E7D32" />
                  </View>
                  <Text style={styles.menuText}>Hồ sơ của bé</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.push('/setting/setting'); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="settings-outline" size={18} color="#2196F3" />
                  </View>
                  <Text style={styles.menuText}>Cài đặt</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { toggleMenu(); router.replace('/auth/login'); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
                    <Ionicons name="log-out-outline" size={18} color="#F44336" />
                  </View>
                  <Text style={[styles.menuText, { color: '#F44336' }]}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  scrollContainer: { paddingHorizontal: 20 },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 145, 
    paddingRight: 20,
  },
  menuContainer: {
    width: width * 0.55,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  menuArrow: {
    position: 'absolute',
    top: -8,
    right: 22,
    width: 16,
    height: 16,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5C7A8A',
  },
  menuDivider: {
    height: 1.5,
    backgroundColor: '#F0F4F8',
    marginVertical: 2,
    marginHorizontal: 10,
  },

  floatingAiButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#FFB6C1', paddingHorizontal: 20, height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', elevation: 5, shadowColor: '#FFB6C1', shadowOpacity: 0.4, shadowRadius: 8 },
  aiSparkleContainer: { backgroundColor: '#FFF', padding: 4, borderRadius: 15, marginRight: 8 },
  aiLabel: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});
