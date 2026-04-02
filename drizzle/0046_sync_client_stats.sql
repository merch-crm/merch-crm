-- миграция для синхронизации статистики клиентов
CREATE OR REPLACE FUNCTION update_client_stats_from_orders()
RETURNS TRIGGER AS $$
DECLARE
    target_client_id UUID;
BEGIN
    ----------
    -- 1. Определяем, для какого ID клиента выполнять пересчет
    ----------
    IF TG_OP = 'DELETE' THEN
        target_client_id := OLD.client_id;
    ELSE
        target_client_id := NEW.client_id;
    END IF;

    ----------
    -- 2. Если это UPDATE и клиент сменился, пересчитываем СТАРОГО клиента
    ----------
    IF TG_OP = 'UPDATE' AND OLD.client_id IS DISTINCT FROM NEW.client_id AND OLD.client_id IS NOT NULL THEN
        WITH stats AS (
            SELECT 
                COUNT(id) as cnt,
                COALESCE(SUM(total_amount), 0) as amt,
                MIN(created_at) as first_at,
                MAX(created_at) as last_at
            FROM orders
            WHERE client_id = OLD.client_id AND is_archived = false
        )
        UPDATE clients c
        SET 
            total_orders_count = s.cnt,
            total_orders_amount = s.amt,
            average_check = CASE WHEN s.cnt > 0 THEN s.amt / s.cnt ELSE 0 END,
            first_order_at = s.first_at,
            last_order_at = s.last_at
        FROM stats s
        WHERE c.id = OLD.client_id;
    END IF;

    ----------
    -- 3. Пересчитываем ОСНОВНОГО (НОВОГО) клиента
    ----------
    IF target_client_id IS NOT NULL THEN
        WITH stats AS (
            SELECT 
                COUNT(id) as cnt,
                COALESCE(SUM(total_amount), 0) as amt,
                MIN(created_at) as first_at,
                MAX(created_at) as last_at
            FROM orders
            WHERE client_id = target_client_id AND is_archived = false
        )
        UPDATE clients c
        SET 
            total_orders_count = s.cnt,
            total_orders_amount = s.amt,
            average_check = CASE WHEN s.cnt > 0 THEN s.amt / s.cnt ELSE 0 END,
            first_order_at = s.first_at,
            last_order_at = s.last_at
        FROM stats s
        WHERE c.id = target_client_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Привязка триггера к таблице orders
DROP TRIGGER IF EXISTS trg_sync_client_stats ON orders;

CREATE TRIGGER trg_sync_client_stats
AFTER INSERT OR UPDATE OF total_amount, is_archived, client_id, created_at OR DELETE
ON orders
FOR EACH ROW
EXECUTE FUNCTION update_client_stats_from_orders();