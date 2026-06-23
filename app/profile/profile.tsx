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

import { CustomHeader } from '../../components/common/CustomHeader';
import { ProfileInfo } from '../../components/profile/ProfileInfo';
import { StatCard } from '../../components/profile/StatCard';
import {
  ApiError,
  HealthRecordResponse,
  ProfilePayload,
  ProfileResponse,
  createHealthRecord,
  deleteProfile,
  getHealthRecords,
  getVaccineStatistics,
  logout as logoutApi,
  updateProfile,
  updateProfileAvatar,
  uploadProfileAvatar,
} from '../../lib/api';
import { clearAuthSession } from '../../lib/auth-session';
import { clearSelectedProfile, getSelectedProfile, hydrateSelectedProfile, setSelectedProfile } from '../../lib/profile-session';
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

function getLatestHealthRecord(records: HealthRecordResponse[]) {
  return [...records].sort((a, b) => {
    const dateDiff = new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime();
    return dateDiff !== 0 ? dateDiff : b.id - a.id;
  })[0] ?? null;
}

function formatStatNumber(value?: number | null, unit = '', digits = 1) {
  if (value == null || Number.isNaN(Number(value))) {
    return '-';
  }

  return `${Number(value).toFixed(digits)}${unit}`;
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
  if (Number.isNaN(dob.getTime()) || dob > now) {
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

const MOTHER_ACTIVITY_LEVELS = [
  { code: 'SEDENTARY', label: 'Ít vận động' },
  { code: 'LIGHT', label: 'Vận động nhẹ' },
  { code: 'MODERATE', label: 'Vận động vừa' },
  { code: 'ACTIVE', label: 'Vận động nhiều' },
  { code: 'VERY_ACTIVE', label: 'Vận động rất nhiều' },
] as const;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [form, setForm] = useState<ProfilePayload | null>(null);
  const [latestHealth, setLatestHealth] = useState<HealthRecordResponse | null>(null);
  const [completedVaccines, setCompletedVaccines] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadProfile() {
      const selected = getSelectedProfile() || await hydrateSelectedProfile();
      if (mounted) {
        setProfile(selected);
      }

      if (!selected?.id) {
        if (mounted) {
          setLatestHealth(null);
          setCompletedVaccines(null);
        }
        return;
      }

      try {
        const [healthRecords, vaccineStats] = await Promise.all([
          getHealthRecords(selected.id),
          getVaccineStatistics(selected.id),
        ]);

        if (mounted) {
          setLatestHealth(getLatestHealthRecord(healthRecords));
          setCompletedVaccines(vaccineStats.success ?? 0);
        }
      } catch {
        if (mounted) {
          setLatestHealth(null);
          setCompletedVaccines(null);
        }
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []));

  const menuOptions = [
    { id: '1', title: 'Sổ tiêm chủng', icon: 'shield-checkmark-outline', color: '#4CAF50', route: '/lichtiem/listlichtiem' },
    { id: '2', title: 'Lịch sử sức khỏe', icon: 'pulse-outline', color: '#2196F3', route: '/phattrien/health-history' },
    { id: '3', title: 'Nhật ký khoảnh khắc', icon: 'book-outline', color: '#FF9800', route: '/nhatki/nhatki' },
  ];

  const displayName = profile?.name || 'Chưa chọn hồ sơ';
  const displayDob = profile?.dateOfBirth || 'Chưa có ngày sinh';
  const displayGender = profile?.sex === 'MALE' ? 'Nam' : profile?.sex === 'FEMALE' ? 'Nữ' : 'Khác';
  const displayAvatar = profile?.imageUrl ? { uri: profile.imageUrl } : require('../../assets/images/avt.png');
  const profileHeaderTitle = profile?.profileType === 'MOTHER' ? 'Hồ Sơ Của Mẹ' : 'Hồ Sơ Của Bé';

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

  const openEditModal = () => {
    if (!profile) {
      return;
    }
    const profileType = profile.profileType === 'MOTHER' ? 'MOTHER' : 'CHILD';

    setForm({
      userId: profile.userId,
      name: profile.name,
      dateOfBirth: profile.dateOfBirth,
      sex: profileType === 'MOTHER' ? undefined : profile.sex === 'MALE' || profile.sex === 'FEMALE' || profile.sex === 'OTHER' ? profile.sex : 'OTHER',
      activityLevel: profileType === 'MOTHER' ? (profile.activityLevel || 'LIGHT') : null,
      profileType,
      profileCode: profile.profileCode,
      functionCode: profile.functionCode,
      imageUrl: profile.imageUrl,
    });
    setEditHeight(latestHealth?.height != null ? String(latestHealth.height) : '');
    setEditWeight(latestHealth?.weight != null ? String(latestHealth.weight) : '');
    setEditError('');
    setEditVisible(true);
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
        setForm((current) => current ? { ...current, imageUrl } : current);
        if (profile?.id) {
          const updated = await updateProfileAvatar(profile.id, imageUrl);
          setProfile(updated);
          await setSelectedProfile(updated);
          setForm((current) => current ? { ...current, imageUrl: updated.imageUrl } : current);
        }
        setEditError('');
      } catch (err) {
        setEditError(err instanceof Error ? err.message : 'Không thể tải ảnh hồ sơ lên máy chủ. Bạn thử chọn lại ảnh nhé.');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setEditError('Bạn cần cho phép truy cập thư viện ảnh để chọn ảnh hồ sơ.');
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
      setEditError('Bạn cần cho phép truy cập camera để chụp ảnh hồ sơ.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82,
    });
    await applyPickedImage(result);
  };

  const submitUpdateProfile = async () => {
    if (!profile || !form) {
      return;
    }

    const normalizedForm: ProfilePayload = {
      ...form,
      name: form.name.trim(),
      sex: form.profileType === 'MOTHER' ? undefined : form.sex,
      activityLevel: form.profileType === 'MOTHER' ? (form.activityLevel || 'LIGHT') : null,
    };

    const validationError = validateProfileForm(normalizedForm);
    if (validationError) {
      setEditError(validationError);
      return;
    }
    const heightValue = parsePositiveNumber(editHeight);
    const weightValue = parsePositiveNumber(editWeight);

    if (Number.isNaN(heightValue) || Number.isNaN(weightValue)) {
      setEditError('Chiều cao và cân nặng cần là số lớn hơn 0.');
      return;
    }

    try {
      setSubmitting(true);
      setEditError('');
      const updated = await updateProfile(profile.id, normalizedForm);
      if (heightValue !== null || weightValue !== null) {
        const createdHealth = await createHealthRecord({
          profileId: updated.id,
          height: heightValue,
          weight: weightValue,
          activityLevel: updated.profileType === 'MOTHER' ? (normalizedForm.activityLevel || 'LIGHT') : null,
          recordDate: todayIsoDate(),
        });
        setLatestHealth(createdHealth);
      }
      setProfile(updated);
      await setSelectedProfile(updated);
      setEditVisible(false);
    } catch (err) {
      if (err instanceof ApiError) {
        setEditError(err.message);
      } else {
        setEditError('Không thể cập nhật hồ sơ.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSoftDeleteProfile = async () => {
    if (!profile) {
      return;
    }

    try {
      setDeleting(true);
      setEditError('');
      await deleteProfile(profile.id);
      await clearSelectedProfile();
      setProfile(null);
      setEditVisible(false);
      router.replace('/profile/select-profile');
    } catch (err) {
      if (err instanceof ApiError) {
        setEditError(err.message);
      } else {
        setEditError('Không thể xóa hồ sơ.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <CustomHeader
        title={profileHeaderTitle}
        rightElement={
          <TouchableOpacity onPress={openEditModal}>
            <Ionicons name="settings-outline" size={24} color="#ff8fab" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- THÔNG TIN CƠ BẢN --- */}
        <ProfileInfo
          name={displayName}
          dob={displayDob}
          gender={displayGender}
          avatarSource={displayAvatar}
          onEditPress={openEditModal}
          showEditBadge={false}
        />

        {/* --- THỐNG KÊ NHANH --- */}
        <View style={styles.statsRow}>
          <StatCard
            label="Cân nặng"
            value={formatStatNumber(latestHealth?.weight, 'kg')}
            icon="speedometer-outline"
            color="#FF8FAB"
          />
          <StatCard
            label="Chiều cao"
            value={formatStatNumber(latestHealth?.height, 'cm')}
            icon="resize-outline"
            color="#FFD166"
          />
        </View>
        <View style={[styles.statsRow, { marginTop: 15 }]}>
          <StatCard
            label="Mũi đã tiêm"
            value={completedVaccines ?? '-'}
            icon="checkmark-circle-outline"
            color="#4CAF50"
          />
          <StatCard
            label="TDEE"
            value={formatStatNumber(latestHealth?.tdee, ' kcal', 0)}
            icon="flame-outline"
            color="#A7E4F5"
          />
        </View>

        {/* --- DANH SÁCH TÙY CHỌN --- */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tiện ích & Quản lý</Text>
          {menuOptions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* --- NÚT ĐĂNG XUẤT --- */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#F44336" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="fade" onRequestClose={() => setEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật hồ sơ</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color="#5C7A8A" />
              </TouchableOpacity>
            </View>

            {form && (
              <ScrollView showsVerticalScrollIndicator={false}>
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
                  onChangeText={(name) => setForm((current) => current ? { ...current, name } : current)}
                />

                <Text style={styles.label}>Ngày sinh</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/YYYY"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={form.dateOfBirth}
                  onChangeText={(dateOfBirth) => setForm((current) => current ? { ...current, dateOfBirth: normalizeProfileDateInput(dateOfBirth) } : current)}
                />

                <Text style={styles.label}>Số đo sức khỏe</Text>
                <View style={styles.measurementRow}>
                  <View style={styles.measurementField}>
                    <TextInput
                      style={styles.input}
                      placeholder="Chiều cao (cm)"
                      keyboardType="decimal-pad"
                      value={editHeight}
                      onChangeText={setEditHeight}
                    />
                  </View>
                  <View style={styles.measurementField}>
                    <TextInput
                      style={styles.input}
                      placeholder="Cân nặng (kg)"
                      keyboardType="decimal-pad"
                      value={editWeight}
                      onChangeText={setEditWeight}
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
                          onPress={() => setForm((current) => current ? { ...current, activityLevel: option.code } : current)}
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
                          onPress={() => setForm((current) => current ? { ...current, sex } : current)}
                        >
                          <Text style={[styles.sexText, form.sex === sex && styles.sexTextActive]}>
                            {sex === 'FEMALE' ? 'Nữ' : sex === 'MALE' ? 'Nam' : 'Khác'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {!!editError && <Text style={styles.modalError}>{editError}</Text>}

                <TouchableOpacity style={[styles.saveButton, (submitting || imageUploading || deleting) && styles.disabledButton]} onPress={submitUpdateProfile} disabled={submitting || imageUploading || deleting}>
                  {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{imageUploading ? 'Đang tải ảnh...' : 'Lưu thay đổi'}</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteButton, (submitting || imageUploading || deleting) && styles.disabledButton]} onPress={handleSoftDeleteProfile} disabled={submitting || imageUploading || deleting}>
                  {deleting ? <ActivityIndicator color="#D64545" /> : <Text style={styles.deleteButtonText}>Xóa hồ sơ</Text>}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF9F3',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
  },
  menuSection: {
    marginTop: 35,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5C7A8A',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#334455',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 15,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F44336',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(92,122,138,0.35)',
    padding: 20,
  },
  modalCard: {
    maxHeight: '88%',
    backgroundColor: '#FEF9F3',
    borderRadius: 28,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#FF8FAB',
    fontSize: 22,
    fontWeight: '900',
  },
  label: {
    color: '#5C7A8A',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 3,
  },
  photoPickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#F0F4F8',
    padding: 12,
    marginBottom: 18,
  },
  photoPreview: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#FFE5EC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  photoActions: {
    flex: 1,
    gap: 8,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 34,
    borderRadius: 14,
    backgroundColor: '#FFF6F8',
    borderWidth: 1.5,
    borderColor: '#FFD2DE',
  },
  photoButtonText: {
    color: '#FF8FAB',
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 2,
    borderColor: '#F0F4F8',
    color: '#334455',
    fontWeight: '700',
    marginBottom: 16,
  },
  measurementRow: {
    flexDirection: 'row',
    gap: 10,
  },
  measurementField: {
    flex: 1,
  },
  activityLevelList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  activityLevelButton: {
    borderWidth: 1,
    borderColor: '#F0E3E6',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activityLevelButtonActive: {
    borderColor: '#FF8FAB',
    backgroundColor: '#FFF0F3',
  },
  activityLevelText: {
    color: '#78909C',
    fontSize: 12,
    fontWeight: '800',
  },
  activityLevelTextActive: {
    color: '#FF6F9B',
  },
  sexRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  sexButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F0F4F8',
    alignItems: 'center',
  },
  sexButtonActive: {
    backgroundColor: '#FFE5EC',
    borderColor: '#FF8FAB',
  },
  sexText: {
    color: '#7D95A1',
    fontWeight: '900',
  },
  sexTextActive: {
    color: '#FF8FAB',
  },
  modalError: {
    color: '#D64545',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#FF8FAB',
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  deleteButton: {
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FFD2DE',
  },
  deleteButtonText: {
    color: '#D64545',
    fontSize: 15,
    fontWeight: '900',
  },
});
