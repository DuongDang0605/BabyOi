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
import { ApiError, ProfilePayload, ProfileResponse, updateProfile, updateProfileAvatar, uploadProfileAvatar } from '../../lib/api';
import { clearAuthSession } from '../../lib/auth-session';
import { clearSelectedProfile, getSelectedProfile, hydrateSelectedProfile, setSelectedProfile } from '../../lib/profile-session';

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

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editError, setEditError] = useState('');
  const [form, setForm] = useState<ProfilePayload | null>(null);

  useFocusEffect(useCallback(() => {
    let mounted = true;

    async function loadProfile() {
      const selected = getSelectedProfile() || await hydrateSelectedProfile();
      if (mounted) {
        setProfile(selected);
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
    { id: '4', title: 'Cài đặt tài khoản', icon: 'settings-outline', color: '#7a8c99', route: '/setting/setting' },
  ];

  const displayName = profile?.name || 'Chưa chọn hồ sơ';
  const displayDob = profile?.dateOfBirth || 'Chưa có ngày sinh';
  const displayGender = profile?.sex === 'MALE' ? 'Nam' : profile?.sex === 'FEMALE' ? 'Nữ' : 'Khác';
  const displayAvatar = profile?.imageUrl ? { uri: profile.imageUrl } : require('../../assets/images/avt.png');

  const handleLogout = async () => {
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
      sex: profileType === 'MOTHER' ? 'FEMALE' : profile.sex === 'MALE' || profile.sex === 'FEMALE' || profile.sex === 'OTHER' ? profile.sex : 'OTHER',
      profileType,
      profileCode: profile.profileCode,
      functionCode: profile.functionCode,
      imageUrl: profile.imageUrl,
    });
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

    const validationError = validateProfileForm(form);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setEditError('');
      const updated = await updateProfile(profile.id, {
        ...form,
        name: form.name.trim(),
      });
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <CustomHeader
        title="Hồ Sơ Của Bé"
        rightElement={
          <TouchableOpacity onPress={() => router.push('/setting/setting')}>
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
        />

        {/* --- THỐNG KÊ NHANH --- */}
        <View style={styles.statsRow}>
          <StatCard
            label="Cân nặng"
            value="-"
            icon="speedometer-outline"
            color="#FF8FAB"
          />
          <StatCard
            label="Chiều cao"
            value="-"
            icon="resize-outline"
            color="#FFD166"
          />
        </View>
        <View style={[styles.statsRow, { marginTop: 15 }]}>
          <StatCard
            label="Mũi đã tiêm"
            value="-"
            icon="checkmark-circle-outline"
            color="#4CAF50"
          />
          <StatCard
            label="BMI"
            value="16.4"
            icon="bar-chart-outline"
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
                  placeholder="MM/DD/YYYY"
                  keyboardType="number-pad"
                  maxLength={10}
                  value={form.dateOfBirth}
                  onChangeText={(dateOfBirth) => setForm((current) => current ? { ...current, dateOfBirth: normalizeProfileDateInput(dateOfBirth) } : current)}
                />

                <Text style={styles.label}>Giới tính</Text>
                <View style={styles.sexRow}>
                  {(['FEMALE', 'MALE', 'OTHER'] as const).map((sex) => (
                    <TouchableOpacity
                      key={sex}
                      style={[styles.sexButton, form.sex === sex && styles.sexButtonActive]}
                      onPress={() => setForm((current) => current ? { ...current, sex } : current)}
                      disabled={form.profileType === 'MOTHER' && sex !== 'FEMALE'}
                    >
                      <Text style={[styles.sexText, form.sex === sex && styles.sexTextActive]}>
                        {sex === 'FEMALE' ? 'Nữ' : sex === 'MALE' ? 'Nam' : 'Khác'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {!!editError && <Text style={styles.modalError}>{editError}</Text>}

                <TouchableOpacity style={[styles.saveButton, (submitting || imageUploading) && styles.disabledButton]} onPress={submitUpdateProfile} disabled={submitting || imageUploading}>
                  {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>{imageUploading ? 'Đang tải ảnh...' : 'Lưu thay đổi'}</Text>}
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
});
