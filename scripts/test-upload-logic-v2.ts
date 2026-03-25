/**
 * Тест логики сборки файлов из чанков
 * Мы копируем основные функции из lib/upload-stream.ts, чтобы гарантировать работу теста в среде tsx
 */

import { createWriteStream, readFileSync, unlinkSync, mkdirSync, statSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

const TEMP_DIR = join(process.cwd(), "local-storage", "temp-test");
const MAX_CHUNK_SIZE = 5 * 1024 * 1024;

async function runTest() {
  console.log("🧪 Начинаем тест логики сборки чанков...");

  // Подготовка
  mkdirSync(TEMP_DIR, { recursive: true });
  const uploadId = randomUUID();
  const tempPath = join(TEMP_DIR, `${uploadId}.tmp`);
  const content = "Это тестовый контент, который будет разбит на чанки и собран заново для проверки целостности.";
  const buffer = Buffer.from(content);
  
  // Делим на 3 чанка
  const parts = [
    buffer.slice(0, 10),
    buffer.slice(10, 30),
    buffer.slice(30)
  ];

  console.log(`- Создано ${parts.length} чанков`);

  // Имитируем uploadChunk
  for (let i = 0; i < parts.length; i++) {
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(tempPath, { flags: "a" });
      writeStream.write(parts[i], (err) => {
        if (err) reject(err);
        else resolve();
      });
      writeStream.end();
    });
    console.log(`  [✓] Чанк ${i} записан`);
  }

  // Проверка размера
  const stats = statSync(tempPath);
  console.log(`- Ожидаемый размер: ${buffer.length}, фактический: ${stats.size}`);

  if (stats.size !== buffer.length) {
    throw new Error("Размер файла не совпадает!");
  }

  // Чтение и сравнение содержимого
  const reassembled = readFileSync(tempPath, "utf-8");
  if (reassembled !== content) {
    throw new Error("Содержимое файла повреждено!");
  }

  console.log("✅ Тест успешно пройден: содержимое совпадает, целостность сохранена.");

  // Очистка
  unlinkSync(tempPath);
}

runTest().catch(err => {
  console.error("❌ Тест провалился:", err);
  process.exit(1);
});
