#!/bin/bash

# Скрипт автоматической настройки сервера Reg.ru для MerchCRM

echo "🚀 Начинаем настройку сервера..."

# 1. Обновление системы
sudo apt-get update && sudo apt-get upgrade -y

# 2. Установка Docker
if ! [ -x "$(command -v docker)" ]; then
    echo "📦 Устанавливаем Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
else
    echo "✅ Docker уже установлен"
fi

# 3. Создание Docker-сети (если нужно)
docker network create crm-network 2>/dev/null || true

# 4. Проверка наличия .env
if [ ! -f .env ]; then
    echo "⚠️ Файл .env не найден! Пожалуйста, создайте его перед запуском Docker-контейнера."
    exit 1
fi

# 5. Сборка и запуск
echo "🏗️ Собираем и запускаем контейнер..."
docker build -t merch-crm .
docker stop crm 2>/dev/null || true
docker rm crm 2>/dev/null || true
docker run -d \
    --name crm \
    --network crm-network \
    -p 80:3000 \
    --env-file .env \
    --restart unless-stopped \
    merch-crm

echo "✨ Настройка завершена! Сайт должен быть доступен по IP сервера."
