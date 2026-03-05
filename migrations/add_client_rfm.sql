-- migrations/add_client_rfm.sql

-- Добавляем поля RFM в таблицу clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfm_recency INTEGER;  -- 1-5 баллов
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfm_frequency INTEGER;  -- 1-5 баллов
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfm_monetary INTEGER;  -- 1-5 баллов
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfm_score TEXT;  -- "555", "321" и т.д.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfm_segment TEXT;  -- "champions", "at_risk" и т.д.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rfm_calculated_at TIMESTAMP WITH TIME ZONE;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_clients_rfm_segment ON clients(rfm_segment);
CREATE INDEX IF NOT EXISTS idx_clients_rfm_score ON clients(rfm_score);

-- Комментарии
COMMENT ON COLUMN clients.rfm_recency IS 'RFM Recency score (1-5): давность последней покупки';
COMMENT ON COLUMN clients.rfm_frequency IS 'RFM Frequency score (1-5): частота покупок';
COMMENT ON COLUMN clients.rfm_monetary IS 'RFM Monetary score (1-5): сумма покупок';
COMMENT ON COLUMN clients.rfm_score IS 'RFM Score: комбинация R+F+M (например "555")';
COMMENT ON COLUMN clients.rfm_segment IS 'RFM сегмент: champions, loyal, at_risk и т.д.';
