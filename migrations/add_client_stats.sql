-- migrations/add_client_stats.sql

-- Добавляем денормализованные поля статистики в таблицу clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_orders_count INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_orders_amount DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS average_check DECIMAL(12, 2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_order_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS days_since_last_order INTEGER;

-- Индексы для быстрой фильтрации
CREATE INDEX IF NOT EXISTS idx_clients_total_orders_count ON clients(total_orders_count);
CREATE INDEX IF NOT EXISTS idx_clients_total_orders_amount ON clients(total_orders_amount);
CREATE INDEX IF NOT EXISTS idx_clients_last_order_at ON clients(last_order_at);
CREATE INDEX IF NOT EXISTS idx_clients_days_since_last_order ON clients(days_since_last_order) 
    WHERE days_since_last_order IS NOT NULL;

-- Комментарии
COMMENT ON COLUMN clients.total_orders_count IS 'Общее количество заказов клиента';
COMMENT ON COLUMN clients.total_orders_amount IS 'Общая сумма заказов клиента';
COMMENT ON COLUMN clients.average_check IS 'Средний чек клиента';
COMMENT ON COLUMN clients.last_order_at IS 'Дата последнего заказа';
COMMENT ON COLUMN clients.first_order_at IS 'Дата первого заказа';
COMMENT ON COLUMN clients.days_since_last_order IS 'Дней с последнего заказа (обновляется периодически)';

-- Функция для пересчёта статистики одного клиента
CREATE OR REPLACE FUNCTION recalculate_client_stats(p_client_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE clients SET
        total_orders_count = COALESCE((
            SELECT COUNT(*) FROM orders WHERE client_id = p_client_id AND status != 'cancelled'
        ), 0),
        total_orders_amount = COALESCE((
            SELECT SUM(total_amount) FROM orders WHERE client_id = p_client_id AND status != 'cancelled'
        ), 0),
        average_check = COALESCE((
            SELECT AVG(total_amount) FROM orders WHERE client_id = p_client_id AND status != 'cancelled'
        ), 0),
        last_order_at = (
            SELECT MAX(created_at) FROM orders WHERE client_id = p_client_id AND status != 'cancelled'
        ),
        first_order_at = (
            SELECT MIN(created_at) FROM orders WHERE client_id = p_client_id AND status != 'cancelled'
        ),
        days_since_last_order = (
            SELECT EXTRACT(DAY FROM NOW() - MAX(created_at))::INTEGER 
            FROM orders WHERE client_id = p_client_id AND status != 'cancelled'
        ),
        updated_at = NOW()
    WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления статистики при изменении заказов
CREATE OR REPLACE FUNCTION trigger_update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_client_stats(OLD.client_id);
        RETURN OLD;
    ELSE
        PERFORM recalculate_client_stats(NEW.client_id);
        -- Если client_id изменился, пересчитываем и старого клиента
        IF TG_OP = 'UPDATE' AND OLD.client_id != NEW.client_id THEN
            PERFORM recalculate_client_stats(OLD.client_id);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Создаём триггер на таблицу orders
DROP TRIGGER IF EXISTS trg_update_client_stats ON orders;
CREATE TRIGGER trg_update_client_stats
    AFTER INSERT OR UPDATE OR DELETE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_client_stats();

-- Первоначальный пересчёт для всех клиентов
DO $$
DECLARE
    client_record RECORD;
BEGIN
    FOR client_record IN SELECT id FROM clients LOOP
        PERFORM recalculate_client_stats(client_record.id);
    END LOOP;
END $$;
