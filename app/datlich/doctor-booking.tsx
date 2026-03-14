import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// DỮ LIỆU GIẢ LẬP
const DOCTORS = [
    { id: '1', name: 'BS. Nguyễn Văn A', age: 45, desc: 'Chuyên gia Nhi khoa với 20 năm kinh nghiệm tại BV Nhi Trung Ương.', schedule: ['08:00', '10:00', '14:00'], avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png' },
    { id: '2', name: 'BS. Lê Thị B', age: 38, desc: 'Chuyên khoa Dinh dưỡng lâm sàng, hỗ trợ tư vấn biếng ăn và tăng trưởng.', schedule: ['09:00', '11:00', '15:00'], avatar: 'https://cdn-icons-png.flaticon.com/512/219/219983.png' },
    { id: '3', name: 'BS. Trần Văn C', age: 50, desc: 'Bác sĩ chuyên khoa hô hấp, điều trị các bệnh lý tai mũi họng trẻ em.', schedule: ['08:00', '09:00', '16:00'], avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png' },
];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export default function DoctorBookingScreen() {
    const [bookingMode, setBookingMode] = useState<'time' | 'doctor' | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);

    // Lọc bác sĩ nếu chọn theo khung giờ
    const filteredDoctors = selectedTime
        ? DOCTORS.filter(doc => doc.schedule.includes(selectedTime))
        : [];

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.title}>Đặt lịch khám cho bé</Text>
            <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => router.push('/phattrien/booking-history')}
            >
                <Ionicons name="calendar-number" size={20} color="#FF8FAB" />
                <Text style={styles.historyBtnText}>Lịch đã đặt</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerTitle: "Đặt lịch bác sĩ",
                headerStyle: { backgroundColor: '#FFB6C1' },
                headerTintColor: '#FFF',
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                ),
            }} />

            <View style={styles.content}>
                {/* BƯỚC 1: CHỌN PHƯƠNG THỨC */}
                {!bookingMode && (
                    <View style={styles.modeContainer}>
                        <Text style={styles.subTitle}>Mẹ muốn tìm kiếm theo cách nào?</Text>
                        <View style={styles.modeRow}>
                            <TouchableOpacity style={styles.modeCard} onPress={() => setBookingMode('time')}>
                                <View style={[styles.modeIcon, { backgroundColor: '#A7E4F5' }]}>
                                    <Ionicons name="time" size={30} color="#FFF" />
                                </View>
                                <Text style={styles.modeText}>Theo khung giờ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modeCard} onPress={() => setBookingMode('doctor')}>
                                <View style={[styles.modeIcon, { backgroundColor: '#FFD166' }]}>
                                    <Ionicons name="person" size={30} color="#FFF" />
                                </View>
                                <Text style={styles.modeText}>Theo bác sĩ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* BƯỚC 2: NẾU CHỌN THEO KHUNG GIỜ */}
                {bookingMode === 'time' && !selectedDoctor && (
                    <View style={{ flex: 1 }}>
                        {renderHeader()}
                        <Text style={styles.label}>1. Chọn khung giờ:</Text>
                        <FlatList
                            horizontal
                            data={TIME_SLOTS}
                            keyExtractor={t => t}
                            showsHorizontalScrollIndicator={false}
                            style={{ maxHeight: 50, marginBottom: 20 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.timeSlot, selectedTime === item && styles.activeBox]}
                                    onPress={() => setSelectedTime(item)}
                                >
                                    <Text style={[styles.timeText, selectedTime === item && styles.activeText]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        {selectedTime && (
                            <>
                                <Text style={styles.label}>2. Bác sĩ sẵn sàng lúc {selectedTime}:</Text>
                                <FlatList
                                    data={filteredDoctors}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity style={styles.doctorRow} onPress={() => setSelectedDoctor(item)}>
                                            <Image source={{ uri: item.avatar }} style={styles.avatarMini} />
                                            <View>
                                                <Text style={styles.docName}>{item.name}</Text>
                                                <Text style={styles.docSub}>Kinh nghiệm: {item.age - 25} năm</Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color="#CCC" style={{ marginLeft: 'auto' }} />
                                        </TouchableOpacity>
                                    )}
                                />
                            </>
                        )}
                    </View>
                )}

                {/* BƯỚC 2: NẾU CHỌN THEO BÁC SĨ */}
                {bookingMode === 'doctor' && !selectedDoctor && (
                    <View style={{ flex: 1 }}>
                        {renderHeader()}
                        <Text style={styles.label}>Chọn bác sĩ mẹ tin tưởng:</Text>
                        <FlatList
                            data={DOCTORS}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.doctorCardLarge} onPress={() => setSelectedDoctor(item)}>
                                    <Image source={{ uri: item.avatar }} style={styles.avatarLarge} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.docName}>{item.name}</Text>
                                        <Text style={styles.docDesc} numberOfLines={2}>{item.desc}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                )}

                {/* BƯỚC 3: HIỂN THỊ THÔNG TIN CHI TIẾT VÀ CHỌN GIỜ CUỐI CÙNG */}
                {selectedDoctor && (
                    <View style={styles.detailCard}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => { setSelectedDoctor(null); setSelectedTime(null); }}>
                            <Ionicons name="close-circle" size={28} color="#FF8FAB" />
                        </TouchableOpacity>

                        <Image source={{ uri: selectedDoctor.avatar }} style={styles.avatarXl} />
                        <Text style={styles.detailName}>{selectedDoctor.name}</Text>
                        <Text style={styles.detailAge}>{selectedDoctor.age} tuổi</Text>
                        <Text style={styles.detailDesc}>{selectedDoctor.desc}</Text>

                        <View style={styles.finalSchedule}>
                            <Text style={styles.label}>Lịch trống của bác sĩ:</Text>
                            <View style={styles.timeRowFinal}>
                                {selectedDoctor.schedule.map(t => (
                                    <TouchableOpacity
                                        key={t}
                                        style={[styles.timeSlot, selectedTime === t && styles.activeBox]}
                                        onPress={() => setSelectedTime(t)}
                                    >
                                        <Text style={[styles.timeText, selectedTime === t && styles.activeText]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.bookBtn, !selectedTime && { backgroundColor: '#CCC' }]}
                            disabled={!selectedTime}
                            onPress={() => alert(`Đã đặt lịch lúc ${selectedTime} với ${selectedDoctor.name}`)}
                        >
                            <Text style={styles.bookBtnText}>Xác nhận đặt lịch</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' },
    content: { flex: 1, padding: 20 },
    headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: '900', color: '#5C7A8A' },
    subTitle: { fontSize: 16, fontWeight: '700', color: '#FF8FAB', textAlign: 'center', marginBottom: 20 },

    // Mode selection
    modeRow: { flexDirection: 'row', gap: 15 },
    modeCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 25, alignItems: 'center', elevation: 4 },
    modeIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    modeText: { fontWeight: '800', color: '#5C7A8A' },

    // List elements
    label: { fontSize: 14, fontWeight: '800', color: '#5C7A8A', marginBottom: 10 },
    timeSlot: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF', marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
    activeBox: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
    timeText: { fontWeight: '700', color: '#666' },
    activeText: { color: '#FFF' },

    doctorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 15, marginBottom: 10 },
    doctorCardLarge: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, gap: 15, alignItems: 'center' },
    avatarMini: { width: 45, height: 45, borderRadius: 22, marginRight: 12 },
    avatarLarge: { width: 60, height: 60, borderRadius: 30 },
    docName: { fontSize: 16, fontWeight: '900', color: '#333' },
    docSub: { fontSize: 12, color: '#999' },
    docDesc: { fontSize: 12, color: '#777', marginTop: 4 },

    // Detail View
    detailCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 30, padding: 25, alignItems: 'center', elevation: 10 },
    closeBtn: { position: 'absolute', top: 15, right: 15 },
    avatarXl: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
    detailName: { fontSize: 22, fontWeight: '900', color: '#333' },
    detailAge: { fontSize: 14, color: '#FF8FAB', fontWeight: '700', marginBottom: 10 },
    detailDesc: { textAlign: 'center', color: '#666', lineHeight: 20, marginBottom: 20 },
    finalSchedule: { width: '100%', marginTop: 10 },
    timeRowFinal: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    bookBtn: { backgroundColor: '#FF8FAB', width: '100%', padding: 15, borderRadius: 20, marginTop: 'auto', alignItems: 'center' },
    bookBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
    modeContainer: {
        flex: 1,
        justifyContent: 'center', // Căn giữa theo chiều dọc
        alignItems: 'center',     // Căn giữa theo chiều ngang
        paddingBottom: 50         // Đẩy lên một chút cho cân đối
    },
    historyBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#FFE5EC' },
    historyBtnText: { fontSize: 12, fontWeight: '800', color: '#FF8FAB' }
});