import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QRExportScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* =========================================
          HEADER CHUẨN (ĐỒNG BỘ TRANG LỊCH SỬ)
      ========================================= */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#ff8fab" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hồ Sơ Y Tế Của Ốc</Text>
                <View style={{ width: 45 }} />
            </View>

            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>

                {/* --- KHU VỰC HIỂN THỊ MÃ QR --- */}
                <View style={styles.qrCard}>
                    <Text style={styles.qrTitle}>Đưa mã này cho Bác sĩ</Text>
                    <Text style={styles.qrSubtitle}>Phòng khám đối tác sẽ quét mã để truy xuất bệnh án</Text>

                    <View style={styles.qrFrame}>
                        {/* Dùng API tạo QR thật để Demo trông uy tín */}
                        <Image
                            source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BabyOi_Medical_Record_Oc' }}
                            style={styles.qrImage}
                        />
                    </View>
                    <Text style={styles.qrCodeText}>ID: BBOI-9823-OCT</Text>
                </View>

                {/* --- GIẢI THÍCH AI ĐÃ LỌC GÌ --- */}
                <View style={styles.aiAlertBox}>
                    <Ionicons name="sparkles" size={20} color="#2196F3" style={{ marginRight: 10, marginTop: 2 }} />
                    <Text style={styles.aiAlertText}>
                        AI đã tự động lọc <Text style={{ fontWeight: 'bold' }}>2 đợt bệnh Cần chú ý</Text> trong 1 tuần qua để đóng gói vào mã QR này.
                    </Text>
                </View>

                {/* --- DANH SÁCH BỆNH ÁN ĐƯỢC ĐÓNG GÓI (GIỐNG HỆT TRANG LỊCH SỬ) --- */}
                <Text style={styles.sectionTitle}>Dữ liệu được chia sẻ:</Text>

                {/* Bệnh 1 */}
                <View style={styles.illnessCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.nameGroup}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="medkit" size={18} color="#FFD166" />
                            </View>
                            <Text style={styles.illnessName}>Sốt mọc răng</Text>
                        </View>
                        <Text style={styles.monthLabel}>02/2024</Text>
                    </View>

                    <View style={styles.timeBox}>
                        <View style={styles.timeLine}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.timeText}>Từ: <Text style={styles.timeBold}>15/02/2024</Text></Text>
                            <Ionicons name="arrow-forward" size={12} color="#CCC" style={{ marginHorizontal: 5 }} />
                            <Text style={styles.timeText}>Đến: <Text style={styles.timeBold}>17/02/2024</Text></Text>
                        </View>
                    </View>

                    <View style={styles.descContainer}>
                        <Text style={styles.descText} numberOfLines={2}>
                            <Text style={styles.descTitle}>Ghi chú: </Text>Sốt cao 38.5 độ, lợi sưng đỏ. Đã dùng Hapacol 150mg.
                        </Text>
                    </View>

                    {/* Badge chân trang riêng cho trang QR */}
                    <View style={styles.badgeFooter}>
                        <View style={styles.severityBadge}>
                            <Text style={styles.severityText}>Cần chú ý</Text>
                        </View>
                    </View>
                </View>

                {/* Bệnh 2 */}
                <View style={styles.illnessCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.nameGroup}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="medkit" size={18} color="#FFD166" />
                            </View>
                            <Text style={styles.illnessName}>Rối loạn tiêu hóa</Text>
                        </View>
                        <Text style={styles.monthLabel}>03/2024</Text>
                    </View>

                    <View style={styles.timeBox}>
                        <View style={styles.timeLine}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.timeText}>Từ: <Text style={styles.timeBold}>10/03/2024</Text></Text>
                            <Ionicons name="arrow-forward" size={12} color="#CCC" style={{ marginHorizontal: 5 }} />
                            <Text style={styles.timeText}>Đến: <Text style={styles.timeBold}>12/03/2024</Text></Text>
                        </View>
                    </View>

                    <View style={styles.descContainer}>
                        <Text style={styles.descText} numberOfLines={2}>
                            <Text style={styles.descTitle}>Ghi chú: </Text>Đi ngoài phân lỏng nhiều lần khi ăn dặm tôm. Nghi dị ứng.
                        </Text>
                    </View>

                    <View style={styles.badgeFooter}>
                        <View style={[styles.severityBadge, { backgroundColor: '#FFF9EB', borderColor: '#FFD166' }]}>
                            <Text style={[styles.severityText, { color: '#FF9800' }]}>Nghi dị ứng</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' }, // Màu nền chuẩn
    scrollArea: {
        paddingHorizontal: 20 /* Chỉ padding 2 bên, không padding top để tránh đè Header */
    },
    /* =========================================
       STYLE HEADER CHUẨN (ĐỒNG BỘ 100%)
    ========================================= */
    /* --- HEADER CHUẨN --- */
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 60, /* Tăng từ 40 lên 60 để bù trừ padding top */
        marginBottom: 25,
        paddingHorizontal: 20 /* Bù lề trái phải cho Header */
    }, backButton: { justifyContent: 'center', alignItems: 'flex-start', paddingVertical: 5, width: 45 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: '900', color: '#ff8fab', letterSpacing: 0.5 },

    /* --- QR CARD --- */
    qrCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 30, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, marginBottom: 25 },
    qrTitle: { fontSize: 20, fontWeight: '900', color: '#333', marginBottom: 8, textAlign: 'center' },
    qrSubtitle: { fontSize: 14, color: '#8899AA', textAlign: 'center', marginBottom: 25, paddingHorizontal: 15, lineHeight: 20 },
    qrFrame: { padding: 20, backgroundColor: '#FFF', borderRadius: 25, borderWidth: 2, borderColor: '#F0F4F8', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    qrImage: { width: 200, height: 200 },
    qrCodeText: { marginTop: 20, fontSize: 15, fontWeight: '900', color: '#2196F3', letterSpacing: 2 },

    aiAlertBox: { flexDirection: 'row', backgroundColor: '#E3F2FD', padding: 18, borderRadius: 18, alignItems: 'flex-start', marginBottom: 25, borderWidth: 1, borderColor: '#BBDEFB' },
    aiAlertText: { flex: 1, fontSize: 14, color: '#1565C0', lineHeight: 22, fontWeight: '600' },

    sectionTitle: { fontSize: 18, fontWeight: '900', color: '#5C7A8A', marginBottom: 15, marginLeft: 5 },

    /* =========================================
       STYLE THẺ BỆNH ÁN (GIỮ NGUYÊN CSS GỐC)
    ========================================= */
    illnessCard: { backgroundColor: '#FFF', borderRadius: 22, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, borderWidth: 1, borderColor: '#FFF0F3' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    nameGroup: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    iconCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF9EB', justifyContent: 'center', alignItems: 'center' },
    illnessName: { fontSize: 16, fontWeight: '800', color: '#333', flex: 1 },
    monthLabel: { fontSize: 11, color: '#AAA', fontWeight: '700' },
    timeBox: { backgroundColor: '#FDFDFD', padding: 8, borderRadius: 10, marginBottom: 10 },
    timeLine: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    timeText: { fontSize: 12, color: '#777' },
    timeBold: { fontWeight: '700', color: '#5C7A8A' },
    descContainer: { marginBottom: 12 },
    descTitle: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' },
    descText: { fontSize: 13, color: '#666', lineHeight: 18 },

    /* --- BADGE DÀNH RIÊNG CHO CHÂN TRANG QR --- */
    badgeFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
    severityBadge: { backgroundColor: '#FFF0F5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#FFB6C1' },
    severityText: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' },
});