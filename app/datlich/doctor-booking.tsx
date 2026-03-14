import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DOCTORS = [
    { 
        id: '1', name: 'BS. Nguyễn Văn A', age: 45, 
        address: 'Số 18, Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        price: 200000,
        desc: 'Chuyên gia Nhi khoa với 20 năm kinh nghiệm tại BV Nhi Trung Ương.', 
        schedule: ['08:00', '10:00', '14:00'], 
        avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png' 
    },
    { 
        id: '2', name: 'BS. Lê Thị B', age: 38, 
        address: 'Phòng khám KidCare, Quận 1, TP. HCM',
        price: 150000,
        desc: 'Chuyên khoa Dinh dưỡng lâm sàng, hỗ trợ tư vấn biếng ăn và tăng trưởng.', 
        schedule: ['09:00', '11:00', '15:00'], 
        avatar: 'https://cdn-icons-png.flaticon.com/512/219/219983.png' 
    },
    { 
        id: '3', name: 'BS. Trần Văn C', age: 50, 
        address: 'Số 2, Giải Phóng, Đống Đa, Hà Nội',
        price: 250000,
        desc: 'Bác sĩ chuyên khoa hô hấp, điều trị các bệnh lý tai mũi họng trẻ em.', 
        schedule: ['08:00', '09:00', '16:00'], 
        avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png' 
    },
];

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

const DATES = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
        full: d.toLocaleDateString('vi-VN'),
        day: d.getDate(),
        weekday: i === 0 ? 'H.Nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
    };
});

export default function DoctorBookingScreen() {
    const [mainTab, setMainTab] = useState<'menu' | 'booking'>('menu');
    const [bookingMode, setBookingMode] = useState<'time' | 'doctor' | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(DATES[0].full);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);

    const filteredDoctors = selectedTime ? DOCTORS.filter(doc => doc.schedule.includes(selectedTime)) : [];

    const handleBack = () => {
        if (selectedDoctor) return setSelectedDoctor(null);
        if (bookingMode) return setBookingMode(null);
        if (mainTab === 'booking') return setMainTab('menu');
        router.back();
    };

    const confirmBooking = () => {
        Alert.alert(
            "Xác nhận đặt lịch",
            `Mẹ đặt lịch vào ngày ${selectedDate} lúc ${selectedTime} với ${selectedDoctor?.name}.\n\nPhí đặt cọc: ${selectedDoctor?.price.toLocaleString()}đ`,
            [
                { text: "Hủy", style: "cancel" },
                { text: "Thanh toán cọc", onPress: () => router.push('/datlich/booking-history') }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* --- HEADER CHUẨN ĐỒNG BỘ --- */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#ff8fab" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>
                    {selectedDoctor ? "Chi Tiết Bác Sĩ" : "Đặt Lịch Bác Sĩ"}
                </Text>
                
                <View style={{ width: 45 }} />
            </View>

            <View style={styles.content}>
                {mainTab === 'menu' && (
                    <View style={styles.menuContainer}>
                        <Text style={styles.mainTitle}>Quản lý lịch hẹn</Text>
                        <TouchableOpacity style={[styles.menuBigCard, { backgroundColor: '#FF8FAB' }]} onPress={() => setMainTab('booking')}>
                            <View style={styles.menuIconBox}><Ionicons name="add-circle" size={40} color="#FFF" /></View>
                            <View>
                                <Text style={styles.menuTitle}>Đặt lịch khám mới</Text>
                                <Text style={styles.menuSub}>Tìm bác sĩ & Ngày khám phù hợp</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.menuBigCard, { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#FFB6C1' }]} onPress={() => router.push('/datlich/booking-history')}>
                            <View style={[styles.menuIconBox, { backgroundColor: '#FFB6C1' }]}><Ionicons name="calendar" size={40} color="#FFF" /></View>
                            <View>
                                <Text style={[styles.menuTitle, { color: '#FF8FAB' }]}>Lịch sử đã đặt</Text>
                                <Text style={[styles.menuSub, { color: '#5C7A8A' }]}>Kiểm tra thông tin lịch cũ</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {mainTab === 'booking' && !selectedDoctor && (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>1. Chọn ngày khám:</Text>
                        <FlatList 
                            horizontal data={DATES} keyExtractor={item => item.full}
                            showsHorizontalScrollIndicator={false} style={{ maxHeight: 70, marginBottom: 15 }}
                            renderItem={({item}) => (
                                <TouchableOpacity 
                                    style={[styles.dateCard, selectedDate === item.full && styles.activeBox]} 
                                    onPress={() => setSelectedDate(item.full)}
                                >
                                    <Text style={[styles.dateWeekday, selectedDate === item.full && styles.activeText]}>{item.weekday}</Text>
                                    <Text style={[styles.dateDay, selectedDate === item.full && styles.activeText]}>{item.day}</Text>
                                </TouchableOpacity>
                            )}
                        />

                        {!bookingMode ? (
                            <View style={styles.modeContainer}>
                                <Text style={styles.subTitle}>Mẹ muốn tìm kiếm theo:</Text>
                                <View style={styles.modeRow}>
                                    <TouchableOpacity style={styles.modeCard} onPress={() => setBookingMode('time')}>
                                        <View style={[styles.modeIcon, { backgroundColor: '#A7E4F5' }]}><Ionicons name="time" size={30} color="#FFF" /></View>
                                        <Text style={styles.modeText}>Giờ khám</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.modeCard} onPress={() => setBookingMode('doctor')}>
                                        <View style={[styles.modeIcon, { backgroundColor: '#FFD166' }]}><Ionicons name="person" size={30} color="#FFF" /></View>
                                        <Text style={styles.modeText}>Bác sĩ</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={{ flex: 1 }}>
                                {bookingMode === 'time' ? (
                                    <>
                                        <Text style={styles.label}>2. Chọn giờ:</Text>
                                        <FlatList horizontal data={TIME_SLOTS} keyExtractor={t => t} showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginBottom: 15 }}
                                            renderItem={({ item }) => (
                                                <TouchableOpacity style={[styles.timeSlot, selectedTime === item && styles.activeBox]} onPress={() => setSelectedTime(item)}>
                                                    <Text style={[styles.timeText, selectedTime === item && styles.activeText]}>{item}</Text>
                                                </TouchableOpacity>
                                            )}
                                        />
                                        {selectedTime && (
                                            <FlatList data={filteredDoctors} keyExtractor={item => item.id}
                                                renderItem={({ item }) => (
                                                    <TouchableOpacity style={styles.doctorRow} onPress={() => setSelectedDoctor(item)}>
                                                        <Image source={{ uri: item.avatar }} style={styles.avatarMini} />
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.docName}>{item.name}</Text>
                                                            <Text style={styles.docSub} numberOfLines={1}><Ionicons name="location" /> {item.address}</Text>
                                                        </View>
                                                        <Text style={styles.priceTag}>{item.price / 1000}k</Text>
                                                    </TouchableOpacity>
                                                )}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <FlatList data={DOCTORS} keyExtractor={item => item.id}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity style={styles.doctorCardLarge} onPress={() => setSelectedDoctor(item)}>
                                                <Image source={{ uri: item.avatar }} style={styles.avatarLarge} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.docName}>{item.name}</Text>
                                                    <Text style={styles.docSub}><Ionicons name="location" color="#FF8FAB" /> {item.address}</Text>
                                                    <Text style={styles.priceTagSmall}>Phí cọc: {item.price.toLocaleString()}đ</Text>
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    />
                                )}
                            </View>
                        )}
                    </View>
                )}

                {selectedDoctor && (
                    <View style={styles.detailCard}>
                        <Image source={{ uri: selectedDoctor.avatar }} style={styles.avatarXl} />
                        <Text style={styles.detailName}>{selectedDoctor.name}</Text>
                        
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <Ionicons name="cash-outline" size={20} color="#FF8FAB" />
                                <Text style={styles.infoText}>{selectedDoctor.price.toLocaleString()}đ</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Ionicons name="star" size={20} color="#FFD166" />
                                <Text style={styles.infoText}>4.9/5</Text>
                            </View>
                        </View>

                        <View style={styles.addressBox}>
                            <Ionicons name="location" size={18} color="#FF8FAB" />
                            <Text style={styles.addressText}>{selectedDoctor.address}</Text>
                        </View>

                        <Text style={styles.detailDesc}>{selectedDoctor.desc}</Text>
                        
                        <View style={styles.finalSchedule}>
                            <Text style={styles.label}>Ngày chọn: {selectedDate}</Text>
                            <Text style={styles.label}>Chọn giờ trống:</Text>
                            <View style={styles.timeRowFinal}>
                                {selectedDoctor.schedule.map(t => (
                                    <TouchableOpacity key={t} style={[styles.timeSlot, selectedTime === t && styles.activeBox]} onPress={() => setSelectedTime(t)}>
                                        <Text style={[styles.timeText, selectedTime === t && styles.activeText]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        
                        <TouchableOpacity style={[styles.bookBtn, !selectedTime && { backgroundColor: '#CCC' }]} disabled={!selectedTime} 
                            onPress={confirmBooking}>
                            <Text style={styles.bookBtnText}>Đặt lịch & Cọc ngay</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' },
    
    /* --- HEADER CHUẨN ĐỒNG BỘ --- */
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 60, // Né notch sâu
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    backButton: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: 45, 
    },
    headerTitle: {
        flex: 1, 
        textAlign: 'center',
        fontSize: 22,
        fontWeight: '900',
        color: '#ff8fab', 
        letterSpacing: 0.5,
    },

    content: { flex: 1, padding: 20 },
    
    // Menu
    menuContainer: { flex: 1, justifyContent: 'center', gap: 20 },
    mainTitle: { fontSize: 24, fontWeight: '900', color: '#5C7A8A', textAlign: 'center', marginBottom: 20 },
    menuBigCard: { flexDirection: 'row', alignItems: 'center', padding: 25, borderRadius: 30, elevation: 5, gap: 20 },
    menuIconBox: { width: 65, height: 65, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
    menuTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
    menuSub: { fontSize: 12, color: '#FFF', opacity: 0.9 },

    // Date Picker
    dateCard: { width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: '#EEE' },
    dateWeekday: { fontSize: 10, fontWeight: '700', color: '#999' },
    dateDay: { fontSize: 18, fontWeight: '900', color: '#5C7A8A' },

    // General
    label: { fontSize: 14, fontWeight: '800', color: '#5C7A8A', marginBottom: 10 },
    activeBox: { backgroundColor: '#FF8FAB', borderColor: '#FF8FAB' },
    activeText: { color: '#FFF' },
    modeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modeRow: { flexDirection: 'row', gap: 15 },
    modeCard: { flex: 1, backgroundColor: '#FFF', padding: 20, borderRadius: 25, alignItems: 'center', elevation: 3 },
    modeIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    modeText: { fontWeight: '800', color: '#5C7A8A', fontSize: 13 },
    subTitle: { fontSize: 16, fontWeight: '700', color: '#FF8FAB', marginBottom: 20 },

    // Doctor List
    doctorRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 15, marginBottom: 10, elevation: 2 },
    doctorCardLarge: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, gap: 15, alignItems: 'center', elevation: 2 },
    avatarMini: { width: 45, height: 45, borderRadius: 22, marginRight: 10 },
    avatarLarge: { width: 70, height: 70, borderRadius: 35 },
    docName: { fontSize: 16, fontWeight: '900', color: '#333' },
    docSub: { fontSize: 11, color: '#999', marginTop: 2 },
    priceTag: { fontWeight: '900', color: '#FF8FAB', fontSize: 14 },
    priceTagSmall: { fontSize: 12, fontWeight: '800', color: '#FF8FAB', marginTop: 5 },

    // Time Slots
    timeSlot: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, backgroundColor: '#FFF', marginRight: 10, borderWidth: 1, borderColor: '#EEE', marginBottom: 5 },
    timeText: { fontWeight: '700', color: '#666' },

    // Detail
    detailCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 30, padding: 20, alignItems: 'center' },
    avatarXl: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
    detailName: { fontSize: 20, fontWeight: '900', color: '#333' },
    infoRow: { flexDirection: 'row', gap: 20, marginVertical: 10 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    infoText: { fontWeight: '800', color: '#5C7A8A' },
    addressBox: { flexDirection: 'row', backgroundColor: '#FEF9F3', padding: 12, borderRadius: 15, marginVertical: 10, alignItems: 'center', width: '100%' },
    addressText: { flex: 1, fontSize: 12, color: '#666', marginLeft: 8 },
    detailDesc: { textAlign: 'center', color: '#888', fontSize: 13, lineHeight: 18, marginBottom: 15 },
    finalSchedule: { width: '100%' },
    timeRowFinal: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    bookBtn: { backgroundColor: '#FF8FAB', width: '100%', padding: 18, borderRadius: 20, marginTop: 'auto', alignItems: 'center', elevation: 4 },
    bookBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});