import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ApiError, ProfilePayload, ProfileResponse, createProfile, getProfilesByUserId, uploadProfileAvatar } from '../../lib/api';
import { clearAuthSession, getAuthSession, hydrateAuthSession } from '../../lib/auth-session';
import { clearSelectedProfile, setSelectedProfile } from '../../lib/profile-session';

function parseProfileDate(dateOfBirth: string) {
  const value = dateOfBirth.trim();
  const usDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (usDate) {
    const month = Number(usDate[1]);
    const day = Number(usDate[2]);
    const year = Number(usDate[3]);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) {
      return parsed;
    }
    return new Date(Number.NaN);
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]);
    const day = Number(isoDate[3]);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) {
      return parsed;
    }
  }

  return new Date(Number.NaN);
}

function normalizeProfileDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function calculateAgeLabel(dateOfBirth: string, profileType: string) {
  const dob = parseProfileDate(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return profileType === 'MOTHER' ? 'Hồ sơ mẹ' : 'Hồ sơ bé';
  }

  const now = new Date();
  const months = Math.max(0, (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth());

  if (profileType === 'CHILD') {
    return months < 24 ? `${months} tháng tuổi` : '2 tuổi';
  }

  const years = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  return `${years} tuổi`;
}

function validateProfileForm(payload: ProfilePayload) {
  const name = payload.name.trim();
  const dob = parseProfileDate(payload.dateOfBirth);
  const now = new Date();

  if (name.length < 2 || name.length > 50) {
    return 'Tên hồ sơ cần từ 2 đến 50 ký tự.';
  }
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(payload.dateOfBirth.trim())) {
    return 'Ngày sinh cần nhập theo định dạng MM/DD/YYYY.';
  }
  if (!payload.dateOfBirth || Number.isNaN(dob.getTime()) || dob > now) {
    return 'Ngày sinh không hợp lệ.';
  }
  if (payload.profileType === 'CHILD') {
    const months = (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth();
    if (months > 24) {
      return 'Hồ sơ bé chỉ dành cho bé từ 0 đến 24 tháng.';
    }
  }
  if (payload.profileType === 'MOTHER') {
    const years = now.getFullYear() - dob.getFullYear();
    if (years < 13) {
      return 'Hồ sơ mẹ cần có tuổi phù hợp.';
    }
  }

  return '';
}

export default function SelectProfileScreen() {
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ProfilePayload>({
    userId: 0,
    name: '',
    dateOfBirth: '',
    sex: 'FEMALE',
    profileType: 'CHILD',
    imageUrl: null,
    profileCode: null,
    functionCode: null,
  });

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const session = getAuthSession() || await hydrateAuthSession();
      if (!session?.userId) {
        router.replace('/auth/login');
        return;
      }

      const data = await getProfilesByUserId(session.userId);
      setProfiles(data);
      setSelectedProfileId(null);
      setForm((current) => ({ ...current, userId: session.userId }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hồ sơ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadProfiles();
  }, [loadProfiles]));

  const openCreateModal = async () => {
    const session = getAuthSession() || await hydrateAuthSession();
    if (!session?.userId) {
      router.replace('/auth/login');
      return;
    }
    if (profiles.length >= 3) {
      setError('Mỗi tài khoản chỉ được tạo tối đa 3 hồ sơ đang hoạt động.');
      return;
    }

    setForm({
      userId: session.userId,
      name: '',
      dateOfBirth: '',
      sex: 'FEMALE',
      profileType: 'CHILD',
      imageUrl: null,
      profileCode: null,
      functionCode: null,
    });
    setError('');
    setModalVisible(true);
  };

  const updateProfileType = (profileType: 'MOTHER' | 'CHILD') => {
    setForm((current) => ({
      ...current,
      profileType,
      sex: profileType === 'MOTHER' ? 'FEMALE' : current.sex,
    }));
  };

  const applyPickedImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }

    const uri = result.assets[0]?.uri;
    if (uri) {
      try {
        setImageUploading(true);
        const imageUrl = await uploadProfileAvatar(uri);
        setForm((current) => ({ ...current, imageUrl }));
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải ảnh hồ sơ lên máy chủ. Bạn thử chọn lại ảnh nhé.');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Bạn cần cho phép truy cập thư viện ảnh để chọn ảnh hồ sơ.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });
    await applyPickedImage(result);
  };

  const takeProfilePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError('Bạn cần cho phép truy cập camera để chụp ảnh hồ sơ.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });
    await applyPickedImage(result);
  };

  const handleCreateProfile = async () => {
    const validationError = validateProfileForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const created = await createProfile({
        ...form,
        name: form.name.trim(),
      });

      setModalVisible(false);
      setProfiles((current) => [...current, created].slice(0, 3));
      setSelectedProfileId(created.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Không thể tạo hồ sơ.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectProfile = async (profile: ProfileResponse) => {
    if (selectedProfileId !== profile.id) {
      setSelectedProfileId(profile.id);
      setError('');
      return;
    }

    await setSelectedProfile(profile);
    router.replace('/home/home');
  };

  const profileSlots = Array.from({ length: 3 }, (_, index) => profiles[index] ?? null);

  const handleLogout = async () => {
    await clearSelectedProfile();
    await clearAuthSession();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.backdrop} />
      <View style={styles.softCircleTop} />
      <View style={styles.softCircleBottom} />
      <View style={styles.headerRow}>
        <Text style={styles.brand}>BabyOi</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="close" size={28} color="#5C7A8A" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Hãy chọn hồ sơ</Text>
        <Text style={styles.profileLimit}>Tối đa 3 hồ sơ</Text>

        {loading ? (
          <ActivityIndicator color="#FF8FAB" />
        ) : (
          <View style={styles.profileRow}>
            {profileSlots.map((profile, index) => {
              if (!profile) {
                return (
                  <TouchableOpacity key={`empty-${index}`} style={styles.profileSlot} onPress={openCreateModal}>
                    <View style={styles.addBox}>
                      <Ionicons name="add" size={46} color="#FF8FAB" />
                    </View>
                    <Text style={styles.profileName}>Thêm hồ sơ</Text>
                  </TouchableOpacity>
                );
              }

              const selected = selectedProfileId === profile.id;
              return (
                <TouchableOpacity key={profile.id} style={styles.profileSlot} onPress={() => handleSelectProfile(profile)}>
                  <View style={[styles.profileImageWrap, selected && styles.profileImageWrapSelected]}>
                    {profile.imageUrl ? (
                      <Image source={{ uri: profile.imageUrl }} style={styles.profileImage} />
                    ) : (
                      <Text style={styles.questionMark}>?</Text>
                    )}
                    {selected && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.profileName, selected && styles.profileNameSelected]} numberOfLines={1}>{profile.name}</Text>
                  <Text style={styles.profileAge}>{selected ? 'Bấm lần nữa để vào' : calculateAgeLabel(profile.dateOfBirth, profile.profileType)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!!error && !modalVisible && <Text style={styles.errorText}>{error}</Text>}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tạo hồ sơ mới</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#5C7A8A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.segment}>
                <TouchableOpacity style={[styles.segmentButton, form.profileType === 'CHILD' && styles.segmentActive]} onPress={() => updateProfileType('CHILD')}>
                  <Text style={[styles.segmentText, form.profileType === 'CHILD' && styles.segmentTextActive]}>Bé</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segmentButton, form.profileType === 'MOTHER' && styles.segmentActive]} onPress={() => updateProfileType('MOTHER')}>
                  <Text style={[styles.segmentText, form.profileType === 'MOTHER' && styles.segmentTextActive]}>Mẹ</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Ảnh hồ sơ</Text>
              <View style={styles.photoPickerBox}>
                <View style={styles.photoPreview}>
                  {imageUploading ? (
                    <ActivityIndicator color="#FF8FAB" />
                  ) : form.imageUrl ? (
                    <Image source={{ uri: form.imageUrl }} style={styles.photoPreviewImage} />
                  ) : (
                    <Ionicons name="camera-outline" size={34} color="#FF8FAB" />
                  )}
                </View>
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoButton} onPress={pickProfileImage}>
                    <Ionicons name="images-outline" size={18} color="#FF8FAB" />
                    <Text style={styles.photoButtonText}>Thư viện</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoButton} onPress={takeProfilePhoto}>
                    <Ionicons name="camera-outline" size={18} color="#FF8FAB" />
                    <Text style={styles.photoButtonText}>Camera</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.label}>Tên hồ sơ</Text>
              <TextInput
                style={styles.input}
                placeholder={form.profileType === 'CHILD' ? 'Ví dụ: Bé Bơ' : 'Ví dụ: Mẹ Linh'}
                value={form.name}
                onChangeText={(name) => setForm((current) => ({ ...current, name }))}
              />

              <Text style={styles.label}>Ngày sinh</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/DD/YYYY"
                keyboardType="number-pad"
                maxLength={10}
                value={form.dateOfBirth}
                onChangeText={(dateOfBirth) => setForm((current) => ({ ...current, dateOfBirth: normalizeProfileDateInput(dateOfBirth) }))}
              />

              <Text style={styles.label}>Giới tính</Text>
              <View style={styles.sexRow}>
                {(['FEMALE', 'MALE', 'OTHER'] as const).map((sex) => (
                  <TouchableOpacity
                    key={sex}
                    style={[styles.sexButton, form.sex === sex && styles.sexButtonActive]}
                    onPress={() => setForm((current) => ({ ...current, sex }))}
                    disabled={form.profileType === 'MOTHER' && sex !== 'FEMALE'}
                  >
                    <Text style={[styles.sexText, form.sex === sex && styles.sexTextActive]}>
                      {sex === 'FEMALE' ? 'Nữ' : sex === 'MALE' ? 'Nam' : 'Khác'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {!!error && <Text style={styles.modalError}>{error}</Text>}

              <TouchableOpacity style={[styles.createButton, (submitting || imageUploading) && styles.disabledButton]} onPress={handleCreateProfile} disabled={submitting || imageUploading}>
                {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>{imageUploading ? 'Đang tải ảnh...' : 'Tạo hồ sơ'}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FEF9F3' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#FEF9F3' },
  softCircleTop: { position: 'absolute', top: -80, right: -70, width: 210, height: 210, borderRadius: 105, backgroundColor: '#FFE5EC' },
  softCircleBottom: { position: 'absolute', bottom: -95, left: -80, width: 230, height: 230, borderRadius: 115, backgroundColor: '#E9F8FD' },
  headerRow: { marginTop: 45, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#FF8FAB', fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { color: '#5C7A8A', fontSize: 31, fontWeight: '900', marginBottom: 8 },
  profileLimit: { color: '#7D95A1', fontSize: 13, fontWeight: '800', marginBottom: 26, textAlign: 'center' },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 18 },
  profileSlot: { width: 126, alignItems: 'center' },
  profileImageWrap: { width: 112, height: 112, borderRadius: 30, backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: '#FFE5EC', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FFB6C1', shadowOpacity: 0.18, shadowRadius: 10 },
  profileImageWrapSelected: { borderColor: '#FF8FAB', transform: [{ scale: 1.04 }] },
  profileImage: { width: 92, height: 92, borderRadius: 25 },
  questionMark: { color: '#FF8FAB', fontSize: 58, fontWeight: '900', textAlign: 'center' },
  selectedBadge: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF8FAB', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  addBox: { width: 112, height: 112, borderRadius: 30, borderWidth: 2.5, borderStyle: 'dashed', borderColor: '#FFB6C1', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#FFB6C1', shadowOpacity: 0.12, shadowRadius: 8 },
  profileName: { color: '#5C7A8A', fontSize: 15, fontWeight: '900', marginTop: 10, maxWidth: 126 },
  profileNameSelected: { color: '#FF8FAB' },
  profileAge: { color: '#7D95A1', fontSize: 12, fontWeight: '800', marginTop: 3, textAlign: 'center' },
  errorText: { marginTop: 26, color: '#FF6B8F', fontWeight: '800', textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(92,122,138,0.35)', padding: 20 },
  modalCard: { maxHeight: '88%', backgroundColor: '#FEF9F3', borderRadius: 28, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: '#FF8FAB', fontSize: 22, fontWeight: '900' },
  segment: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 4, borderRadius: 18, marginBottom: 18 },
  segmentButton: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  segmentActive: { backgroundColor: '#FF8FAB' },
  segmentText: { color: '#7D95A1', fontWeight: '900' },
  segmentTextActive: { color: '#FFFFFF' },
  label: { color: '#5C7A8A', fontSize: 14, fontWeight: '900', marginBottom: 8, marginLeft: 3 },
  photoPickerBox: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 2, borderColor: '#F0F4F8', padding: 12, marginBottom: 18 },
  photoPreview: { width: 78, height: 78, borderRadius: 24, backgroundColor: '#FFE5EC', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoPreviewImage: { width: '100%', height: '100%', borderRadius: 24 },
  photoActions: { flex: 1, gap: 8 },
  photoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: 34, borderRadius: 14, backgroundColor: '#FFF6F8', borderWidth: 1.5, borderColor: '#FFD2DE' },
  photoButtonText: { color: '#FF8FAB', fontSize: 13, fontWeight: '900' },
  input: { backgroundColor: '#FFFFFF', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 2, borderColor: '#F0F4F8', color: '#334455', fontWeight: '700', marginBottom: 16 },
  sexRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  sexButton: { flex: 1, paddingVertical: 11, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#F0F4F8', alignItems: 'center' },
  sexButtonActive: { backgroundColor: '#FFE5EC', borderColor: '#FF8FAB' },
  sexText: { color: '#7D95A1', fontWeight: '900' },
  sexTextActive: { color: '#FF8FAB' },
  modalError: { color: '#D64545', fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  createButton: { backgroundColor: '#FF8FAB', borderRadius: 22, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  disabledButton: { opacity: 0.7 },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
