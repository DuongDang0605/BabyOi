import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert
} from 'react-native';

export default function EduCoachingScreen() {
    // Biến lưu câu trả lời của mẹ (null = chưa chọn, true = đạt, false = chưa đạt)
    const [q1, setQ1] = useState<boolean | null>(null);
    const [q2, setQ2] = useState<boolean | null>(null);
    const [q3, setQ3] = useState<boolean | null>(null);

    // Biến quản lý hiệu ứng AI (Màn hình chờ)
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingText, setLoadingText] = useState('Đang khởi tạo mô hình AI...');

    // Xử lý khi bấm nút "Yêu cầu AI Phân tích"
    const handleAnalyze = () => {
        // 1. Kiểm tra mẹ đã trả lời đủ chưa
        if (q1 === null || q2 === null || q3 === null) {
            Alert.alert("BabyOi thông báo", "Mẹ vui lòng trả lời đủ 3 câu hỏi để AI phân tích chính xác nhất nhé!");
            return;
        }

        // 2. Bật màn hình Loading AI
        setIsAnalyzing(true);

        // 3. Giả lập AI đang suy nghĩ qua các bước (hiệu ứng "khè" VCs)
        setTimeout(() => setLoadingText('Đang phân tích lịch sử học tập 2 tuần qua...'), 800);
        setTimeout(() => setLoadingText('Đang đối chiếu ghi chú khó khăn ở bài Tummy Time...'), 1800);
        setTimeout(() => setLoadingText('Đang tổng hợp với tín hiệu hiện tại để ra quyết định...'), 2800);
        setTimeout(() => setLoadingText('Đang trích xuất biểu đồ cân nặng 3 tháng qua...'), 800);
        setTimeout(() => setLoadingText('Đang đối chiếu với chuẩn phát triển WHO...'), 1800);
        setTimeout(() => setLoadingText('Đang tạo báo cáo cá nhân hóa cho Ốc...'), 2800);

        // 4. Quyết định rẽ nhánh và chuyển trang sau 3.5 giây
        setTimeout(() => {
            setIsAnalyzing(false); // Tắt loading

            // Nếu đạt cả 3 câu -> Vào kịch bản A (Sẵn sàng)
            if (q1 && q2 && q3) {
                router.push('/AI/result-ready');
            }
            // Nếu có bất kỳ câu nào chưa đạt -> Vào kịch bản B (Chờ thêm)
            else {
                router.push('/AI/result-wait');
            }
        }, 3500);
    };

    // Hàm render giao diện nút bấm
    const renderOptionButton = (currentValue: boolean | null, targetValue: boolean, onPress: () => void, label: string) => {
        const isSelected = currentValue === targetValue;
        return (
            <TouchableOpacity
                style={[
                    styles.optionButton,
                    isSelected && (targetValue ? styles.optionYesSelected : styles.optionNoSelected)
                ]}
                onPress={onPress}
            >
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* --- HEADER --- */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#5C7A8A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đánh giá định kỳ</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* --- LỜI DẪN TỪ TRỢ LÝ AI --- */}
                <View style={styles.introBox}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.introIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.introTitle}>Cổng kiểm tra: 5.5 Tháng</Text>
                        <Text style={styles.introText}>
                            Mẹ ơi, Ốc sắp tròn 6 tháng rồi! Để AI BabyOi chuẩn bị giáo trình Ăn dặm phù hợp nhất, mẹ đánh giá 3 tín hiệu này nhé:
                        </Text>
                    </View>
                </View>

                {/* --- DANH SÁCH CÂU HỎI --- */}
                <View style={styles.questionCard}>
                    <View style={styles.questionRow}>
                        <Text style={styles.questionText}>1. Dựa vào quan sát hôm nay, Ốc đã có thể giữ thẳng đầu và cổ khi ngồi chưa?</Text>
                        <View style={styles.optionsContainer}>
                            {renderOptionButton(q1, true, () => setQ1(true), 'Đã cứng cáp')}
                            {renderOptionButton(q1, false, () => setQ1(false), 'Còn hơi gật gù')}
                        </View>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.questionRow}>
                        <Text style={styles.questionText}>2. Khi mẹ đưa thìa trống vào miệng, Ốc có lè lưỡi đẩy thìa ra không (phản xạ nhè lưỡi)?</Text>
                        <View style={styles.optionsContainer}>
                            {renderOptionButton(q2, true, () => setQ2(true), 'Không đẩy ra')}
                            {renderOptionButton(q2, false, () => setQ2(false), 'Vẫn đẩy ra')}
                        </View>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.questionRow}>
                        <Text style={styles.questionText}>3. Khi thấy người lớn ăn, Ốc có nhép miệng hoặc chồm tới đòi không?</Text>
                        <View style={styles.optionsContainer}>
                            {renderOptionButton(q3, true, () => setQ3(true), 'Rất thèm thuồng')}
                            {renderOptionButton(q3, false, () => setQ3(false), 'Chưa quan tâm')}
                        </View>
                    </View>
                </View>

                {/* --- NÚT KÍCH HOẠT AI --- */}
                <TouchableOpacity style={styles.aiSubmitButton} onPress={handleAnalyze}>
                    <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.aiSubmitText}>Yêu cầu AI Phân tích</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* --- OVERLAY LOADING AI (Sẽ hiện ra khi bấm nút) --- */}
            <Modal visible={isAnalyzing} transparent={true} animationType="fade">
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="large" color="#FF8FAB" style={{ marginBottom: 20, transform: [{ scale: 1.5 }] }} />
                        <Text style={styles.loadingTitle}>BabyOi AI đang xử lý</Text>
                        <Text style={styles.loadingSubtitle}>{loadingText}</Text>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEF9F3' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: '900', color: '#FF8FAB' },
    scrollContent: { paddingHorizontal: 20 },

    introBox: { flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 25, marginBottom: 20, borderWidth: 1, borderColor: '#F0F4F8', elevation: 3 },
    introIcon: { width: 50, height: 50, marginRight: 15 },
    introTitle: { fontSize: 16, fontWeight: '900', color: '#FF8FAB', marginBottom: 5 },
    introText: { fontSize: 14, color: '#5C7A8A', lineHeight: 22, fontWeight: '500' },

    questionCard: { backgroundColor: '#FFF', borderRadius: 25, padding: 20, elevation: 4, marginBottom: 25 },
    questionRow: { paddingVertical: 10 },
    questionText: { fontSize: 15, fontWeight: '700', color: '#5C7A8A', marginBottom: 15, lineHeight: 22 },
    optionsContainer: { flexDirection: 'row', gap: 10 },
    optionButton: { flex: 1, paddingVertical: 12, borderRadius: 15, backgroundColor: '#F0F4F8', alignItems: 'center', borderWidth: 2, borderColor: '#F0F4F8' },
    optionText: { fontSize: 14, fontWeight: '800', color: '#8899AA', textAlign: 'center' },
    optionYesSelected: { backgroundColor: '#FFF0F5', borderColor: '#FF8FAB' },
    optionNoSelected: { backgroundColor: '#FFF', borderColor: '#FFB6C1' },
    optionTextSelected: { color: '#FF8FAB' },
    divider: { height: 1.5, backgroundColor: '#F0F4F8', marginVertical: 10 },

    aiSubmitButton: { flexDirection: 'row', backgroundColor: '#FF8FAB', paddingVertical: 18, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FFB6C1', shadowOpacity: 0.5, shadowRadius: 8 },
    aiSubmitText: { color: '#FFF', fontSize: 18, fontWeight: '900' },

    loadingOverlay: { flex: 1, backgroundColor: 'rgba(254, 249, 243, 0.9)', justifyContent: 'center', alignItems: 'center' },
    loadingBox: { backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center', elevation: 10, width: '80%' },
    loadingTitle: { fontSize: 18, fontWeight: '900', color: '#FF8FAB', marginBottom: 10 },
    loadingSubtitle: { fontSize: 14, color: '#5C7A8A', textAlign: 'center', fontStyle: 'italic' }
});