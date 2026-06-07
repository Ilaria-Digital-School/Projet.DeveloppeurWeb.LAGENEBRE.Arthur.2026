const CATEGORY_ICON_KINDS = ['cake', 'croissant', 'dish', 'glass', 'salad', 'snack'] as const;

type KnownCategoryIconKind = typeof CATEGORY_ICON_KINDS[number];

export type CategoryIconKind = KnownCategoryIconKind | 'default';

const CATEGORY_ICON_SET = new Set<string>(CATEGORY_ICON_KINDS);

export function resolveCategoryIconKind(iconName: string): CategoryIconKind {
  const key = iconName.trim().toLowerCase();

  if (CATEGORY_ICON_SET.has(key))
    return key as KnownCategoryIconKind;

  return 'default';
}