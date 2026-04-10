import { Category } from"../types";

/**
 * Common sorting function for categories and subcategories.
 * Sorts by sortOrder (ascending), treating 0, null, or undefined as 999999 (the end).
 */
export function sortCategories<T extends Pick<Category,"sortOrder" |"name">>(categories: T[]): T[] {
  return [...categories].sort((a, b) => {
    const vA = a.sortOrder === 0 ? 999999 : (a.sortOrder || 999999);
    const vB = b.sortOrder === 0 ? 999999 : (b.sortOrder || 999999);

    if (vA === vB) {
      return a.name.localeCompare(b.name);
    }

    return vA - vB;
  });
}
