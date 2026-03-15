import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MOCK_HISTORY = [
    {
        id: '104',
        doctorName: 'BS. Lê Thị B',
        specialty: 'Dinh dưỡng',
        date: '22/03/2026',
        time: '10:00',
        address: 'Phòng khám KidCare, Quận 1, TP. HCM',
        status: 'pending',
        price: 150000,
        avatar: 'https://cdn-icons-png.flaticon.com/512/219/219983.png'
    },
    {
        id: '105',
        doctorName: 'BS. Trần Văn C',
        specialty: 'Hô hấp',
        date: '25/03/2026',
        time: '14:00',
        address: 'Số 2, Giải Phóng, Đống Đa, Hà Nội',
        status: 'pending',
        price: 250000,
        avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
    },
    {
        id: '101',
        doctorName: 'BS. Nguyễn Văn A',
        specialty: 'Nhi khoa',
        date: '20/03/2026',
        time: '08:00',
        address: 'Số 18, Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        status: 'upcoming',
        price: 200000,
        avatar: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png'
    },
    {
        id: '102',
        doctorName: 'BS. Lê Thị B',
        specialty: 'Dinh dưỡng',
        date: '10/03/2026',
        time: '15:00',
        address: 'Phòng khám KidCare, Quận 1, TP. HCM',
        status: 'completed',
        price: 150000,
        avatar: 'https://cdn-icons-png.flaticon.com/512/219/219983.png'
    }
];

type Status = 'upcoming' | 'completed' | 'cancelled' | 'pending';

export default function BookingHistoryScreen() {
    const [filter, setFilter] = useState<Status | 'all'>('all');

    const filteredData = filter === 'all' 
        ? MOCK_HISTORY 
        : MOCK_HISTORY.filter(item => item.status === filter);

    const getStatusInfo = (status: Status) => {
        switch (status) {
            case 'pending': return { text: 'Đang xử lý', color: '#FF9800', bg: '#FFF3E0', icon: 'sync-outline' };
            case 'upcoming': return { text: 'Sắp tới', color: '#4CAF50', bg: '#E8F5E9', icon: 'calendar-outline' };
            case 'completed': return { text: 'Đã khám', color: '#2196F3', bg: '#E3F2FD', icon: 'checkmark-circle-outline' };
            case 'cancelled': return { text: 'Đã hủy', color: '#F44336', bg: '#FFEBEE', icon: 'close-circle-outline' };
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_HISTORY[0] }) => {
        const status = getStatusInfo(item.status as Status);

        return (
            <View style={[styles.card, item.status === 'pending' && styles.pendingCardBorder]}>
                <View style={styles.cardHeader}>
                    <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    <View style={styles.headerInfo}>
                        <Text style={styles.doctorName}>{item.doctorName}</Text>
                        <Text style={styles.specialty}>{item.specialty}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color="#888" />
                        <Text style={styles.infoValue}>{item.date} - {item.time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="location-outline" size={16} color="#888" />
                        <Text style={styles.infoValue} numberOfLines={1}>{item.address}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    {item.status === 'pending' ? (
                        <View style={styles.pendingNotice}>
                            <Ionicons name="time-outline" size={18} color="#FF9800" />
                            <Text style={styles.pendingNoticeText}>Hệ thống đang xác nhận lịch hẹn...</Text>
                        </View>
                    ) : item.status === 'upcoming' ? (
                        <>
                            <TouchableOpacity style={styles.cancelBtn}>
                                <Text style={styles.cancelBtnText}>Hủy lịch</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.detailBtn}>
                                <Text style={styles.detailBtnText}>Chỉ đường</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity style={styles.rebookBtn}>
                            <Text style={styles.rebookBtnText}>Đặt lại lịch này</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                data={filteredData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={() => (
                    <View>
                        {/* --- HEADER CHUẨN ĐỒNG BỘ - ĐÃ ĐẨY XUỐNG NÉ CAMERA --- */}
                        <View style={styles.customHeader}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={28} color="#ff8fab" />
                            </TouchableOpacity>
                            
                            <Text style={styles.headerTitle}>Lịch Sử Đặt Lịch</Text>
                            
                            <View style={{ width: 45 }} />
                        </View>

                        {/* --- BỘ LỌC (FILTER) --- */}
                        <View style={styles.filterSection}>
                            <FlatList 
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={['all', 'pending', 'upcoming', 'completed', 'cancelled']}
                                keyExtractor={item => item}
                                renderItem={({item}) => (
                                    <TouchableOpacity 
                                        style={[styles.filterTab, filter === item && styles.activeFilterTab]}
                                        onPress={() => setFilter(item as any)}
                                    >
                                        <Text style={[styles.filterTabText, filter === item && styles.activeFilterTabText]}>
                                            {item === 'all' ? 'Tất cả' : getStatusInfo(item as Status).text}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    </View>
                )}
            />
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
        marginTop: 65, // Tăng lên 65 để né Notch sâu
        marginBottom: 15,
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

    /* --- FILTER SECTION --- */
    filterSection: { 
        paddingVertical: 15,
        marginBottom: 10
    },
    filterTab: { 
        paddingHorizontal: 18, 
        paddingVertical: 8, 
        borderRadius: 20, 
        marginLeft: 15, 
        backgroundColor: '#FFF',
        borderWidth: 1.5,
        borderColor: '#f0f4f8',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    activeFilterTab: { 
        backgroundColor: '#FF8FAB',
        borderColor: '#FF8FAB'
    },
    filterTabText: { fontSize: 13, fontWeight: '700', color: '#888' },
    activeFilterTabText: { color: '#FFF' },
    
    listContent: { paddingHorizontal: 20, paddingBottom: 40 },
    card: { 
        backgroundColor: '#FFF', 
        borderRadius: 25, 
        padding: 18, 
        marginBottom: 15, 
        elevation: 4, 
        shadowColor: '#FFB6C1', 
        shadowOpacity: 0.15,
        borderWidth: 1,
        borderColor: '#f0f4f8'
    },
    pendingCardBorder: { borderLeftWidth: 6, borderLeftColor: '#FF9800' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    avatar: { width: 55, height: 55, borderRadius: 27.5, borderWidth: 2, borderColor: '#f0f4f8' },
    headerInfo: { flex: 1, marginLeft: 15 },
    doctorName: { fontSize: 17, fontWeight: '900', color: '#333' },
    specialty: { fontSize: 12, color: '#FF8FAB', fontWeight: '800', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    statusText: { fontSize: 10, fontWeight: '900' },

    cardBody: { borderTopWidth: 1.5, borderTopColor: '#f9fafb', paddingTop: 15, gap: 10 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    infoValue: { fontSize: 13, color: '#5C7A8A', fontWeight: '700' },

    cardFooter: { 
        flexDirection: 'row', 
        marginTop: 18, 
        gap: 12, 
        borderTopWidth: 1.5, 
        borderTopColor: '#f9fafb', 
        paddingTop: 15 
    },
    pendingNotice: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
    pendingNoticeText: { color: '#FF9800', fontSize: 13, fontWeight: '800', fontStyle: 'italic' },
    
    cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 15, borderWidth: 2, borderColor: '#FFE5EC', alignItems: 'center' },
    cancelBtnText: { color: '#FF8FAB', fontWeight: '900', fontSize: 13 },
    detailBtn: { flex: 1, paddingVertical: 12, borderRadius: 15, backgroundColor: '#FF8FAB', alignItems: 'center', elevation: 3 },
    detailBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
    
    rebookBtn: { flex: 1, paddingVertical: 12, borderRadius: 15, backgroundColor: '#5C7A8A', alignItems: 'center', elevation: 3 },
    rebookBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 }
});