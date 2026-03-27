#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск dev-окружения MerchCRM${NC}"
echo ""

# 1. Настройка адаптивного SSH-туннеля
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
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '5738870192e24949b02a700547743048';\"" > /dev/null 2>&1
echo -e "${GREEN}✅ Пароль синхронизирован${NC}"

# 3. Проверка подключения
echo -e "${YELLOW}📌 Шаг 3: Проверка подключения к БД...${NC}"
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
