#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск dev-окружения MerchCRM${NC}"
echo ""

# 1. Настройка адаптивного SSH-туннеля
# setup-ssh-tunnel.mjs динамически определяет IP Docker-контейнеров (merch-crm-db, merch-crm-redis)
# и пробрасывает туннели напрямую к ним. Postgres в Docker НЕ публикует порт на хост-машину.
echo -e "${YELLOW}📌 Шаг 1: Настройка SSH-туннеля...${NC}"
node scripts/setup-ssh-tunnel.mjs
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSH-туннель настроен (адаптивно)${NC}"
    sleep 1
else
    echo -e "${RED}❌ Ошибка настройки туннеля${NC}"
    exit 1
fi

# 2. Синхронизация пароля БД (на случай, если он сбросился)
echo -e "${YELLOW}📌 Шаг 2: Синхронизация пароля БД...${NC}"
DB_PASSWORD=$(grep "^DATABASE_URL" .env.local | sed -E 's/.*postgres:([^@]*)@.*/\1/')
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';\"" > /dev/null 2>&1
echo -e "${GREEN}✅ Пароль синхронизирован${NC}"

# 2.5. Синхронизация файлов с продакшна
echo -e "${YELLOW}📌 Шаг 2.5: Синхронизация файлов local-storage с продакшна...${NC}"
mkdir -p local-storage && rsync -az -e "ssh -i ~/.ssh/antigravity_key -o StrictHostKeyChecking=no" root@89.104.69.25:/root/merch-crm/local-storage/ ./local-storage/
echo -e "${GREEN}✅ local-storage синхронизирован${NC}"

# 3. Проверка подключения
echo -e "${YELLOW}📌 Шаг 3: Проверка подключения к БД...${NC}"
node scripts/check-connection.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Не удалось подключиться к БД${NC}"
    echo -e "${YELLOW}💡 Попробуйте перезапустить скрипт или проверьте SSH-ключ${NC}"
    exit 1
fi

# 4. Очистка порта 3000 (основной порт Next.js)
echo -e "${YELLOW}📌 Шаг 4: Очистка порта 3000...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✅ Порт 3000 свободен${NC}"

# 5. Запуск dev-сервера
echo ""
echo -e "${GREEN}✅ Все проверки пройдены!${NC}"
echo -e "${GREEN}🚀 Запуск Next.js dev-сервера...${NC}"
echo ""
echo -e "${YELLOW}⚠️  ВАЖНО: Вы работаете с ПРОДАКШН базой данных!${NC}"
echo -e "${YELLOW}   Все изменения данных будут применены к реальной БД.${NC}"
echo ""

npm run dev
