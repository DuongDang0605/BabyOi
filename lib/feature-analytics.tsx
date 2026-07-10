import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { trackFeatureView } from './api';
import { getAuthSession, hydrateAuthSession } from './auth-session';

type FeatureInfo = {
  featureKey: string;
  featureName: string;
};

type FeatureRoute = FeatureInfo & {
  prefix: string;
};

const TRACK_DEBOUNCE_MS = 700;
const SAME_ROUTE_COOLDOWN_MS = 15000;

const FEATURE_ROUTES: FeatureRoute[] = [
  { prefix: '/home', featureKey: 'home', featureName: 'Trang chủ' },
  { prefix: '/dinhduong', featureKey: 'nutrition', featureName: 'Dinh dưỡng' },
  { prefix: '/lichtiem', featureKey: 'vaccine', featureName: 'Lịch tiêm' },
  { prefix: '/phattrien', featureKey: 'growth_health', featureName: 'Phát triển và sức khỏe' },
  { prefix: '/nhatki', featureKey: 'diary', featureName: 'Nhật ký' },
  { prefix: '/camnang', featureKey: 'handbook', featureName: 'Cẩm nang' },
  { prefix: '/notification', featureKey: 'notification', featureName: 'Thông báo' },
  { prefix: '/profile', featureKey: 'profile', featureName: 'Hồ sơ' },
  { prefix: '/setting', featureKey: 'settings', featureName: 'Cài đặt' },
  { prefix: '/datlich', featureKey: 'booking', featureName: 'Đặt lịch' },
  { prefix: '/AI/chatboxAI', featureKey: 'ai_chat', featureName: 'AI chat' },
  { prefix: '/AI/lesson', featureKey: 'ai_learning', featureName: 'AI bài học' },
  { prefix: '/AI/edu', featureKey: 'ai_learning', featureName: 'AI bài học' },
  { prefix: '/AI/result', featureKey: 'ai_learning', featureName: 'AI bài học' },
  { prefix: '/AI', featureKey: 'ai', featureName: 'AI' },
];

const IGNORED_PREFIXES = [
  '/auth',
  '/legal',
  '/error',
  '/modal',
  '/coming-soon',
];

function normalizePathname(pathname: string) {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
}

export function resolveFeatureFromPathname(pathname: string): FeatureInfo | null {
  const normalizedPathname = normalizePathname(pathname);

  if (IGNORED_PREFIXES.some((prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`))) {
    return null;
  }

  const route = FEATURE_ROUTES.find((item) => (
    normalizedPathname === item.prefix || normalizedPathname.startsWith(`${item.prefix}/`)
  ));

  if (!route) {
    return null;
  }

  return {
    featureKey: route.featureKey,
    featureName: route.featureName,
  };
}

export function FeatureAnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<{ featureKey: string; pathname: string; trackedAt: number } | null>(null);

  useEffect(() => {
    const normalizedPathname = normalizePathname(pathname);
    const feature = resolveFeatureFromPathname(normalizedPathname);

    if (!feature) {
      return undefined;
    }

    const now = Date.now();
    const lastTracked = lastTrackedRef.current;

    if (
      lastTracked?.featureKey === feature.featureKey
      && lastTracked.pathname === normalizedPathname
      && now - lastTracked.trackedAt < SAME_ROUTE_COOLDOWN_MS
    ) {
      return undefined;
    }

    lastTrackedRef.current = {
      featureKey: feature.featureKey,
      pathname: normalizedPathname,
      trackedAt: now,
    };

    let cancelled = false;
    const timer = setTimeout(() => {
      void (async () => {
        const session = getAuthSession() || await hydrateAuthSession();
        if (cancelled || !session?.accessToken) {
          return;
        }

        await trackFeatureView(feature);
      })().catch(() => undefined);
    }, TRACK_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
