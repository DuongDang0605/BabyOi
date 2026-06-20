import AsyncStorage from '@react-native-async-storage/async-storage';

import type { NutritionPlanResponse } from './api';

const NUTRITION_PLAN_PREFIX = 'babyoi_nutrition_plan';
const NUTRITION_PLAN_META_PREFIX = 'babyoi_nutrition_plan_meta';

export function getNutritionPlanStorageKey(profileId: number | string) {
  return `${NUTRITION_PLAN_PREFIX}:${profileId}`;
}

export function getNutritionPlanMetaStorageKey(profileId: number | string) {
  return `${NUTRITION_PLAN_META_PREFIX}:${profileId}`;
}

function validAmounts(amounts?: Record<string, string> | null) {
  if (!amounts) {
    return null;
  }
  const entries = Object.entries(amounts).filter(([ingredientId, amount]) => {
    const parsedId = Number(ingredientId);
    const parsedAmount = Number(amount);
    return Number.isInteger(parsedId) && parsedId > 0 && Number.isFinite(parsedAmount) && parsedAmount > 0;
  });
  return entries.length ? Object.fromEntries(entries) : null;
}

export async function persistNutritionPlanIngredientAmounts(plan: NutritionPlanResponse) {
  const writes = new Map<string, Record<string, string>>();
  const removals = new Set<string>();
  for (const day of plan.days || []) {
    for (const meal of day.meals || []) {
      const amounts = validAmounts(meal.ingredientAmounts);
      if (meal.ingredientStorageKey && amounts) {
        writes.set(meal.ingredientStorageKey, amounts);
        removals.delete(meal.ingredientStorageKey);
      } else if (meal.ingredientStorageKey && !writes.has(meal.ingredientStorageKey)) {
        removals.add(meal.ingredientStorageKey);
      }
    }
  }
  await Promise.all([
    ...Array.from(removals).map((storageKey) => AsyncStorage.removeItem(storageKey)),
    ...Array.from(writes.entries()).map(([storageKey, amounts]) =>
      AsyncStorage.setItem(storageKey, JSON.stringify(amounts))
    ),
  ]);
}

export async function clearNutritionPlanIngredientAmounts(plan: NutritionPlanResponse) {
  const keys = new Set<string>();
  for (const day of plan.days || []) {
    for (const meal of day.meals || []) {
      if (meal.ingredientStorageKey) {
        keys.add(meal.ingredientStorageKey);
      }
    }
  }
  await Promise.all(Array.from(keys).map((key) => AsyncStorage.removeItem(key)));
}
