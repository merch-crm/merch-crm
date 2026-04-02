-- Миграция: Добавление таблиц для контроля присутствия сотрудников
-- Дата: 2026-03-03

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
    CREATE TYPE "public"."presence_event_type" AS ENUM('detected', 'lost', 'recognized', 'unknown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."session_type" AS ENUM('work', 'break', 'idle');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."camera_status" AS ENUM('online', 'offline', 'error', 'connecting');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- XIAOMI ACCOUNTS
-- ============================================

CREATE TABLE IF NOT EXISTS "xiaomi_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "xiaomi_user_id" varchar(50) NOT NULL UNIQUE,
    "email" varchar(255),
    "nickname" varchar(255),
    "encrypted_token" text NOT NULL,
    "region" varchar(10) NOT NULL DEFAULT 'cn',
    "is_active" boolean NOT NULL DEFAULT true,
    "last_sync_at" timestamp,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "xiaomi_accounts_xiaomi_user_id_idx" ON "xiaomi_accounts" ("xiaomi_user_id");
CREATE INDEX IF NOT EXISTS "xiaomi_accounts_is_active_idx" ON "xiaomi_accounts" ("is_active");
CREATE INDEX IF NOT EXISTS "xiaomi_accounts_created_at_idx" ON "xiaomi_accounts" ("created_at");

-- ============================================
-- CAMERAS
-- ============================================

CREATE TABLE IF NOT EXISTS "cameras" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "xiaomi_account_id" uuid REFERENCES "xiaomi_accounts"("id") ON DELETE CASCADE,
    "device_id" varchar(100) NOT NULL,
    "model" varchar(100),
    "name" varchar(255) NOT NULL,
    "local_name" varchar(255),
    "location" varchar(255),
    "local_ip" varchar(45),
    "stream_url" text,
    "status" "camera_status" NOT NULL DEFAULT 'offline',
    "last_online_at" timestamp,
    "error_message" text,
    "is_enabled" boolean NOT NULL DEFAULT true,
    "confidence_threshold" decimal(3, 2) DEFAULT 0.60,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "cameras_xiaomi_account_id_idx" ON "cameras" ("xiaomi_account_id");
CREATE INDEX IF NOT EXISTS "cameras_device_id_idx" ON "cameras" ("device_id");
CREATE INDEX IF NOT EXISTS "cameras_status_idx" ON "cameras" ("status");
CREATE INDEX IF NOT EXISTS "cameras_is_enabled_idx" ON "cameras" ("is_enabled");
CREATE INDEX IF NOT EXISTS "cameras_created_at_idx" ON "cameras" ("created_at");

-- ============================================
-- EMPLOYEE FACES
-- ============================================

CREATE TABLE IF NOT EXISTS "employee_faces" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "face_encoding" jsonb NOT NULL,
    "photo_url" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "is_primary" boolean NOT NULL DEFAULT false,
    "quality" decimal(3, 2),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "created_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "employee_faces_user_id_idx" ON "employee_faces" ("user_id");
CREATE INDEX IF NOT EXISTS "employee_faces_is_active_idx" ON "employee_faces" ("is_active");
CREATE INDEX IF NOT EXISTS "employee_faces_is_primary_idx" ON "employee_faces" ("is_primary");
CREATE INDEX IF NOT EXISTS "employee_faces_created_at_idx" ON "employee_faces" ("created_at");

-- ============================================
-- PRESENCE LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS "presence_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
    "camera_id" uuid REFERENCES "cameras"("id") ON DELETE SET NULL,
    "event_type" "presence_event_type" NOT NULL,
    "confidence" decimal(3, 2),
    "face_encoding" jsonb,
    "snapshot_url" text,
    "timestamp" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "presence_logs_user_id_idx" ON "presence_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "presence_logs_camera_id_idx" ON "presence_logs" ("camera_id");
CREATE INDEX IF NOT EXISTS "presence_logs_event_type_idx" ON "presence_logs" ("event_type");
CREATE INDEX IF NOT EXISTS "presence_logs_timestamp_idx" ON "presence_logs" ("timestamp");

-- ============================================
-- WORK SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS "work_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "camera_id" uuid REFERENCES "cameras"("id") ON DELETE SET NULL,
    "date" timestamp NOT NULL,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp,
    "duration_seconds" integer DEFAULT 0,
    "session_type" "session_type" NOT NULL DEFAULT 'work',
    "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "work_sessions_user_id_idx" ON "work_sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "work_sessions_camera_id_idx" ON "work_sessions" ("camera_id");
CREATE INDEX IF NOT EXISTS "work_sessions_date_idx" ON "work_sessions" ("date");
CREATE INDEX IF NOT EXISTS "work_sessions_session_type_idx" ON "work_sessions" ("session_type");
CREATE INDEX IF NOT EXISTS "work_sessions_user_date_idx" ON "work_sessions" ("user_id", "date");

-- ============================================
-- DAILY WORK STATS
-- ============================================

CREATE TABLE IF NOT EXISTS "daily_work_stats" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "date" timestamp NOT NULL,
    "first_seen_at" timestamp,
    "last_seen_at" timestamp,
    "work_seconds" integer NOT NULL DEFAULT 0,
    "idle_seconds" integer NOT NULL DEFAULT 0,
    "break_seconds" integer NOT NULL DEFAULT 0,
    "productivity" decimal(5, 2),
    "total_sessions" integer NOT NULL DEFAULT 0,
    "late_arrival_minutes" integer DEFAULT 0,
    "early_departure_minutes" integer DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "daily_work_stats_user_id_idx" ON "daily_work_stats" ("user_id");
CREATE INDEX IF NOT EXISTS "daily_work_stats_date_idx" ON "daily_work_stats" ("date");
CREATE INDEX IF NOT EXISTS "daily_work_stats_user_date_idx" ON "daily_work_stats" ("user_id", "date");

-- ============================================
-- PRESENCE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS "presence_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key" varchar(100) NOT NULL UNIQUE,
    "value" jsonb NOT NULL,
    "description" text,
    "updated_at" timestamp NOT NULL DEFAULT now(),
    "updated_by_id" uuid REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "presence_settings_key_idx" ON "presence_settings" ("key");

-- ============================================
-- DEFAULT SETTINGS
-- ============================================

INSERT INTO "presence_settings" ("key", "value", "description") VALUES
    ('work_start_time', '"09:00"', 'Начало рабочего дня'),
    ('work_end_time', '"18:00"', 'Конец рабочего дня'),
    ('idle_threshold_seconds', '30', 'Порог простоя в секундах'),
    ('late_threshold_minutes', '15', 'Порог опоздания в минутах'),
    ('recognition_confidence', '0.60', 'Минимальная уверенность распознавания'),
    ('go2rtc_url', '"http://localhost:1984"', 'URL go2rtc сервера'),
    ('telegram_alerts_enabled', 'false', 'Уведомления в Telegram'),
    ('auto_clock_out_hours', '12', 'Автоматическое завершение смены через N часов')
ON CONFLICT ("key") DO NOTHING;
