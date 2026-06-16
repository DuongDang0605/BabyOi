import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sections = [
  {
    title: 'Dữ liệu BabyOi thu thập',
    body: 'BabyOi có thể thu thập email, tên tài khoản, hồ sơ mẹ/bé, ngày sinh, giới tính, ảnh hồ sơ, nhật ký, chỉ số sức khỏe, lịch tiêm, tùy chọn món ăn và thiết bị nhận thông báo.',
  },
  {
    title: 'Mục đích sử dụng',
    body: 'Dữ liệu được dùng để đăng nhập, đồng bộ hồ sơ, cá nhân hóa nội dung, nhắc lịch, lưu nhật ký, đề xuất dinh dưỡng và hỗ trợ các tính năng AI khi mẹ chủ động yêu cầu.',
  },
  {
    title: 'Bên xử lý dữ liệu',
    body: 'BabyOi có thể dùng nhà cung cấp hạ tầng, email, lưu trữ ảnh, thông báo đẩy và dịch vụ AI để vận hành tính năng. Dữ liệu chỉ được gửi khi cần cho tính năng tương ứng.',
  },
  {
    title: 'Bảo mật',
    body: 'BabyOi sử dụng xác thực bằng token, lưu phiên đăng nhập an toàn trên thiết bị và yêu cầu cấu hình máy chủ production an toàn trước khi phát hành công khai.',
  },
  {
    title: 'Xóa dữ liệu',
    body: 'Mẹ có thể xóa tài khoản trong ứng dụng tại Cài đặt > Tài khoản > Xóa tài khoản. Sau khi xóa, phiên đăng nhập, thiết bị nhận thông báo và dữ liệu định danh tài khoản sẽ bị hủy hoặc ẩn khỏi trải nghiệm BabyOi.',
  },
  {
    title: 'Liên hệ',
    body: 'Email hỗ trợ: motherandbaby2026@gmail.com',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Chính sách quyền riêng tư', headerShadowVisible: false }} />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BabyOi</Text>
        <Text style={styles.title}>Chính sách quyền riêng tư</Text>
        <Text style={styles.updated}>Cập nhật lần cuối: 16/06/2026</Text>
      </View>

      <Text style={styles.intro}>
        BabyOi giúp cha mẹ quản lý hồ sơ mẹ và bé, lịch tiêm, sức khỏe, dinh dưỡng, nhật ký và thông báo nhắc lịch.
      </Text>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: '#ff8fab',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: '#344955',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  updated: {
    color: '#7a8c99',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  intro: {
    color: '#5c7a8a',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 18,
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f4f8',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },
  sectionTitle: {
    color: '#d94f7b',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  body: {
    color: '#344955',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
});
