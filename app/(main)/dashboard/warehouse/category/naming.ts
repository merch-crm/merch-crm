const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
  'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
  'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
  'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

export const generateCategoryPrefix = (name: string): string => {
  if (!name) return"";
  const words = name.trim().split(/\s+/);
  let result ="";

  if (words.length >= 2) {
    // First letters of first two words
    result = words.slice(0, 2).map(w => w[0]).join("");
  } else {
    // First three characters of the first word
    const word = words[0];
    result = word.slice(0, Math.min(word.length, 3));
  }

  return result.toLowerCase()
    .split('')
    .map(char => RUSSIAN_TO_LATIN_MAP[char] || char)
    .join('')
    .replace(/[^a-z0-9]/g, '')
    .toUpperCase();
};

// Helper for forcing singular form of common clothing categories
export const forceSingular = (name: string, metadataSingular?: string | null) => {
  if (metadataSingular && metadataSingular.toLowerCase() !== name.toLowerCase()) return metadataSingular;
  if (!name) return"";
  const n = name.toLowerCase();
  if (n.includes("футболк")) return"Футболка";
  if (n.includes("худи")) return"Худи";
  if (n.includes("лонгслив")) return"Лонгслив";
  if (n.includes("свитшот")) return"Свитшот";
  if (n.includes("толстовк")) return"Толстовка";
  if (n.includes("куртк")) return"Куртка";
  if (n.includes("бомбер")) return"Бомбер";
  if (n.includes("шорт")) return"Шорты";
  if (n.includes("штан") || n.includes("брюк")) return"Штаны";
  if (n.includes("кепк")) return"Кепка";
  if (n.includes("шапк")) return"Шапка";
  if (n.includes("поло")) return"Поло";

  // Simple generic rule for -ки endings
  if (n.endsWith("ки")) return name.slice(0, -2) +"ка";

  return name;
};
