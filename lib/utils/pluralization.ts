/**
 * pkPlural: Russian pluralization helper.
 * Handles cases like: 1 день, 2 дня, 5 дней.
 * 
 * @param count - The quantity.
 * @param one - Form for 1 (e.g., 'день').
 * @param two - Form for 2, 3, 4 (e.g., 'дня').
 * @param five - Form for 5, 6, 7, 8, 9, 0, 11-14 (e.g., 'дней').
 * @returns The correct form based on the count.
 */
export function pkPlural(count: number, one: string, two: string, five: string): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

/**
 * pkFormatNumber: Formats a number with thousands separators (Russian style/Space).
 */
export function pkFormatNumber(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n);
}
