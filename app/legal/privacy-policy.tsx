import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const sections: {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    title: 'Dữ liệu BabyOi thu thập',
    body: 'BabyOi có thể thu thập thông tin tài khoản, hồ sơ mẹ và bé, ngày sinh, giới tính, ảnh hồ sơ, chỉ số sức khỏe, lịch tiêm, lịch hẹn, nhật ký, lựa chọn dinh dưỡng và thông tin thiết bị cần thiết để gửi thông báo.',
    icon: 'folder-open-outline',
    color: '#4D9DE0',
  },
  {
    title: 'Mục đích sử dụng',
    body: 'Dữ liệu được dùng để xác thực tài khoản, đồng bộ hồ sơ, vận hành các tính năng của BabyOi, cá nhân hóa nội dung, nhắc lịch, lưu thông tin mẹ và bé, hỗ trợ dinh dưỡng và xử lý yêu cầu AI do người dùng chủ động gửi.',
    icon: 'sparkles-outline',
    color: '#E56B9F',
  },
  {
    title: 'Chia sẻ và xử lý dữ liệu',
    body: 'BabyOi có thể sử dụng nhà cung cấp hạ tầng, lưu trữ ảnh, email, thông báo đẩy và dịch vụ AI để vận hành tính năng tương ứng. Chúng tôi chỉ chia sẻ dữ liệu cần thiết cho mục đích cung cấp dịch vụ và không bán thông tin cá nhân của người dùng.',
    icon: 'git-network-outline',
    color: '#FF9F43',
  },
  {
    title: 'Dữ liệu của trẻ em',
    body: 'Hồ sơ của bé do cha mẹ hoặc người giám hộ tạo và quản lý. Người dùng chịu trách nhiệm bảo đảm mình có quyền cung cấp, cập nhật và sử dụng thông tin của trẻ trên BabyOi.',
    icon: 'people-outline',
    color: '#5ABF7A',
  },
  {
    title: 'Lưu trữ và bảo mật',
    body: 'BabyOi áp dụng các biện pháp kỹ thuật phù hợp để bảo vệ phiên đăng nhập và dữ liệu khỏi truy cập trái phép. Không có phương thức truyền hoặc lưu trữ điện tử nào an toàn tuyệt đối, vì vậy người dùng cũng cần bảo vệ thiết bị và thông tin đăng nhập của mình.',
    icon: 'lock-closed-outline',
    color: '#7A70C5',
  },
  {
    title: 'Quyền kiểm soát dữ liệu',
    body: 'Người dùng có thể xem và cập nhật thông tin trong ứng dụng. Để yêu cầu hỗ trợ truy cập, chỉnh sửa hoặc xóa dữ liệu cá nhân, vui lòng gửi email tới BabyOi. Chúng tôi có thể cần xác minh danh tính trước khi xử lý yêu cầu.',
    icon: 'options-outline',
    color: '#F05F78',
  },
  {
    title: 'Xóa và lưu giữ dữ liệu',
    body: 'Khi yêu cầu xóa được xác minh, dữ liệu liên quan sẽ được xóa hoặc vô danh hóa trong phạm vi phù hợp. Một số bản ghi có thể được lưu giữ khi cần để bảo mật, giải quyết tranh chấp hoặc tuân thủ nghĩa vụ pháp lý.',
    icon: 'trash-bin-outline',
    color: '#D96969',
  },
  {
    title: 'Thông báo',
    body: 'Người dùng có thể bật hoặc tắt từng nhóm thông báo trong phần Cài đặt. Mỗi công tắc áp dụng đồng thời cho thông báo trong ứng dụng và thông báo đẩy ngoài điện thoại của nhóm tương ứng.',
    icon: 'notifications-outline',
    color: '#4D9DE0',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentMint} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.customHeader}>
          <TouchableOpacity
            onPress={() => router.replace('/setting/setting')}
            style={styles.headerButton}
            activeOpacity={0.85}
            accessibilityLabel="Quay về cài đặt"
          >
            <Ionicons name="arrow-back" size={25} color="#FF8FAB" />
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Quyền riêng tư</Text>
            <Text style={styles.headerSubtitle}>Minh bạch và an toàn dữ liệu</Text>
          </View>

          <View style={styles.headerButton}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#5ABF7A" />
          </View>
        </View>

        <LinearGradient colors={['#FFFFFF', '#FFF8FA']} style={styles.summaryBanner}>
          <View style={styles.summaryIcon}>
            <Ionicons name="heart-outline" size={23} color="#FF8FAB" />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Cam kết của BabyOi</Text>
            <Text style={styles.summaryText}>Thông tin của mẹ và bé chỉ được sử dụng để cung cấp, bảo vệ và cải thiện trải nghiệm BabyOi.</Text>
          </View>
        </LinearGradient>

        <View style={styles.policyMeta}>
          <Text style={styles.policyName}>Chính sách quyền riêng tư</Text>
          <Text style={styles.updated}>Cập nhật ngày 22/06/2026</Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <View style={[styles.sectionIcon, { backgroundColor: `${section.color}18` }]}>
              <Ionicons name={section.icon} size={20} color={section.color} />
            </View>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.body}>{section.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.contactSection}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={21} color="#FF8FAB" />
          </View>
          <View style={styles.contactCopy}>
            <Text style={styles.contactTitle}>Liên hệ BabyOi</Text>
            <Text style={styles.contactText}>motherandbaby2026@gmail.com</Text>
          </View>
        </View>

        <Text style={styles.footerText}>Chính sách có thể được cập nhật khi dịch vụ thay đổi. Ngày cập nhật mới nhất luôn được hiển thị trên trang này.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  backgroundAccentTop: {
    position: 'absolute',
    top: 62,
    left: -42,
    width: 154,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 182, 193, 0.18)',
    transform: [{ rotate: '-18deg' }],
  },
  backgroundAccentMint: {
    position: 'absolute',
    top: 500,
    right: -44,
    width: 144,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(184, 239, 207, 0.24)',
    transform: [{ rotate: '18deg' }],
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 56,
    marginBottom: 18,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 3,
  },
  headerCopy: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { textAlign: 'center', fontSize: 23, fontWeight: '900', color: '#FF8FAB' },
  headerSubtitle: { color: '#5C7A8A', fontSize: 12, fontWeight: '800', marginTop: 3 },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE5EC',
    marginBottom: 22,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEAF0',
    marginRight: 12,
  },
  summaryCopy: { flex: 1 },
  summaryTitle: { color: '#344955', fontSize: 15, fontWeight: '900', marginBottom: 3 },
  summaryText: { color: '#6E8593', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  policyMeta: { marginBottom: 12 },
  policyName: { color: '#344955', fontSize: 18, fontWeight: '900' },
  updated: { color: '#8496A2', fontSize: 12, fontWeight: '700', marginTop: 4 },
  section: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderColor: '#EDF2F5',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 16,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionCopy: { flex: 1 },
  sectionTitle: { color: '#344955', fontSize: 14, fontWeight: '900', marginBottom: 6 },
  body: { color: '#5C7180', fontSize: 13, fontWeight: '600', lineHeight: 20 },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FFE5EC',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEAF0',
    marginRight: 12,
  },
  contactCopy: { flex: 1 },
  contactTitle: { color: '#344955', fontSize: 14, fontWeight: '900' },
  contactText: { color: '#D94F7B', fontSize: 13, fontWeight: '800', marginTop: 3 },
  footerText: { color: '#8496A2', fontSize: 11, fontWeight: '700', lineHeight: 17, textAlign: 'center', paddingHorizontal: 12 },
});
