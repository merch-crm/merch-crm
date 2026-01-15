import fs from 'fs';
import path from 'path';

/**
 * Удаляет файл аватара из локального хранилища
 * @param avatarPath - путь к аватару в формате /uploads/avatars/filename.jpg
 * @returns true если файл был удален, false если файл не найден или произошла ошибка
 */
export function deleteAvatarFile(avatarPath: string | null): boolean {
    if (!avatarPath || !avatarPath.startsWith('/uploads/avatars/')) {
        return false;
    }

    try {
        const filePath = path.join(process.cwd(), 'public', avatarPath);

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
 * @param oldAvatarPath - путь к старому аватару (если есть)
 * @returns путь к новому аватару
 */
export async function saveAvatarFile(
    buffer: Buffer,
    userId: string,
    oldAvatarPath: string | null = null
): Promise<string> {
    const filename = `${userId}-${Date.now()}.jpg`;
    const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');

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

    console.log(`[saveAvatarFile] Saved new avatar: ${filePath}`);

    return `/uploads/avatars/${filename}`;
}
