/**
 * Скрипт для очистки неиспользуемых файлов аватаров
 * 
 * Находит все файлы в /public/uploads/avatars/ и удаляет те,
 * которые не привязаны ни к одному пользователю в базе данных
 * 
 * Запуск: npx tsx scripts/cleanup-avatars.ts
 */

import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import fs from 'fs';
import path from 'path';

async function cleanupUnusedAvatars() {
    console.log('🧹 Starting avatar cleanup...\n');

    const avatarsDir = path.join(process.cwd(), 'public/uploads/avatars');

    // Проверяем существование директории
    if (!fs.existsSync(avatarsDir)) {
        console.log('✅ Avatar directory does not exist. Nothing to clean.');
        return;
    }

    // Получаем все файлы из директории
    const allFiles = fs.readdirSync(avatarsDir);
    console.log(`📁 Found ${allFiles.length} files in avatars directory`);

    // Получаем все аватары из базы данных
    const allUsers = await db.select({ avatar: users.avatar }).from(users);
    const usedAvatars = new Set(
        allUsers
            .map(u => u.avatar)
            .filter(Boolean)
            .map(avatar => avatar!.replace('/uploads/avatars/', ''))
    );

    console.log(`👥 Found ${usedAvatars.size} avatars in use by users\n`);

    // Находим неиспользуемые файлы
    const unusedFiles = allFiles.filter(file => !usedAvatars.has(file));

    if (unusedFiles.length === 0) {
        console.log('✅ No unused avatar files found. Everything is clean!');
        return;
    }

    console.log(`🗑️  Found ${unusedFiles.length} unused files:\n`);

    let deletedCount = 0;
    let totalSize = 0;

    for (const file of unusedFiles) {
        const filePath = path.join(avatarsDir, file);
        try {
            const stats = fs.statSync(filePath);
            totalSize += stats.size;

            fs.unlinkSync(filePath);
            deletedCount++;
            console.log(`   ✓ Deleted: ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        } catch (error) {
            console.error(`   ✗ Failed to delete ${file}:`, error);
        }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Files deleted: ${deletedCount}/${unusedFiles.length}`);
    console.log(`   Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

// Запуск скрипта
cleanupUnusedAvatars()
    .then(() => {
        console.log('\n🎉 Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error during cleanup:', error);
        process.exit(1);
    });
