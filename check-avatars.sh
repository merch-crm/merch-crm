#!/bin/bash

echo "=== Проверка аватарок в MerchCRM ==="
echo ""

echo "1. Проверка файла на сервере:"
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "ls -lh /root/merch-crm/uploads/avatars/ 2>/dev/null || echo 'Папка не найдена'"
echo ""

echo "2. Проверка доступности по HTTP:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://merch-crm.ru/uploads/avatars/11db5637-0679-4151-b5e4-6def81914834-1768358139845.jpg
echo ""

echo "3. Проверка данных в БД:"
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -d merch_crm -c \"SELECT name, email, LEFT(avatar, 50) as avatar_path FROM users WHERE avatar IS NOT NULL;\" 2>/dev/null"
echo ""

echo "4. Статус контейнера:"
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker ps --filter name=merch-crm --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}'"
echo ""

echo "=== Готово! ==="
echo "Теперь зайдите на https://merch-crm.ru под аккаунтом admin@crm.local"
echo "и проверьте:"
echo "  - Правый верхний угол (шапка)"
echo "  - Страница профиля"
echo "  - Детали любого заказа (раздел 'Ответственный')"
