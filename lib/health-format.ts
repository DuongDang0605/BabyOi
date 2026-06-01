export type HealthFilterMode = 'all' | 'day' | 'month' | 'year';

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function toDisplayDate(isoDate?: string | null) {
  if (!isoDate) {
    return '--/--/----';
  }

  const [year, month, day] = isoDate.split('-');
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
}

export function toDisplayMonth(isoDate?: string | null) {
  if (!isoDate) {
    const now = new Date();
    return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  }

  const [year, month] = isoDate.split('-');
  return year && month ? `${month}/${year}` : isoDate;
}

export function parseDisplayDateToIso(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function getFilterParams(mode: HealthFilterMode) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = todayIsoDate();

  if (mode === 'day') {
    return { fromDate: day, toDate: day };
  }
  if (mode === 'month') {
    return { month, year };
  }
  if (mode === 'year') {
    return { year };
  }
  return {};
}

export function formatNullableNumber(value?: number | null, digits = 1) {
  return value == null || Number.isNaN(value) ? '-' : Number(value).toFixed(digits);
}

export function getIllnessStatusLabel(status?: number | null, fallback?: string | null) {
  if (fallback) {
    return fallback;
  }
  if (status === 1) {
    return 'Nhẹ';
  }
  if (status === 3) {
    return 'Cần chú ý';
  }
  return 'Bình thường';
}

export function getIllnessStatusCode(label: string) {
  if (label === 'Nhẹ') {
    return 1;
  }
  if (label === 'Cần chú ý') {
    return 3;
  }
  return 2;
}
