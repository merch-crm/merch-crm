#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Остановка dev-окружения MerchCRM${NC}"
echo ""

# 1. Остановка dev-сервера
echo -e "${YELLOW}📌 Остановка Next.js dev-сервера...${NC}"
pkill -f "next dev" 2>/dev/null || true
echo -e "${GREEN}✅ Dev-сервер остановлен${NC}"

# 2. Закрытие SSH-туннелей
echo -e "${YELLOW}📌 Закрытие SSH-туннелей...${NC}"
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
echo -e "${GREEN}✅ Туннели закрыты${NC}"

echo ""
echo -e "${GREEN}✅ Dev-окружение остановлено${NC}"
