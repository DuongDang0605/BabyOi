import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// DỮ LIỆU ĐÃ CẬP NHẬT THÊM TRẠNG THÁI "PENDING" (ĐANG XỬ LÝ)
const MOCK_HISTORY = [
    {
        id: '104',
        doctorName: 'BS. Lê Thị B',
        specialty: 'Dinh dưỡng',
        date: '22/03/2026',
        time: '10:00',
        address: 'Phòng khám KidCare, Quận 1, TP. HCM',
        status: 'pending', // Đang xử lý
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
        status: 'pending', // Đang xử lý
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

// Định nghĩa kiểu dữ liệu trạng thái bao gồm cả 'pending'
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
                            <Text style={styles.pendingNoticeText}>Hệ thống đang xác nhận lịch hẹn của mẹ...</Text>
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
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{
                headerTitle: "Lịch sử đặt lịch",
                headerStyle: { backgroundColor: '#FFB6C1' },
                headerTintColor: '#FFF',
            }} />

            <View style={styles.filterContainer}>
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
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                />
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' },
    filterContainer: { backgroundColor: '#FFF', paddingVertical: 12 },
    filterTab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#F5F5F5' },
    activeFilterTab: { backgroundColor: '#FF8FAB' },
    filterTabText: { fontSize: 13, fontWeight: '700', color: '#888' },
    activeFilterTabText: { color: '#FFF' },
    
    listContent: { padding: 15 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, elevation: 3 },
    pendingCardBorder: { borderLeftWidth: 5, borderLeftColor: '#FF9800' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    headerInfo: { flex: 1, marginLeft: 12 },
    doctorName: { fontSize: 16, fontWeight: '900', color: '#333' },
    specialty: { fontSize: 12, color: '#FF8FAB', fontWeight: '700' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: '800' },

    cardBody: { borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12, gap: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoValue: { fontSize: 13, color: '#5C7A8A', fontWeight: '600' },

    cardFooter: { flexDirection: 'row', marginTop: 15, gap: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12 },
    pendingNotice: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
    pendingNoticeText: { color: '#FF9800', fontSize: 12, fontWeight: '700', fontStyle: 'italic' },
    
    cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FFB6C1', alignItems: 'center' },
    cancelBtnText: { color: '#FF8FAB', fontWeight: '800', fontSize: 13 },
    detailBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#FF8FAB', alignItems: 'center' },
    detailBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
    
    rebookBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#5C7A8A', alignItems: 'center' },
    rebookBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 }
});