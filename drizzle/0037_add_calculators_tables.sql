-- Миграция: Добавление таблиц для калькуляторов печати
-- @audit calculators

-- Таблица истории расчётов
CREATE TABLE IF NOT EXISTS "calculation_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "calculation_number" varchar(20) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "application_type" varchar(50) NOT NULL,
  "total_cost" numeric(12, 2) NOT NULL,
  "selling_price" numeric(12, 2) NOT NULL,
  "quantity" numeric(10, 0) NOT NULL,
  "price_per_item" numeric(12, 2) NOT NULL,
  "margin_percent" numeric(5, 2) NOT NULL,
  "parameters" jsonb NOT NULL,
  "design_files" jsonb NOT NULL DEFAULT '[]',
  "roll_visualization" jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_by" uuid NOT NULL REFERENCES "users"("id"),
  "deleted_at" timestamp with time zone,
  "deleted_by" uuid REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "calc_history_application_type_idx" ON "calculation_history" ("application_type");
CREATE INDEX IF NOT EXISTS "calc_history_created_at_idx" ON "calculation_history" ("created_at");
CREATE INDEX IF NOT EXISTS "calc_history_deleted_at_idx" ON "calculation_history" ("deleted_at");
CREATE INDEX IF NOT EXISTS "calc_history_created_by_idx" ON "calculation_history" ("created_by");
CREATE INDEX IF NOT EXISTS "calc_history_search_idx" ON "calculation_history" ("name", "calculation_number");

-- Таблица дефолтных настроек калькуляторов
CREATE TABLE IF NOT EXISTS "calculator_defaults" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "calculator_type" varchar(50) NOT NULL UNIQUE,
  "consumables_config" jsonb NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "calc_defaults_type_idx" ON "calculator_defaults" ("calculator_type");

-- Таблица изделий для нанесения
CREATE TABLE IF NOT EXISTS "placement_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(100) NOT NULL,
  "slug" varchar(100) NOT NULL UNIQUE,
  "icon" varchar(50),
  "description" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "placement_items_is_active_idx" ON "placement_items" ("is_active");
CREATE INDEX IF NOT EXISTS "placement_items_sort_order_idx" ON "placement_items" ("sort_order");

-- Таблица областей нанесения
CREATE TABLE IF NOT EXISTS "placement_areas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "item_id" uuid NOT NULL REFERENCES "placement_items"("id") ON DELETE CASCADE,
  "name" varchar(100) NOT NULL,
  "slug" varchar(100) NOT NULL,
  "max_width_cm" numeric(5, 1) NOT NULL,
  "max_height_cm" numeric(5, 1) NOT NULL,
  "work_price" numeric(10, 2) NOT NULL,
  "description" text,
  "is_active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "placement_areas_item_id_idx" ON "placement_areas" ("item_id");
CREATE INDEX IF NOT EXISTS "placement_areas_is_active_idx" ON "placement_areas" ("is_active");
CREATE INDEX IF NOT EXISTS "placement_areas_sort_order_idx" ON "placement_areas" ("sort_order");

-- Таблица загруженных файлов дизайнов
CREATE TABLE IF NOT EXISTS "design_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "original_name" varchar(255) NOT NULL,
  "stored_name" varchar(100) NOT NULL UNIQUE,
  "mime_type" varchar(100) NOT NULL,
  "extension" varchar(20) NOT NULL,
  "size_bytes" integer NOT NULL,
  "file_path" varchar(500) NOT NULL,
  "thumbnail_path" varchar(500),
  "calculator_type" varchar(50) NOT NULL,
  "file_dimensions" jsonb,
  "embroidery_data" jsonb,
  "uploaded_by" uuid NOT NULL REFERENCES "users"("id"),
  "uploaded_at" timestamp with time zone NOT NULL DEFAULT now(),
  "deleted_at" timestamp with time zone
);

CREATE INDEX IF NOT EXISTS "design_files_calculator_type_idx" ON "design_files" ("calculator_type");
CREATE INDEX IF NOT EXISTS "design_files_uploaded_by_idx" ON "design_files" ("uploaded_by");
CREATE INDEX IF NOT EXISTS "design_files_uploaded_at_idx" ON "design_files" ("uploaded_at");
CREATE INDEX IF NOT EXISTS "design_files_deleted_at_idx" ON "design_files" ("deleted_at");

-- Добавление поля позиции логотипа в настройки брендинга
ALTER TABLE "branding_settings" 
ADD COLUMN IF NOT EXISTS "print_logo_position" varchar(20) NOT NULL DEFAULT 'top-left';

COMMENT ON COLUMN "branding_settings"."print_logo_position" IS 'Позиция логотипа в PDF: top-left, top-right, bottom-center';
