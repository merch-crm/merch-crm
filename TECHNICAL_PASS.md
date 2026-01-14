# 📄 Технический паспорт проекта MerchCRM

> **Важно:** Сохраните этот файл в надежном месте. Он содержит все данные для восстановления управления проектом.

---

## 🌍 1. Основные ссылки
*   **Сайт:** [https://merch-crm.ru](https://merch-crm.ru)
*   **Управление SSL (Nginx):** [http://89.104.69.25:81](http://89.104.69.25:81)
    *   *Логин:* `molchanov-le@mail.ru`
    *   *Пароль:* `admin123`

---

## 🖥 2. Сервер (SSH)
*   **IP:** `89.104.69.25`
*   **Пользователь:** `root`
*   **Доступ для AI:** На вашем Mac настроен ключ `~/.ssh/antigravity_key`.
*   **Команда для связи:** `ssh -i ~/.ssh/antigravity_key root@89.104.69.25`

---

## 📦 3. Инфраструктура (Docker)
Проект развернут в Docker. Контейнеры:
1.  `merch-crm` (Node.js/Next.js) — порт 3000 (внутренний)
2.  `merch-crm-db` (PostgreSQL) — порт 5432
3.  `nginx-proxy` (Nginx Proxy Manager) — порты 80, 81, 443

**Путь к проекту на сервере:** `/root/merch-crm`

---

## ☁️ 4. Облачное хранилище (Reg.ru S3)
*   **Endpoint:** `https://s3.reg0.rusrv.ru`
*   **Bucket:** `merch-crm-storage`
*   **Region:** `ru-1`
*   **Access Key:** `S5GORA0UWV81QDIOGMA`
*   **Secret Key:** `ZEFFxisDZZSojaasSmyLsnp9KhKCstviYeIZFEfh`

---

## 🛠 5. База данных (PostgreSQL)
*   **URL:** `postgresql://postgres:postgres@db:5432/merch_crm`
*   **User:** `postgres`
*   **Password:** `postgres`
*   **Database:** `merch_crm`

---

## 🔐 6. Секреты Приложения
*   **JWT_SECRET_KEY:** `hsksfnsuslssd;dcsnjmm`

---

## 🤖 7. Автоматизация (GitHub Actions)
В репозитории настроены следующие Repository Secrets:
*   **SERVER_IP:** `89.104.69.25`
*   **SERVER_USER:** `root`
*   **SSH_PRIVATE_KEY:** Содержимое файла `~/.ssh/id_ed25519` (для GitHub)

Ключ деплоя на сервере (Deploy Key на GitHub):
`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBaAK7RxvEW9kUAu3QB4CVbMW+0OdILoV0Li3J1oNmwx root@cv5812811.novalocal`

---

## 🔑 6. Доступы в CRM (Для AI)
*   **URL:** [https://merch-crm.ru/login](https://merch-crm.ru/login)
*   **Администратор:** `agent@antigravity.ai`
*   **Пароль:** `Antigravity`

---

## 🛠 7. Команды обслуживания (Памятка)
*   **Обновить код вручную:** `docker compose up -d --build`
*   **Логи сайта:** `docker logs -f merch-crm`
*   **Бэкап базы:** `docker exec merch-crm-db pg_dump -U postgres merch_crm > backup.sql`
