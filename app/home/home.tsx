import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  InteractionManager,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import { AlertCard } from '../../components/home/AlertCard';
import { FeatureGrid } from '../../components/home/FeatureGrid';
import { HomeHeader } from '../../components/home/HomeHeader';
import { MoreFeatures } from '../../components/home/MoreFeatures';
import { TipBox } from '../../components/home/TipBox';
import {
  AiTeachingLessonResponse,
  getAiTeachingLessonsByProfile,
  getUnreadNotificationCount,
  getVaccineProgress,
  ProfileResponse,
  resolveOptimizedAssetUrl,
  VaccineProgressResponse,
} from '../../lib/api';
import { clearAuthSession } from '../../lib/auth-session';
import { clearSelectedProfile, getSelectedProfile, hydrateSelectedProfile } from '../../lib/profile-session';
import { deactivateCurrentDeviceToken, registerPushNotifications } from '../../lib/push-notifications';

const { width } = Dimensions.get('window');

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseApiDate(dateValue: string) {
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateValue.trim());
  if (isoDate) {
    return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
  }

  return new Date(dateValue);
}

function formatDisplayDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function getNearestVaccine(progressItems: VaccineProgressResponse[]) {
  const today = startOfDay(new Date()).getTime();
  let nearest: NearestVaccine = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const progress of progressItems) {
    if (progress.stopped || !progress.nextInjectionDate) {
      continue;
    }

    const date = parseApiDate(progress.nextInjectionDate);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const distance = Math.abs(startOfDay(date).getTime() - today);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = { progress, date };
    }
  }

  return nearest;
}

function getVaccineBadgeText(date: Date) {
  const today = startOfDay(new Date()).getTime();
  const target = startOfDay(date).getTime();
  const days = Math.round((target - today) / 86400000);

  if (days === 0) {
    return 'Hôm nay!';
  }
  if (days === 1) {
    return 'Ngày mai!';
  }
  if (days > 1) {
    return `Còn ${days} ngày nữa!`;
  }

  return `Quá hạn ${Math.abs(days)} ngày`;
}

function getCurrentTeachingLesson(lessons: AiTeachingLessonResponse[]) {
  return lessons.find((lesson) => lesson.progressStatus === 2)
    ?? lessons.find((lesson) => lesson.progressStatus !== 3)
    ?? lessons[0]
    ?? null;
}

function getTeachingTip(lesson: AiTeachingLessonResponse | null) {
  if (!lesson) {
    return 'Mẹ ơi, chưa có bài học AI phù hợp cho hồ sơ hiện tại. Mẹ có thể vào Giáo trình để AI đánh giá chặng tiếp theo nhé!';
  }

  const lessonAdvice = lesson.progressNote || lesson.lessonNote || lesson.description;
  const dayText = lesson.progressStatus === 2
    ? `ngày ${lesson.currentDay ?? 1}${lesson.recommendedDurationDays ? `/${lesson.recommendedDurationDays}` : ''}`
    : 'giai đoạn hiện tại';

  return lessonAdvice
    ? `AI Teaching: ${lesson.lessonName} (${dayText}). ${lessonAdvice}`
    : `AI Teaching: hôm nay mẹ cùng bé luyện "${lesson.lessonName}" ở ${dayText} nhé.`;
}

const MAIN_FEATURES = [
  { id: '1', title: 'Sức khỏe', icon: require('../../assets/images/home_optimized/home_health.png'), route: '/phattrien/growth-charts' },
  { id: '2', title: 'Sổ tiêm', icon: require('../../assets/images/home_optimized/home_vaccine.png'), route: '/lichtiem/listlichtiem' },
  { id: '3', title: 'Dinh dưỡng', icon: require('../../assets/images/home_optimized/home_nutrition.png'), route: '/dinhduong/listdoan' },
  { id: '4', title: 'Nhật ký', icon: require('../../assets/images/home_optimized/home_diary.png'), route: '/nhatki/nhatki' },
];

const MORE_FEATURES = [
  { id: '5', title: 'Cửa hàng', icon:  require('../../assets/images/home_optimized/shop.png'), route: '/coming-soon?feature=Cửa%20hàng' },
  { id: '6', title: 'Cẩm nang', icon: require('../../assets/images/home_optimized/camnangicon.png'), route: '/camnang/camnang' },
  { id: '7', title: 'Đặt lịch', icon: require('../../assets/images/home_optimized/booking.png'), route: '/coming-soon?feature=Đặt%20lịch' },
  { id: '8', title: 'Giáo trình', icon: require('../../assets/images/home_optimized/edu.png'), route: '/coming-soon?feature=Gi%C3%A1o%20tr%C3%ACnh' },
];

const DEFAULT_TEACHING_TIP = 'Mẹ ơi, vào Giáo trình để AI gợi ý hoạt động phù hợp với giai đoạn hiện tại của bé nhé!';
const HOME_WIDGET_CACHE_TTL_MS = 60_000;
const UNREAD_NOTIFICATION_CACHE_TTL_MS = 30_000;

type NearestVaccine = { progress: VaccineProgressResponse; date: Date } | null;

type HomeWidgetCache = {
  profileId: number;
  nearestVaccine: NearestVaccine;
  teachingTip: string;
  updatedAt: number;
};

let homeWidgetCache: HomeWidgetCache | null = null;
let homeWidgetRequest: Promise<HomeWidgetCache> | null = null;
let homeWidgetRequestProfileId: number | null = null;
let unreadNotificationCache: { count: number; updatedAt: number } | null = null;
let unreadNotificationRequest: Promise<number> | null = null;

async function fetchHomeWidgets(profile: ProfileResponse) {
  const [vaccineProgress, teachingLessons] = await Promise.all([
    profile.profileType === 'MOTHER'
      ? Promise.resolve([] as VaccineProgressResponse[])
      : getVaccineProgress(profile.id, { silent: true }),
    getAiTeachingLessonsByProfile(profile.id, { silent: true }),
  ]);

  const cache: HomeWidgetCache = {
    profileId: profile.id,
    nearestVaccine: getNearestVaccine(Array.isArray(vaccineProgress) ? vaccineProgress : []),
    teachingTip: getTeachingTip(getCurrentTeachingLesson(Array.isArray(teachingLessons) ? teachingLessons : [])),
    updatedAt: Date.now(),
  };

  homeWidgetCache = cache;
  return cache;
}

function getHomeWidgetCache(profileId: number) {
  return homeWidgetCache?.profileId === profileId ? homeWidgetCache : null;
}

function isHomeWidgetCacheFresh(profileId: number) {
  const cache = getHomeWidgetCache(profileId);
  return !!cache && Date.now() - cache.updatedAt < HOME_WIDGET_CACHE_TTL_MS;
}

function getFreshUnreadNotificationCount() {
  return unreadNotificationCache && Date.now() - unreadNotificationCache.updatedAt < UNREAD_NOTIFICATION_CACHE_TTL_MS
    ? unreadNotificationCache.count
    : null;
}

async function fetchUnreadNotificationCount() {
  if (!unreadNotificationRequest) {
    unreadNotificationRequest = getUnreadNotificationCount()
      .then((unread) => {
        const count = unread.count ?? 0;
        unreadNotificationCache = { count, updatedAt: Date.now() };
        return count;
      })
      .finally(() => {
        unreadNotificationRequest = null;
      });
  }

  return unreadNotificationRequest;
}

function registerPushNotificationsOnce() {
  registerPushNotifications().catch((error) => {
    console.warn('Không thể đăng ký push notification:', error);
  });
}

export default function AppHomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const currentProfileIdRef = useRef<number | null>(null);
  const [activeProfile, setActiveProfile] = useState<ProfileResponse | null>(() => getSelectedProfile());
  const [profileReady, setProfileReady] = useState(() => getSelectedProfile() !== null);
  const [nearestVaccine, setNearestVaccine] = useState<NearestVaccine>(null);
  const [vaccineReminderError, setVaccineReminderError] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(() => unreadNotificationCache?.count ?? 0);
  const [teachingTip, setTeachingTip] = useState(DEFAULT_TEACHING_TIP);

  const toggleMenu = useCallback(() => setMenuVisible((visible) => !visible), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: menuVisible ? 1 : 0,
      useNativeDriver: true,
      damping: 16,
      stiffness: 180,
      mass: 0.7,
    }).start();
  }, [menuAnim, menuVisible]);

  useFocusEffect(useCallback(() => {
    let mounted = true;
    let interactionTask: { cancel?: () => void } | null = null;

    const refreshUnread = async () => {
      try {
        const count = await fetchUnreadNotificationCount();
        if (mounted) {
          setUnreadNotificationCount(count);
        }
      } catch {
        if (mounted) {
          setUnreadNotificationCount(0);
        }
      }
    };

    const refreshWidgets = async (profile: ProfileResponse) => {
      try {
        if (!homeWidgetRequest || homeWidgetRequestProfileId !== profile.id) {
          homeWidgetRequestProfileId = profile.id;
          const request = fetchHomeWidgets(profile).finally(() => {
            if (homeWidgetRequest === request) {
              homeWidgetRequest = null;
              homeWidgetRequestProfileId = null;
            }
          });
          homeWidgetRequest = request;
        }

        const widgets = await homeWidgetRequest;

        if (mounted && widgets.profileId === currentProfileIdRef.current) {
          setNearestVaccine(widgets.nearestVaccine);
          setTeachingTip(widgets.teachingTip);
          setVaccineReminderError(false);
        }
      } catch (error) {
        console.error('Không thể tải dữ liệu home:', error);
        if (mounted) {
          setVaccineReminderError(true);
        }
      }
    };

    async function loadHomeData() {
        const cachedUnread = getFreshUnreadNotificationCount();
      if (cachedUnread !== null) {
        setUnreadNotificationCount(cachedUnread);
      }

      try {
        const profile = getSelectedProfile() || await hydrateSelectedProfile();
        if (!mounted) {
          return;
        }

        setProfileReady(true);
        setActiveProfile(profile);
        const previousProfileId = currentProfileIdRef.current;
        currentProfileIdRef.current = profile?.id ?? null;

        if (!profile?.id) {
          setNearestVaccine(null);
          setVaccineReminderError(false);
          setTeachingTip(DEFAULT_TEACHING_TIP);
          interactionTask = InteractionManager.runAfterInteractions(() => {
            void refreshUnread();
            registerPushNotificationsOnce();
          });
          return;
        }

        const cachedWidgets = getHomeWidgetCache(profile.id);
        if (cachedWidgets) {
          setNearestVaccine(cachedWidgets.nearestVaccine);
          setTeachingTip(cachedWidgets.teachingTip);
          setVaccineReminderError(false);
        } else if (previousProfileId !== profile.id) {
          setNearestVaccine(null);
          setTeachingTip(DEFAULT_TEACHING_TIP);
          setVaccineReminderError(false);
        }

        const shouldRefreshWidgets = !isHomeWidgetCacheFresh(profile.id);

        interactionTask = InteractionManager.runAfterInteractions(() => {
          if (shouldRefreshWidgets) {
            void refreshWidgets(profile);
          }
          void refreshUnread();
          registerPushNotificationsOnce();
        });
      } catch (error) {
        console.error('Không thể tải dữ liệu home:', error);
        if (mounted) {
          setProfileReady(true);
          setVaccineReminderError(true);
          interactionTask = InteractionManager.runAfterInteractions(() => {
            void refreshUnread();
            registerPushNotificationsOnce();
          });
        }
      }

    }

    loadHomeData();
    return () => {
      mounted = false;
      interactionTask?.cancel?.();
    };
  }, []));

  const handleFeaturePress = useCallback((route: string) => {
    if (route === '/dinhduong/listdoan') {
      router.push({
        pathname: '/dinhduong/listdoan',
        params: { openedFrom: 'home', entryKey: String(Date.now()) },
      });
      return;
    }

    if (route !== '#') {
      router.push(route as any);
    }
  }, []);

  const handleNotificationPress = useCallback(() => {
    router.push('/notification/notifications');
  }, []);

  const handleLogout = useCallback(async () => {
    await deactivateCurrentDeviceToken();
    await clearSelectedProfile();
    await clearAuthSession();
    router.replace('/auth/login');
  }, []);

  const profileName = activeProfile?.name || 'Mẹ';
  const profileAge = activeProfile ? getProfileSubtitle(activeProfile) : 'Chọn hồ sơ để bắt đầu';
  const profileAvatarUrl = resolveOptimizedAssetUrl(activeProfile?.imageUrl, 'avatar');
  const profileAvatar = useMemo(
    () => profileAvatarUrl ? { uri: profileAvatarUrl } : require('../../assets/images/home_optimized/avatar.png'),
    [profileAvatarUrl]
  );
  const isMotherProfile = activeProfile?.profileType === 'MOTHER';
  const showVaccineReminder = profileReady && activeProfile?.profileType !== 'MOTHER';
  const profileMenuLabel = isMotherProfile ? 'Hồ sơ của mẹ' : activeProfile?.profileType === 'CHILD' ? 'Hồ sơ của bé' : 'Hồ sơ';
  const reminderSubtitle = nearestVaccine
    ? `${nearestVaccine.progress.diseaseName || 'Mũi tiêm tiếp theo'} - ${formatDisplayDate(nearestVaccine.date)}`
    : activeProfile
      ? (vaccineReminderError ? 'Chưa tải được lịch tiêm. Thử lại sau mẹ nhé.' : 'Chưa có lịch tiêm sắp tới.')
      : 'Chọn hồ sơ để xem lịch tiêm.';
  const reminderBadgeText = nearestVaccine ? getVaccineBadgeText(nearestVaccine.date) : 'Sổ tiêm chủng';

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#FEF9F3', '#FFF5F8', '#F1FBFA']} style={styles.screenGlow} />
      <View pointerEvents="none" style={styles.backgroundAccentTop} />
      <View pointerEvents="none" style={styles.backgroundAccentMid} />
      <View pointerEvents="none" style={styles.backgroundAccentMint} />
      <View pointerEvents="none" style={styles.backgroundAccentYellow} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View pointerEvents="none" style={styles.backgroundStripe} />
        <View pointerEvents="none" style={styles.backgroundHeart}>
          <Ionicons name="heart" size={30} color="#FF9DBA" />
        </View>
        <View pointerEvents="none" style={styles.backgroundSparkleOne}>
          <Ionicons name="sparkles" size={22} color="#FFD36E" />
        </View>
        <View pointerEvents="none" style={styles.backgroundSparkleTwo}>
          <Ionicons name="sparkles-outline" size={20} color="#83DDF1" />
        </View>

        {/* --- Header --- */}
        <HomeHeader
          babyName={profileName}
          babyAge={profileAge}
          avatarSource={profileAvatar}
          onAvatarPress={toggleMenu}
          unreadCount={unreadNotificationCount}
          onNotificationPress={handleNotificationPress}
        />

        {/* --- ALERT CARD --- */}
        {showVaccineReminder && (
          <AlertCard
            title="Lịch tiêm nhắc bé"
            subtitle={reminderSubtitle}
            badgeText={reminderBadgeText}
          />
        )}

        {/* --- PHẦN 1: CHĂM SÓC BÉ --- */}
        <FeatureGrid
          title="Chăm sóc bé 🧸"
          features={MAIN_FEATURES}
          onFeaturePress={handleFeaturePress}
        />

        {/* --- PHẦN 2: TIỆN ÍCH THÊM --- */}
        <MoreFeatures
          title="Tiện ích thêm ✨"
          features={MORE_FEATURES}
          onFeaturePress={handleFeaturePress}
        />

        {/* --- TIP BOX --- */}
        <TipBox
          tip={teachingTip}
        />

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- Floating AI Button --- */}
      <View pointerEvents="none" style={styles.aiButtonHalo} />
      <TouchableOpacity style={styles.floatingAiButton} onPress={() => router.push('/AI/chatboxAI')}>
        <View style={styles.aiImageContainer}>
          <Image
            source={require('../../assets/images/home_optimized/ai_chatbox.png')}
            style={styles.aiButtonImage}
            contentFit="contain"
            cachePolicy="memory-disk"
            priority="high"
          />
        </View>
        <Text style={styles.aiLabel}>Hỏi AI</Text>
      </TouchableOpacity>

      {/* --- MODAL MENU DROPDOWN KHI BẤM VÀO AVATAR --- */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.menuContainer,
                  {
                    opacity: menuAnim,
                    transform: [
                      {
                        translateY: menuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-16, 0],
                        }),
                      },
                      {
                        scale: menuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.96, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.menuArrow} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); router.push('/profile/profile'); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E8F9ED' }]}>
                    <Ionicons name="person-outline" size={18} color="#2E7D32" />
                  </View>
                  <Text style={styles.menuText}>{profileMenuLabel}</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); router.push('/profile/select-profile'); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FFF4D6' }]}>
                    <Ionicons name="people-outline" size={18} color="#FF9800" />
                  </View>
                  <Text style={styles.menuText}>Đổi hồ sơ</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); router.push('/setting/setting'); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="settings-outline" size={18} color="#2196F3" />
                  </View>
                  <Text style={styles.menuText}>Cài đặt</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); handleLogout(); }}>
                  <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
                    <Ionicons name="log-out-outline" size={18} color="#F44336" />
                  </View>
                  <Text style={[styles.menuText, { color: '#F44336' }]}>Đăng xuất</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

function getProfileSubtitle(profile: ProfileResponse) {
  const dob = parseProfileDate(profile.dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return profile.profileType === 'MOTHER' ? 'Hồ sơ mẹ' : 'Hồ sơ bé';
  }

  const now = new Date();
  const months = Math.max(0, (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth());
  if (profile.profileType === 'CHILD') {
    if (months === 0) {
      const days = Math.max(0, Math.floor((startOfDay(now).getTime() - startOfDay(dob).getTime()) / 86400000));
      return `${days} ngày tuổi`;
    }

    return months < 24 ? `${months} tháng tuổi` : '2 tuổi';
  }

  const years = now.getFullYear() - dob.getFullYear() - (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
  return `${years} tuổi`;
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FEF9F3' },
  screenGlow: { ...StyleSheet.absoluteFillObject },
  scrollContainer: { paddingHorizontal: 20 },
  backgroundAccentTop: {
    position: 'absolute',
    top: 52,
    left: -36,
    width: 150,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 182, 193, 0.18)',
    transform: [{ rotate: '-18deg' }],
  },
  backgroundAccentMid: {
    position: 'absolute',
    top: 260,
    right: -50,
    width: 170,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 143, 171, 0.12)',
    transform: [{ rotate: '18deg' }],
  },
  backgroundAccentMint: {
    position: 'absolute',
    top: 540,
    left: -42,
    width: 138,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(184, 239, 207, 0.28)',
    transform: [{ rotate: '20deg' }],
  },
  backgroundAccentYellow: {
    position: 'absolute',
    top: 628,
    right: 24,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 209, 102, 0.55)',
  },
  backgroundStripe: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 148,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 225, 234, 0.9)',
  },
  backgroundHeart: {
    position: 'absolute',
    top: 176,
    right: 36,
    opacity: 0.38,
    transform: [{ rotate: '14deg' }],
  },
  backgroundSparkleOne: {
    position: 'absolute',
    top: 118,
    left: 32,
    opacity: 0.78,
    transform: [{ rotate: '-10deg' }],
  },
  backgroundSparkleTwo: {
    position: 'absolute',
    top: 468,
    right: 30,
    opacity: 0.7,
    transform: [{ rotate: '18deg' }],
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menuContainer: {
    position: 'absolute',
    top: 108,
    right: 18,
    width: Math.min(245, width - 40),
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 50,
  },
  menuArrow: {
    position: 'absolute',
    top: -8,
    right: 28,
    width: 16,
    height: 16,
    backgroundColor: '#FFF',
    transform: [{ rotate: '45deg' }],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5C7A8A',
  },
  menuDivider: {
    height: 1.5,
    backgroundColor: '#F0F4F8',
    marginVertical: 2,
    marginHorizontal: 10,
  },

  aiButtonHalo: { position: 'absolute', bottom: 22, right: 12, width: 138, height: 78, borderRadius: 39, backgroundColor: 'rgba(255, 143, 171, 0.22)' },
  floatingAiButton: { position: 'absolute', bottom: 28, right: 18, backgroundColor: '#FF6F9B', paddingLeft: 10, paddingRight: 22, height: 68, borderRadius: 34, flexDirection: 'row', alignItems: 'center', elevation: 10, shadowColor: '#FF6F9B', shadowOpacity: 0.55, shadowRadius: 16, borderWidth: 2, borderColor: '#FFFFFF' },
  aiImageContainer: { width: 58, height: 58, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  aiButtonImage: { width: 64, height: 64 },
  aiLabel: { color: '#FFF', fontWeight: '900', fontSize: 17 },
});
