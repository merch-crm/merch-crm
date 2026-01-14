#!/bin/bash

# Цвета для оформления
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== MerchCRM Log Monitor ===${NC}"
echo "1) Показать последние 100 строк (Все)"
echo "2) Только ОШИБКИ (Error/Fatal)"
echo "3) Режим реального времени (Live)"
echo "4) Логи Базы Данных"
echo "5) Логи Nginx (Трафик)"
echo "q) Выход"

read -p "Выберите вариант: " choice

case $choice in
    1)
        docker logs --tail 100 merch-crm
        ;;
    2)
        docker logs merch-crm 2>&1 | grep -iE "error|fatal|exception|500"
        ;;
    3)
        echo -e "${GREEN}Нажмите Ctrl+C для выхода из режима Live${NC}"
        docker logs -f merch-crm
        ;;
    4)
        docker logs --tail 50 merch-crm-db
        ;;
    5)
        docker logs --tail 50 merch-crm-nginx
        ;;
    q)
        exit 0
        ;;
    *)
        echo -e "${RED}Неверный выбор${NC}"
        ;;
esac
