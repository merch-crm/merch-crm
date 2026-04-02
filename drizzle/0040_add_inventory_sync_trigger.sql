-- Function to update inventory_items.quantity based on the sum of stocks
CREATE OR REPLACE FUNCTION update_inventory_item_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        UPDATE inventory_items
        SET quantity = (SELECT COALESCE(SUM(quantity), 0) FROM inventory_stocks WHERE item_id = OLD.item_id),
            updated_at = NOW()
        WHERE id = OLD.item_id;
        RETURN OLD;
    ELSE
        UPDATE inventory_items
        SET quantity = (SELECT COALESCE(SUM(quantity), 0) FROM inventory_stocks WHERE item_id = NEW.item_id),
            updated_at = NOW()
        WHERE id = NEW.item_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger on inventory_stocks to keep inventory_items.quantity in sync
DROP TRIGGER IF EXISTS trg_sync_inventory_quantity ON inventory_stocks;
CREATE TRIGGER trg_sync_inventory_quantity
AFTER INSERT OR UPDATE OR DELETE ON inventory_stocks
FOR EACH ROW
EXECUTE FUNCTION update_inventory_item_quantity();

-- Initial sync of all quantities to ensure data integrity
UPDATE inventory_items ii
SET quantity = (
    SELECT COALESCE(SUM(quantity), 0)
    FROM inventory_stocks
    WHERE item_id = ii.id
);
