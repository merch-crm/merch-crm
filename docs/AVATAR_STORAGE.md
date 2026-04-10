# 📸 Управление аватарами пользователей

## Архитектура хранения

### Локальное хранилище
Аватары пользователей хранятся **локально на сервере** в директории:
```
/public/uploads/avatars/
```

### Формат имени файла
```
{userId}-{timestamp}.jpg
```
Пример: `550e8400-e29b-41d4-a716-446655440000-1768501143859.jpg`

---

## Автоматическое удаление старых файлов

При загрузке нового аватара система **автоматически удаляет** предыдущий файл пользователя.

### Логика работы:
1. Пользователь загружает новый аватар
2. Система проверяет наличие старого аватара в БД
3. Если старый файл существует → удаляется из `/public/uploads/avatars/`
4. Новый файл сохраняется
5. Путь обновляется в базе данных

### Код реализации:
```typescript
import { saveAvatarFile } from "@/lib/avatar-storage";

// Автоматически удалит старый и сохранит новый
const avatarPath = await saveAvatarFile(
  buffer,      // Buffer с изображением
  userId,      // ID пользователя
  oldAvatarPath   // Путь к старому аватару (опционально)
);
```

---

## Обслуживание и очистка

### Скрипт очистки неиспользуемых файлов

Для удаления "осиротевших" файлов (которые не привязаны ни к одному пользователю):

```bash
npx tsx scripts/cleanup-avatars.ts
```

**Что делает скрипт:**
- Сканирует `/public/uploads/avatars/`
- Сравнивает с записями в таблице `users`
- Удаляет файлы, которых нет в базе данных
- Выводит отчет об освобожденном месте

**Когда запускать:**
- После массового удаления пользователей
- Раз в месяц для профилактики
- При подозрении на "мусорные" файлы

---

## Почему локальное хранилище?

### ✅ Преимущества:
- **Скорость**: Мгновенная загрузка без задержек S3
- **Надежность**: Нет зависимости от внешнего сервиса
- **Безопасность**: Файлы под контролем сервера
- **Простота**: Не нужны API ключи для системных файлов

### S3 используется для:
- Документы заказов (PDF, макеты)
- Временные файлы (кэш, экспорты)
- Большие файлы (архивы, бэкапы)

---

## API функции

### `saveAvatarFile(buffer, userId, oldAvatarPath?)`
Сохраняет новый аватар и удаляет старый.

**Параметры:**
- `buffer: Buffer` - данные изображения
- `userId: string` - ID пользователя
- `oldAvatarPath: string | null` - путь к старому файлу (опционально)

**Возвращает:** `Promise<string>` - путь к новому файлу

---

### `deleteAvatarFile(avatarPath)`
Удаляет файл аватара.

**Параметры:**
- `avatarPath: string | null` - путь вида `/uploads/avatars/file.jpg`

**Возвращает:** `boolean` - успешность удаления

---

## Примеры использования

### Обновление аватара в профиле
```typescript
// app/dashboard/profile/actions.ts
const buffer = Buffer.from(await avatarFile.arrayBuffer());
const currentUser = await db.query.users.findFirst({
  where: eq(users.id, session.id),
  columns: { avatar: true }
});

updateData.avatar = await saveAvatarFile(
  buffer,
  session.id,
  currentUser?.avatar || null
);
```

### Удаление пользователя с аватаром
```typescript
import { deleteAvatarFile } from "@/lib/avatar-storage";

const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
});

// Удаляем аватар перед удалением пользователя
if (user?.avatar) {
  deleteAvatarFile(user.avatar);
}

await db.delete(users).where(eq(users.id, userId));
```

---

## Мониторинг

### Проверка размера директории
```bash
ssh root@89.104.69.25
du -sh /root/merch-crm/public/uploads/avatars/
```

### Подсчет файлов
```bash
ls -1 /root/merch-crm/public/uploads/avatars/ | wc -l
```

---

## Troubleshooting

### Проблема: Аватар не отображается
**Решение:**
1. Проверьте путь в БД: `SELECT avatar FROM users WHERE id = '...'`
2. Убедитесь что файл существует: `ls public/uploads/avatars/`
3. Проверьте права доступа: `chmod 755 public/uploads/avatars/`

### Проблема: Старые файлы не удаляются
**Решение:**
1. Запустите скрипт очистки: `npx tsx scripts/cleanup-avatars.ts`
2. Проверьте логи сервера на ошибки удаления
3. Убедитесь что процесс Node.js имеет права на запись

---

## Бэкап

Аватары включены в общий бэкап сервера. Дополнительно можно создать архив:

```bash
cd /root/merch-crm/public/uploads
tar -czf avatars-backup-$(date +%Y%m%d).tar.gz avatars/
```
