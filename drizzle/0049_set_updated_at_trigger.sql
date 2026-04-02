-- ============================================================
-- Migration: 0043_set_updated_at_trigger
-- Purpose: Auto-update updated_at column via PostgreSQL trigger
-- ============================================================

-- 1. Единая функция-обработчик
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- 2. Хелпер: создаёт триггер на таблицу, если он ещё не существует и таблица есть
CREATE OR REPLACE FUNCTION create_updated_at_trigger(target_table TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    trigger_name TEXT := 'trg_set_updated_at_' || target_table;
BEGIN
    -- Проверяем существование таблицы и колонки updated_at
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = target_table AND column_name = 'updated_at' AND table_schema = 'public'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger
            WHERE tgname = trigger_name
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER %I
                 BEFORE UPDATE ON %I
                 FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
                trigger_name, target_table
            );
        END IF;
    END IF;
END;
$$;

-- 3. Создаём триггеры на все таблицы, где реально есть колонка updated_at
SELECT create_updated_at_trigger('accounts');
SELECT create_updated_at_trigger('achievements');
SELECT create_updated_at_trigger('api_keys');
SELECT create_updated_at_trigger('application_types');
SELECT create_updated_at_trigger('branding_settings');
SELECT create_updated_at_trigger('calculator_consumables_settings');
SELECT create_updated_at_trigger('calculator_defaults');
SELECT create_updated_at_trigger('client_branding');
SELECT create_updated_at_trigger('client_contacts');
SELECT create_updated_at_trigger('client_conversations');
SELECT create_updated_at_trigger('clients');
SELECT create_updated_at_trigger('customer_feedback');
SELECT create_updated_at_trigger('daily_work_stats');
SELECT create_updated_at_trigger('departments');
SELECT create_updated_at_trigger('editor_projects');
SELECT create_updated_at_trigger('equipment');
SELECT create_updated_at_trigger('inventory_attribute_types');
SELECT create_updated_at_trigger('inventory_attributes');
SELECT create_updated_at_trigger('inventory_categories');
SELECT create_updated_at_trigger('inventory_item_attributes');
SELECT create_updated_at_trigger('inventory_items');
SELECT create_updated_at_trigger('inventory_stocks');
SELECT create_updated_at_trigger('inventory_transactions');
SELECT create_updated_at_trigger('inventory_transfers');
SELECT create_updated_at_trigger('loyalty_levels');
SELECT create_updated_at_trigger('message_templates');
SELECT create_updated_at_trigger('meter_price_tiers');
SELECT create_updated_at_trigger('notifications');
SELECT create_updated_at_trigger('order_attachments');
SELECT create_updated_at_trigger('order_design_tasks');
SELECT create_updated_at_trigger('order_items');
SELECT create_updated_at_trigger('orders');
SELECT create_updated_at_trigger('payments');
SELECT create_updated_at_trigger('placement_areas');
SELECT create_updated_at_trigger('placement_items');
SELECT create_updated_at_trigger('print_calculations');
SELECT create_updated_at_trigger('print_collections');
SELECT create_updated_at_trigger('print_design_mockups');
SELECT create_updated_at_trigger('print_design_versions');
SELECT create_updated_at_trigger('print_designs');
SELECT create_updated_at_trigger('print_placements');
SELECT create_updated_at_trigger('product_lines');
SELECT create_updated_at_trigger('production_lines');
SELECT create_updated_at_trigger('production_staff');
SELECT create_updated_at_trigger('production_tasks');
SELECT create_updated_at_trigger('roles');
SELECT create_updated_at_trigger('sessions');
SELECT create_updated_at_trigger('storage_locations');
SELECT create_updated_at_trigger('system_settings');
SELECT create_updated_at_trigger('task_attachments');
SELECT create_updated_at_trigger('task_checklists');
SELECT create_updated_at_trigger('task_comments');
SELECT create_updated_at_trigger('task_filter_presets');
SELECT create_updated_at_trigger('task_history');
SELECT create_updated_at_trigger('tasks');
SELECT create_updated_at_trigger('tickets');
SELECT create_updated_at_trigger('users');
SELECT create_updated_at_trigger('wiki_pages');

-- 4. Удаляем вспомогательную функцию
DROP FUNCTION create_updated_at_trigger(TEXT);
