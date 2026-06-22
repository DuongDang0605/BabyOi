import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const sections = [
  {
    title: 'Phạm vi dịch vụ',
    body: 'BabyOi hỗ trợ cha mẹ quản lý hồ sơ mẹ và bé, lịch sinh hoạt, sức khỏe, lịch tiêm, dinh dưỡng, nhật ký và các tính năng AI hỗ trợ. Nội dung từ BabyOi chỉ mang tính tham khảo, không thay thế tư vấn y tế chuyên môn.',
  },
  {
    title: 'Tài khoản và trách nhiệm',
    body: 'Bạn chịu trách nhiệm về thông tin đăng ký, bảo mật mật khẩu và các hoạt động thực hiện từ tài khoản của mình. Không sử dụng BabyOi để cung cấp thông tin sai lệch hoặc gây ảnh hưởng đến quyền riêng tư của người khác.',
  },
  {
    title: 'Dữ liệu và nội dung',
    body: 'Bạn xác nhận có quyền cung cấp dữ liệu của bản thân và hồ sơ bé mà bạn quản lý. BabyOi xử lý dữ liệu theo Chính sách bảo mật để vận hành các tính năng đã chọn.',
  },
  {
    title: 'Tính năng AI',
    body: 'Các đề xuất từ AI dựa trên dữ liệu bạn cung cấp và chỉ nhằm hỗ trợ tham khảo. Khi bé có dấu hiệu bất thường hoặc cần chẩn đoán, hãy liên hệ bác sĩ hoặc cơ sở y tế.',
  },
  {
    title: 'Thay đổi dịch vụ',
    body: 'BabyOi có thể cập nhật tính năng hoặc điều khoản để phù hợp với việc vận hành và yêu cầu pháp lý. Những thay đổi quan trọng sẽ được công bố trong ứng dụng.',
  },
  {
    title: 'Liên hệ',
    body: 'Email hỗ trợ: motherandbaby2026@gmail.com',
  },
];

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Điều khoản dịch vụ', headerShadowVisible: false }} />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>BabyOi</Text>
        <Text style={styles.title}>Điều khoản dịch vụ</Text>
        <Text style={styles.updated}>Cập nhật lần cuối: 22/06/2026</Text>
      </View>

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
    backgroundColor: '#FEF9F3',
  },
  content: {
    padding: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: '#FF8FAB',
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
    color: '#7A8C99',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F4F8',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 18,
  },
  sectionTitle: {
    color: '#D94F7B',
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
