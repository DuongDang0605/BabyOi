import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { createDiaryEntry, getDiaryEntry, resolveAssetUrl, updateDiaryEntry, uploadDiaryImage } from '../../lib/api';
import { parseDisplayDateToIso, todayIsoDate, toDisplayDate } from '../../lib/health-format';
import { useNotification } from '../../lib/notification';
import { ensureCurrentUserSelectedProfile } from '../../lib/profile-session';

const MILESTONES = ['Lần đầu tiên', 'Sinh nhật', 'Đi chơi', 'Mọc răng', 'Cột mốc mới', 'Khác'];

export default function AddMomentScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const isEditing = Boolean(editingId);
  const { showNotification } = useNotification();
  const [selectedMilestone, setSelectedMilestone] = useState(MILESTONES[0]);
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(toDisplayDate(todayIsoDate()));
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(editingId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadEntry() {
      if (!editingId) {
        return;
      }

      try {
        setLoading(true);
        const entry = await getDiaryEntry(editingId);
        if (!mounted) {
          return;
        }

        setTitle(entry.title || '');
        setContent(entry.content || '');
        setEntryDate(toDisplayDate(entry.entryDate));
        setSelectedMilestone(entry.milestone || MILESTONES[0]);
        setImageUrl(entry.imageUrl || null);
        setImageUri(null);
      } catch (err) {
        showNotification({ type: 'error', title: 'Không thể tải nhật ký', message: err instanceof Error ? err.message : 'Vui lòng thử lại sau.' });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEntry();
    return () => {
      mounted = false;
    };
  }, [editingId, showNotification]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showNotification({ type: 'warning', title: 'Chưa có quyền ảnh', message: 'BabyOi cần quyền truy cập thư viện để chọn ảnh nhật ký.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.62,
      base64: false,
      exif: false,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const profile = await ensureCurrentUserSelectedProfile();
    const isoEntryDate = parseDisplayDateToIso(entryDate);

    if (!profile?.id) {
      showNotification({ type: 'error', title: 'Chưa chọn hồ sơ', message: 'Vui lòng chọn hồ sơ trước khi lưu nhật ký.' });
      return;
    }
    if (!title.trim()) {
      showNotification({ type: 'error', title: 'Thiếu tiêu đề', message: 'Hãy nhập tiêu đề cho kỷ niệm của bé.' });
      return;
    }
    if (!content.trim()) {
      showNotification({ type: 'error', title: 'Thiếu nội dung', message: 'Hãy viết vài dòng cho khoảnh khắc này.' });
      return;
    }
    if (!isoEntryDate) {
      showNotification({ type: 'error', title: 'Ngày không hợp lệ', message: 'Ngày cần theo định dạng DD/MM/YYYY.' });
      return;
    }

    try {
      setSaving(true);
      const finalImageUrl = imageUri ? await uploadDiaryImage(imageUri) : imageUrl;
      const payload = {
        profileId: profile.id,
        title: title.trim(),
        content: content.trim(),
        imageUrl: finalImageUrl || null,
        milestone: selectedMilestone,
        entryDate: isoEntryDate,
      };

      if (editingId) {
        await updateDiaryEntry(editingId, payload);
      } else {
        await createDiaryEntry(payload);
      }

      showNotification({
        type: 'success',
        title: isEditing ? 'Đã cập nhật nhật ký' : 'Đã lưu kỷ niệm',
        message: 'Khoảnh khắc của bé đã được lưu vào dòng thời gian.',
      });
      router.back();
    } catch (err) {
      showNotification({ type: 'error', title: 'Không thể lưu', message: err instanceof Error ? err.message : 'Vui lòng thử lại sau.' });
    } finally {
      setSaving(false);
    }
  };

  const previewImage = imageUri || resolveAssetUrl(imageUrl);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#FFF7FA', '#F1FBFA', '#FFF9EC']} style={styles.screenGlow} />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.customHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#ff8fab" />
          </TouchableOpacity>

          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>{isEditing ? 'Sửa Kỷ Niệm' : 'Thêm Kỷ Niệm'}</Text>
            <Text style={styles.headerSubtitle}>Ảnh nhẹ hơn, kỷ niệm vẫn lung linh</Text>
          </View>

          <View style={{ width: 45 }} />
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#FF8FAB" />
            <Text style={styles.loadingText}>Đang tải nhật ký...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.imageUploadBox} onPress={pickImage} activeOpacity={0.85}>
              {previewImage ? (
                <>
                  <Image source={{ uri: previewImage }} style={styles.previewImage} />
                  <LinearGradient colors={['transparent', 'rgba(51, 68, 85, 0.78)']} style={styles.previewFade} />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="images-outline" size={22} color="#FFF" />
                    <Text style={styles.overlayText}>Đổi ảnh</Text>
                  </View>
                </>
              ) : (
                <LinearGradient colors={['#FFFFFF', '#FFF0F5', '#F0FBFF']} style={styles.imageUploadInner}>
                  <View style={styles.uploadIconBubble}>
                    <Ionicons name="images-outline" size={34} color="#ff8fab" />
                  </View>
                  <Text style={styles.uploadText}>Chạm để chọn ảnh của bé</Text>
                  <Text style={styles.uploadHint}>BabyOi sẽ tự làm ảnh nhẹ hơn trước khi lưu</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {imageUri && saving ? (
              <View style={styles.uploadingHint}>
                <ActivityIndicator size="small" color="#FF8FAB" />
                <Text style={styles.uploadingHintText}>Đang tối ưu và tải ảnh lên Diary...</Text>
              </View>
            ) : null}

            {previewImage ? (
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => {
                  setImageUri(null);
                  setImageUrl(null);
                }}
              >
                <Ionicons name="close-circle-outline" size={18} color="#E57373" />
                <Text style={styles.removeImageText}>Bỏ ảnh này</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tiêu đề kỷ niệm</Text>
              <TextInput
                style={styles.inputRounded}
                placeholder="VD: Chiếc răng đầu tiên của con..."
                placeholderTextColor="#b0bec5"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ngày lưu giữ</Text>
              <TextInput
                style={[styles.inputRounded, styles.dateInput]}
                value={entryDate}
                onChangeText={setEntryDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#b0bec5"
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Đánh dấu cột mốc</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
                {MILESTONES.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.pillButton,
                      selectedMilestone === item ? styles.pillActive : styles.pillInactive,
                    ]}
                    onPress={() => setSelectedMilestone(item)}
                  >
                    <Text style={selectedMilestone === item ? styles.pillActiveText : styles.pillInactiveText}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lời yêu thương mẹ gửi con</Text>
              <TextInput
                style={[styles.inputRounded, styles.textArea]}
                placeholder="Hôm nay bé đã làm được điều gì khiến mẹ bất ngờ?"
                placeholderTextColor="#b0bec5"
                multiline
                value={content}
                onChangeText={setContent}
              />
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} disabled={saving || loading} onPress={handleSave}>
          <LinearGradient colors={['#FF8FAB', '#FFB86C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.saveButtonGradient}>
            {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="heart" size={19} color="#FFFFFF" />}
            <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu lại kỷ niệm'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef9f3',
  },
  screenGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollArea: {
    padding: 20,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 25,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 5,
    width: 45,
  },
  headerTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#ff8fab',
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    color: '#7AA7B7',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#5C7A8A',
    fontWeight: '700',
    marginTop: 10,
  },
  imageUploadBox: {
    backgroundColor: '#fff5f7',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#ffb6c1',
    borderStyle: 'dashed',
    height: 210,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  imageUploadInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  uploadIconBubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE1EA',
    shadowColor: '#FF8FAB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 3,
  },
  uploadText: {
    color: '#ff8fab',
    fontWeight: '900',
    marginTop: 14,
    fontSize: 16,
    textAlign: 'center',
  },
  uploadHint: {
    color: '#7AA7B7',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewFade: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(51, 68, 85, 0.68)',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFF',
    fontWeight: '900',
    marginLeft: 6,
  },
  uploadingHint: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFE1EA',
  },
  uploadingHintText: {
    color: '#5C7A8A',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 8,
  },
  removeImageBtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removeImageText: {
    color: '#E57373',
    fontWeight: '800',
    marginLeft: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5c7a8a',
    marginBottom: 10,
    marginLeft: 5,
  },
  inputRounded: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    fontSize: 15,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#f0f4f8',
    shadowColor: '#a7e4f5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInput: {
    color: '#5c7a8a',
    fontWeight: 'bold',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pillScroll: {
    flexDirection: 'row',
  },
  pillButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
  pillActive: {
    backgroundColor: '#fff0cb',
    borderColor: '#ffe08a',
  },
  pillActiveText: {
    color: '#d46b08',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pillInactive: {
    backgroundColor: '#ffffff',
    borderColor: '#f0f4f8',
  },
  pillInactiveText: {
    color: '#a0aab2',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 35,
    backgroundColor: 'rgba(254, 249, 243, 0.95)',
  },
  saveButton: {
    borderRadius: 30,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});
