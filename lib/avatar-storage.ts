import fs from 'fs';
import path from 'path';
import { LOCAL_STORAGE_ROOT } from './local-storage';

/**
 * Удаляет файл аватара из локального хранилища
 * @param avatarPath - путь к аватару в формате /api/storage/avatars/filename.jpg
 * @returns true если файл был удален, false если файл не найден или произошла ошибка
 */
export function deleteAvatarFile(avatarPath: string | null): boolean {
    if (!avatarPath || !avatarPath.startsWith('/api/storage/avatars/')) {
        return false;
    }

    try {
        const filename = avatarPath.replace('/api/storage/avatars/', '');
        const filePath = path.join(LOCAL_STORAGE_ROOT, 'avatars', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[deleteAvatarFile] Successfully deleted: ${filePath}`);
            return true;
        } else {
            console.log(`[deleteAvatarFile] File not found: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`[deleteAvatarFile] Error deleting avatar:`, error);
        return false;
    }
}

/**
 * Сохраняет новый файл аватара и удаляет старый
 * @param buffer - буфер с данными изображения
 * @param userId - ID пользователя
 * @param username - имя пользователя для именования файла
 * @param oldAvatarPath - путь к старому аватару (если есть)
 * @returns путь к новому аватару (URL)
 */
export async function saveAvatarFile(
    buffer: Buffer,
    userId: string,
    username: string,
    oldAvatarPath: string | null = null
): Promise<string> {
    // Sanitize username for filename
    const safeUsername = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `avatar_${safeUsername}_${Date.now()}.jpg`;
    const uploadDir = path.join(LOCAL_STORAGE_ROOT, 'avatars');

    // Создаем директорию если не существует
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Удаляем старый аватар
    if (oldAvatarPath) {
        deleteAvatarFile(oldAvatarPath);
    }

    // Сохраняем новый файл
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    console.log(`[saveAvatarFile] Saved new avatar to local storage: ${filePath}`);

    // Return the URL that will be served via our API route
    return `/api/storage/avatars/${filename}`;
}

