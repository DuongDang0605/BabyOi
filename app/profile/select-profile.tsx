import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
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

import { ApiError, ProfilePayload, ProfileResponse, createHealthRecord, createProfile, getProfilesByUserId, logout as logoutApi, uploadProfileAvatar } from '../../lib/api';
import { clearAuthSession, getAuthSession, hydrateAuthSession } from '../../lib/auth-session';
import { clearSelectedProfile, setSelectedProfile } from '../../lib/profile-session';
import { deactivateCurrentDeviceToken } from '../../lib/push-notifications';

function parseProfileDate(dateOfBirth: string) {
  const value = dateOfBirth.trim();
  const displayDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (displayDate) {
    const day = Number(displayDate[1]);
    const month = Number(displayDate[2]);
    const year = Number(displayDate[3]);
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
    return 'Ngày sinh cần nhập theo định dạng DD/MM/YYYY.';
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

function parsePositiveNumber(value: string) {
  const normalized = value.trim().replace(',', '.');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : Number.NaN;
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isRemoteImageUrl(uri?: string | null) {
  return !!uri && (uri.startsWith('http://') || uri.startsWith('https://'));
}

const MOTHER_ACTIVITY_LEVELS = [
  { code: 'SEDENTARY', label: 'Ít vận động' },
  { code: 'LIGHT', label: 'Vận động nhẹ' },
  { code: 'MODERATE', label: 'Vận động vừa' },
  { code: 'ACTIVE', label: 'Vận động nhiều' },
  { code: 'VERY_ACTIVE', label: 'Vận động rất nhiều' },
] as const;

export default function SelectProfileScreen() {
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [initialHeight, setInitialHeight] = useState('');
  const [initialWeight, setInitialWeight] = useState('');
  const [form, setForm] = useState<ProfilePayload>({
    userId: 0,
    name: '',
    dateOfBirth: '',
    sex: 'FEMALE',
    activityLevel: null,
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

    const motherCount = profiles.filter((profile) => profile.profileType === 'MOTHER').length;
    const childCount = profiles.filter((profile) => profile.profileType === 'CHILD').length;
    const initialProfileType: 'MOTHER' | 'CHILD' = childCount < 2 ? 'CHILD' : 'MOTHER';

    setForm({
      userId: session.userId,
      name: '',
      dateOfBirth: '',
      sex: initialProfileType === 'CHILD' ? 'FEMALE' : undefined,
      activityLevel: initialProfileType === 'MOTHER' && motherCount < 1 ? 'LIGHT' : null,
      profileType: initialProfileType,
      imageUrl: null,
      profileCode: null,
      functionCode: null,
    });
    setInitialHeight('');
    setInitialWeight('');
    setError('');
    setModalVisible(true);
  };

  const updateProfileType = (profileType: 'MOTHER' | 'CHILD') => {
    const profileTypeCount = profiles.filter((profile) => profile.profileType === profileType).length;
    const profileTypeLimit = profileType === 'MOTHER' ? 1 : 2;
    if (profileTypeCount >= profileTypeLimit) {
      setError(profileType === 'MOTHER'
        ? 'Mỗi tài khoản chỉ được tạo tối đa 1 hồ sơ mẹ.'
        : 'Mỗi tài khoản chỉ được tạo tối đa 2 hồ sơ bé.');
      return;
    }

    setForm((current) => ({
      ...current,
      profileType,
      sex: profileType === 'MOTHER' ? undefined : (current.sex || 'FEMALE'),
      activityLevel: profileType === 'MOTHER' ? (current.activityLevel || 'LIGHT') : null,
    }));
    setError('');
  };

  const applyPickedImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled) {
      return;
    }

    const uri = result.assets[0]?.uri;
    if (uri) {
      setForm((current) => ({ ...current, imageUrl: uri }));
      setError('');
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
    const profileTypeCount = profiles.filter((profile) => profile.profileType === form.profileType).length;
    const profileTypeLimit = form.profileType === 'MOTHER' ? 1 : 2;
    if (profileTypeCount >= profileTypeLimit) {
      setError(form.profileType === 'MOTHER'
        ? 'Mỗi tài khoản chỉ được tạo tối đa 1 hồ sơ mẹ.'
        : 'Mỗi tài khoản chỉ được tạo tối đa 2 hồ sơ bé.');
      return;
    }

    const validationError = validateProfileForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    const heightValue = parsePositiveNumber(initialHeight);
    const weightValue = parsePositiveNumber(initialWeight);

    if (Number.isNaN(heightValue) || Number.isNaN(weightValue)) {
      setError('Chiều cao và cân nặng cần là số lớn hơn 0.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const uploadedImageUrl = form.imageUrl && !isRemoteImageUrl(form.imageUrl)
        ? await uploadProfileAvatar(form.imageUrl)
        : form.imageUrl;
      const created = await createProfile({
        ...form,
        name: form.name.trim(),
        sex: form.profileType === 'MOTHER' ? undefined : form.sex,
        activityLevel: form.profileType === 'MOTHER' ? (form.activityLevel || 'LIGHT') : null,
        imageUrl: uploadedImageUrl,
      });
      let healthRecordError = '';
      if (heightValue !== null || weightValue !== null) {
        try {
          await createHealthRecord({
            profileId: created.id,
            height: heightValue,
            weight: weightValue,
            activityLevel: created.profileType === 'MOTHER' ? (form.activityLevel || 'LIGHT') : null,
            recordDate: todayIsoDate(),
          });
        } catch (healthError) {
          healthRecordError = healthError instanceof Error
            ? `Hồ sơ đã được tạo, nhưng chưa lưu được số đo ban đầu: ${healthError.message}`
            : 'Hồ sơ đã được tạo, nhưng chưa lưu được số đo ban đầu.';
        }
      }

      setModalVisible(false);
      setProfiles((current) => [...current, created].slice(0, 3));
      setSelectedProfileId(created.id);
      setError(healthRecordError);
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
    await deactivateCurrentDeviceToken();
    try {
      await logoutApi();
    } catch {
      // Local logout must still complete when the device is offline.
    }
    await clearSelectedProfile();
    await clearAuthSession();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF4F8', '#EFFBFF']} style={styles.backdrop} />
      <View style={[styles.accentBar, styles.accentBarPink]} />
      <View style={[styles.accentBar, styles.accentBarBlue]} />
      <View style={[styles.accentBar, styles.accentBarYellow]} />
      <View style={styles.headerRow}>
        <View style={styles.brandPill}>
          <Text style={styles.brand}>BabyOi</Text>
          <Ionicons name="sparkles" size={18} color="#FFD166" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Chọn hồ sơ chăm sóc</Text>
        <Text style={styles.profileLimit}>Tối đa 3 hồ sơ cho mẹ và bé</Text>

        {loading ? (
          <ActivityIndicator color="#FF8FAB" />
        ) : (
          <View style={styles.profileRow}>
            {profileSlots.map((profile, index) => {
              if (!profile) {
                return (
                  <TouchableOpacity key={`empty-${index}`} style={styles.profileSlot} onPress={openCreateModal}>
                    <LinearGradient colors={['#FFFFFF', '#FFF1F6', '#EFFBFF']} style={styles.addBox}>
                      <Ionicons name="add" size={46} color="#FF8FAB" />
                    </LinearGradient>
                    <Text style={styles.profileName}>Thêm hồ sơ</Text>
                  </TouchableOpacity>
                );
              }

              const selected = selectedProfileId === profile.id;
              return (
                <TouchableOpacity key={profile.id} style={styles.profileSlot} onPress={() => handleSelectProfile(profile)}>
                  <LinearGradient
                    colors={selected ? ['#FFFFFF', '#FFF1F6', '#FFE9A8'] : ['#FFFFFF', '#F5FEFF']}
                    style={[styles.profileImageWrap, selected && styles.profileImageWrapSelected]}
                  >
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
                  </LinearGradient>
                  <Text style={[styles.profileName, selected && styles.profileNameSelected]} numberOfLines={1}>{profile.name}</Text>
                  <Text style={styles.profileAge}>{selected ? 'Bấm lại để vào hồ sơ' : calculateAgeLabel(profile.dateOfBirth, profile.profileType)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!!error && !modalVisible && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#D64545" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
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
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    form.profileType === 'CHILD' && styles.segmentActive,
                    profiles.filter((profile) => profile.profileType === 'CHILD').length >= 2 && styles.segmentDisabled,
                  ]}
                  onPress={() => updateProfileType('CHILD')}
                  disabled={profiles.filter((profile) => profile.profileType === 'CHILD').length >= 2}
                >
                  <Text style={[styles.segmentText, form.profileType === 'CHILD' && styles.segmentTextActive]}>Bé</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    form.profileType === 'MOTHER' && styles.segmentActive,
                    profiles.filter((profile) => profile.profileType === 'MOTHER').length >= 1 && styles.segmentDisabled,
                  ]}
                  onPress={() => updateProfileType('MOTHER')}
                  disabled={profiles.filter((profile) => profile.profileType === 'MOTHER').length >= 1}
                >
                  <Text style={[styles.segmentText, form.profileType === 'MOTHER' && styles.segmentTextActive]}>Mẹ</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Ảnh hồ sơ</Text>
              <View style={styles.photoPickerBox}>
                <View style={styles.photoPreview}>
                  {form.imageUrl ? (
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
                placeholder="DD/MM/YYYY"
                keyboardType="number-pad"
                maxLength={10}
                value={form.dateOfBirth}
                onChangeText={(dateOfBirth) => setForm((current) => ({ ...current, dateOfBirth: normalizeProfileDateInput(dateOfBirth) }))}
              />

              <Text style={styles.label}>Số đo ban đầu</Text>
              <View style={styles.measurementRow}>
                <View style={styles.measurementField}>
                  <TextInput
                    style={styles.input}
                    placeholder="Chiều cao (cm)"
                    keyboardType="decimal-pad"
                    value={initialHeight}
                    onChangeText={setInitialHeight}
                  />
                </View>
                <View style={styles.measurementField}>
                  <TextInput
                    style={styles.input}
                    placeholder="Cân nặng (kg)"
                    keyboardType="decimal-pad"
                    value={initialWeight}
                    onChangeText={setInitialWeight}
                  />
                </View>
              </View>

              {form.profileType === 'MOTHER' && (
                <>
                  <Text style={styles.label}>Mức vận động</Text>
                  <View style={styles.activityLevelList}>
                    {MOTHER_ACTIVITY_LEVELS.map((option) => (
                      <TouchableOpacity
                        key={option.code}
                        style={[
                          styles.activityLevelButton,
                          form.activityLevel === option.code && styles.activityLevelButtonActive,
                        ]}
                        onPress={() => setForm((current) => ({ ...current, activityLevel: option.code }))}
                      >
                        <Text
                          style={[
                            styles.activityLevelText,
                            form.activityLevel === option.code && styles.activityLevelTextActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {form.profileType === 'CHILD' && (
                <>
                  <Text style={styles.label}>Giới tính</Text>
                  <View style={styles.sexRow}>
                    {(['FEMALE', 'MALE', 'OTHER'] as const).map((sex) => (
                      <TouchableOpacity
                        key={sex}
                        style={[styles.sexButton, form.sex === sex && styles.sexButtonActive]}
                        onPress={() => setForm((current) => ({ ...current, sex }))}
                      >
                        <Text style={[styles.sexText, form.sex === sex && styles.sexTextActive]}>
                          {sex === 'FEMALE' ? 'Nữ' : sex === 'MALE' ? 'Nam' : 'Khác'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {!!error && <Text style={styles.modalError}>{error}</Text>}

              <TouchableOpacity style={[styles.createButton, submitting && styles.disabledButton]} onPress={handleCreateProfile} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.createButtonText}>Tạo hồ sơ</Text>}
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
  backdrop: { ...StyleSheet.absoluteFillObject },
  accentBar: { position: 'absolute', borderRadius: 999 },
  accentBarPink: { top: 92, right: 26, width: 96, height: 11, backgroundColor: '#FFB6C1', transform: [{ rotate: '8deg' }] },
  accentBarBlue: { top: 150, left: 22, width: 120, height: 11, backgroundColor: '#A7E4F5', transform: [{ rotate: '-9deg' }] },
  accentBarYellow: { bottom: 92, right: 42, width: 74, height: 9, backgroundColor: '#FFD166', transform: [{ rotate: '-7deg' }] },
  headerRow: { marginTop: 45, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center' },
  brandPill: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#FFE5EC', borderRadius: 22, borderWidth: 1.5, flexDirection: 'row', gap: 6, paddingHorizontal: 13, paddingVertical: 7, shadowColor: '#FFB6C1', shadowOpacity: 0.14, shadowRadius: 8, elevation: 3 },
  brand: { color: '#FF8FAB', fontSize: 32, fontWeight: '900' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18 },
  title: { color: '#FF6F9B', fontSize: 28, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  profileLimit: { backgroundColor: '#FFFFFF', borderColor: '#DDF5FB', borderRadius: 999, borderWidth: 1, color: '#5C7A8A', fontSize: 13, fontWeight: '900', marginBottom: 26, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 7, textAlign: 'center' },
  profileRow: { width: '100%', maxWidth: 390, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  profileSlot: { width: '31%', alignItems: 'center' },
  profileImageWrap: { width: 96, height: 96, borderRadius: 26, borderWidth: 3, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#FF8FAB', shadowOpacity: 0.2, shadowRadius: 12 },
  profileImageWrapSelected: { borderColor: '#FFD166', transform: [{ scale: 1.04 }] },
  profileImage: { width: 78, height: 78, borderRadius: 22 },
  questionMark: { color: '#FF8FAB', fontSize: 48, fontWeight: '900', textAlign: 'center' },
  selectedBadge: { position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#FF6F9B', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
  addBox: { width: 96, height: 96, borderRadius: 26, borderWidth: 2.5, borderStyle: 'dashed', borderColor: '#FFB6C1', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#FF8FAB', shadowOpacity: 0.16, shadowRadius: 10 },
  profileName: { color: '#5C7A8A', fontSize: 13, fontWeight: '900', marginTop: 10, maxWidth: '100%', textAlign: 'center' },
  profileNameSelected: { color: '#FF8FAB' },
  profileAge: { color: '#7D95A1', fontSize: 11, fontWeight: '800', marginTop: 4, minHeight: 30, textAlign: 'center' },
  errorText: { marginTop: 26, color: '#FF6B8F', fontWeight: '800', textAlign: 'center' },
  logoutButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#FFD2DE', borderRadius: 18, borderWidth: 1.5, flexDirection: 'row', gap: 7, justifyContent: 'center', marginTop: 28, minHeight: 42, paddingHorizontal: 18, shadowColor: '#FFB6C1', shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  logoutButtonText: { color: '#D64545', fontSize: 14, fontWeight: '900' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(92,122,138,0.35)', padding: 20 },
  modalCard: { maxHeight: '88%', backgroundColor: '#FEF9F3', borderRadius: 28, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { color: '#FF8FAB', fontSize: 22, fontWeight: '900' },
  segment: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 4, borderRadius: 18, marginBottom: 18 },
  segmentButton: { flex: 1, paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  segmentActive: { backgroundColor: '#FF8FAB' },
  segmentDisabled: { opacity: 0.35 },
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
  measurementRow: { flexDirection: 'row', gap: 10 },
  measurementField: { flex: 1 },
  activityLevelList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  activityLevelButton: { borderWidth: 1, borderColor: '#F0E3E6', borderRadius: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 10 },
  activityLevelButtonActive: { borderColor: '#FF8FAB', backgroundColor: '#FFF0F3' },
  activityLevelText: { color: '#78909C', fontSize: 12, fontWeight: '800' },
  activityLevelTextActive: { color: '#FF6F9B' },
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
