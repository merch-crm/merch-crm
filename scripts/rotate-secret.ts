#!/usr/bin/env npx tsx
/**
 * Скрипт ротации AUTH_SECRET
 * 
 * Использование:
 *   npx tsx scripts/rotate-secret.ts
 * 
 * Что делает:
 *   1. Генерирует новый секрет
 *   2. Выводит инструкции по обновлению .env
 *   3. Напоминает о сроках удаления старого секрета
 */

import { randomBytes } from "crypto";
// Используем относительный импорт для работы скрипта через tsx
import { getRotationStatus } from "../lib/secrets-rotation";

function generateSecureSecret(): string {
  // 64 байта в base64url — это безопасная и длинная строка
  return randomBytes(64).toString("base64url");
}

async function main() {
  console.log("\n🔐 Ротация AUTH_SECRET\n");
  console.log("=".repeat(50));

  // Проверяем текущий статус
  const status = getRotationStatus();
  
  if (status.inProgress) {
    console.log("\n⚠️  ВНИМАНИЕ: Ротация уже в процессе!");
    console.log("   Завершите текущую ротацию перед началом новой.");
    console.log("   Удалите AUTH_SECRET_PREVIOUS из .env\n");
    process.exit(1);
  }

  // Генерируем новый секрет
  const newSecret = generateSecureSecret();
  const currentSecret = process.env.AUTH_SECRET || "CHANGE_ME_IF_NOT_SET";

  console.log("\n📋 Инструкции по ротации:\n");
  
  console.log("1. Обновите .env файл:\n");
  console.log("   # Новый секрет (замените текущий)");
  console.log(`   AUTH_SECRET=${newSecret}`);
  console.log("");
  console.log("   # Старый секрет (добавьте для плавного перехода)");
  console.log(`   AUTH_SECRET_PREVIOUS=${currentSecret}`);
  
  console.log("\n2. Перезапустите приложение\n");
  
  console.log("3. Через 7 дней удалите AUTH_SECRET_PREVIOUS\n");
  
  console.log("=".repeat(50));
  
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 7);
  
  console.log(`\n📅 Напоминание: удалить старый секрет после ${expirationDate.toLocaleDateString("ru-RU")}\n`);
}

main().catch(console.error);
