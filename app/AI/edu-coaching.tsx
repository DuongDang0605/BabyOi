import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { AiLoadingOverlay } from '../../components/ai/AiLoadingOverlay';
import { AssessmentQuestion } from '../../components/ai/AssessmentQuestion';

export default function EduCoachingScreen() {
    const [q1, setQ1] = useState<boolean | null>(null);
    const [q2, setQ2] = useState<boolean | null>(null);
    const [q3, setQ3] = useState<boolean | null>(null);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingText, setLoadingText] = useState('Đang khởi tạo mô hình AI...');

    const handleAnalyze = () => {
        if (q1 === null || q2 === null || q3 === null) {
            Alert.alert("BabyOi thông báo", "Mẹ vui lòng trả lời đủ 3 câu hỏi để AI phân tích chính xác nhất nhé!");
            return;
        }

        setIsAnalyzing(true);

        setTimeout(() => setLoadingText('Đang phân tích lịch sử học tập 2 tuần qua...'), 800);
        setTimeout(() => setLoadingText('Đang đối chiếu ghi chú khó khăn ở bài Tummy Time...'), 1800);
        setTimeout(() => setLoadingText('Đang tổng hợp với tín hiệu hiện tại để ra quyết định...'), 2800);

        setTimeout(() => {
            setIsAnalyzing(false);
            if (q1 && q2 && q3) {
                router.push('/AI/result-ready');
            } else {
                router.push('/AI/result-wait');
            }
        }, 3500);
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#5C7A8A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Đánh giá định kỳ</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.introBox}>
                    <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png' }} style={styles.introIcon} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.introTitle}>Cổng kiểm tra: 5.5 Tháng</Text>
                        <Text style={styles.introText}>
                            Mẹ ơi, Ốc sắp tròn 6 tháng rồi! Để AI BabyOi chuẩn bị giáo trình Ăn dặm phù hợp nhất, mẹ đánh giá 3 tín hiệu này nhé:
                        </Text>
                    </View>
                </View>

                <View style={styles.questionCard}>
                    <AssessmentQuestion
                        question="1. Dựa vào quan sát hôm nay, Ốc đã có thể giữ thẳng đầu và cổ khi ngồi chưa?"
                        value={q1}
                        onSelect={setQ1}
                        yesLabel="Đã cứng cáp"
                        noLabel="Còn hơi gật gù"
                    />
                    <View style={styles.divider} />

                    <AssessmentQuestion
                        question="2. Khi mẹ đưa thìa trống vào miệng, Ốc có lè lưỡi đẩy thìa ra không (phản xạ nhè lưỡi)?"
                        value={q2}
                        onSelect={setQ2}
                        yesLabel="Không đẩy ra"
                        noLabel="Vẫn đẩy ra"
                    />
                    <View style={styles.divider} />

                    <AssessmentQuestion
                        question="3. Khi thấy người lớn ăn, Ốc có nhép miệng hoặc chồm tới đòi không?"
                        value={q3}
                        onSelect={setQ3}
                        yesLabel="Rất thèm thuồng"
                        noLabel="Chưa quan tâm"
                    />
                </View>

                <TouchableOpacity style={styles.aiSubmitButton} onPress={handleAnalyze}>
                    <Ionicons name="sparkles" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.aiSubmitText}>Yêu cầu AI Phân tích</Text>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            <AiLoadingOverlay visible={isAnalyzing} text={loadingText} />
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
    divider: { height: 1.5, backgroundColor: '#F0F4F8', marginVertical: 10 },
    aiSubmitButton: { flexDirection: 'row', backgroundColor: '#FF8FAB', paddingVertical: 18, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FFB6C1', shadowOpacity: 0.5, shadowRadius: 8 },
    aiSubmitText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
});
