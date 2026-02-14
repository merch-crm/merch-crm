#!/bin/bash
# =============================================================================
# Автоматическое резервное копирование PostgreSQL для MerchCRM
# Расположение на сервере: /root/scripts/backup-db.sh
# Запуск: bash /root/scripts/backup-db.sh
# Cron:   0 3 * * * root /root/scripts/backup-db.sh >> /var/log/merch-backup.log 2>&1
# =============================================================================

set -euo pipefail

# ---------- Конфигурация ----------
BACKUP_DIR="/root/backups/postgres"
CONTAINER_NAME="merch-crm-db"
DB_USER="postgres"
DB_NAME="postgres"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_HUMAN=$(date '+%Y-%m-%d %H:%M:%S')

# ---------- Инициализация ----------
mkdir -p "$BACKUP_DIR"

echo "========================================"
echo "[MerchCRM Backup] Начало: $DATE_HUMAN"
echo "========================================"

# ---------- 1. Проверка контейнера ----------
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "[ОШИБКА] Контейнер $CONTAINER_NAME не запущен!"
    exit 1
fi

echo "[OK] Контейнер $CONTAINER_NAME найден и работает."

# ---------- 2. Полный бэкап (Custom Format, сжатый) ----------
FULL_BACKUP="$BACKUP_DIR/merch_crm_${TIMESTAMP}.dump"
echo "[...] Создание полного бэкапа (pg_dump -Fc)..."

docker exec "$CONTAINER_NAME" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -Fc \
    --no-owner \
    --no-privileges \
    > "$FULL_BACKUP"

FULL_SIZE=$(du -sh "$FULL_BACKUP" | cut -f1)
echo "[OK] Полный бэкап: $FULL_BACKUP ($FULL_SIZE)"

# ---------- 3. Бэкап только схемы ----------
SCHEMA_BACKUP="$BACKUP_DIR/schema_${TIMESTAMP}.sql"
echo "[...] Создание бэкапа схемы..."

docker exec "$CONTAINER_NAME" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --schema-only \
    --no-owner \
    --no-privileges \
    > "$SCHEMA_BACKUP"

echo "[OK] Схема: $SCHEMA_BACKUP"

# ---------- 4. Бэкап критичных таблиц отдельно ----------
CRITICAL_TABLES="users roles departments clients orders payments inventory_items inventory_stocks"
echo "[...] Бэкап критичных таблиц..."

for table in $CRITICAL_TABLES; do
    TABLE_BACKUP="$BACKUP_DIR/${table}_${TIMESTAMP}.sql"
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -t "$table" \
        --no-owner \
        --data-only \
        > "$TABLE_BACKUP" 2>/dev/null || echo "  [WARN] Таблица $table не найдена, пропуск"
done

echo "[OK] Критичные таблицы сохранены."

# ---------- 5. Проверка целостности бэкапа ----------
echo "[...] Проверка целостности..."

BACKUP_SIZE=$(stat -c%s "$FULL_BACKUP" 2>/dev/null || stat -f%z "$FULL_BACKUP" 2>/dev/null)
if [ "$BACKUP_SIZE" -lt 1024 ]; then
    echo "[ОШИБКА] Бэкап подозрительно мал ($BACKUP_SIZE байт). Возможна проблема!"
    exit 1
fi

echo "[OK] Размер бэкапа: $BACKUP_SIZE байт — выглядит нормально."

# ---------- 6. Очистка старых бэкапов ----------
echo "[...] Удаление бэкапов старше $RETENTION_DAYS дней..."
DELETED=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "[OK] Удалено файлов: $DELETED"

# ---------- 7. Статистика ----------
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "merch_crm_*.dump" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo "========================================"
echo "[MerchCRM Backup] Завершено: $(date '+%Y-%m-%d %H:%M:%S')"
echo "  Всего бэкапов: $TOTAL_BACKUPS"
echo "  Общий размер:  $TOTAL_SIZE"
echo "========================================"
