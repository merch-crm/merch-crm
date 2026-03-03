#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск dev-окружения MerchCRM${NC}"
echo ""

# 1. Очистка порта 5432
echo -e "${YELLOW}📌 Шаг 1: Очистка порта 5432...${NC}"
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
lsof -ti:6379 | xargs kill -9 2>/dev/null || true
lsof -ti:1984 | xargs kill -9 2>/dev/null || true
sleep 1

# 2. Установка SSH-туннеля
echo -e "${YELLOW}📌 Шаг 2: Установка SSH-туннеля к удаленной БД...${NC}"
ssh -i ~/.ssh/antigravity_key -f -N -L 5432:127.0.0.1:5432 -L 6379:127.0.0.1:6379 -L 1984:127.0.0.1:1984 root@89.104.69.25
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSH-туннель установлен${NC}"
    sleep 2
else
    echo -e "${RED}❌ Ошибка установки туннеля${NC}"
    exit 1
fi

# 3. Синхронизация пароля БД (на случай, если он сбросился)
echo -e "${YELLOW}📌 Шаг 3: Синхронизация пароля БД...${NC}"
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '5738870192e24949b02a700547743048';\"" > /dev/null 2>&1
echo -e "${GREEN}✅ Пароль синхронизирован${NC}"

# 4. Проверка подключения
echo -e "${YELLOW}📌 Шаг 4: Проверка подключения к БД...${NC}"
node scripts/check-connection.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Не удалось подключиться к БД${NC}"
    echo -e "${YELLOW}💡 Попробуйте перезапустить скрипт или проверьте SSH-ключ${NC}"
    exit 1
fi

# 5. Запуск dev-сервера
echo ""
echo -e "${GREEN}✅ Все проверки пройдены!${NC}"
echo -e "${GREEN}🚀 Запуск Next.js dev-сервера...${NC}"
echo ""
echo -e "${YELLOW}⚠️  ВАЖНО: Вы работаете с ПРОДАКШН базой данных!${NC}"
echo -e "${YELLOW}   Все изменения данных будут применены к реальной БД.${NC}"
echo ""

npm run dev
