-- migrations/add_client_funnel.sql

-- Добавляем поля воронки в таблицу clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS funnel_stage TEXT DEFAULT 'lead';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS funnel_stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lost_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- Индексы
CREATE INDEX IF NOT EXISTS idx_clients_funnel_stage ON clients(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_clients_lost_at ON clients(lost_at) WHERE lost_at IS NOT NULL;

-- Комментарии
COMMENT ON COLUMN clients.funnel_stage IS 'Этап воронки: lead, first_contact, negotiation, first_order, regular';
COMMENT ON COLUMN clients.funnel_stage_changed_at IS 'Дата последнего изменения этапа воронки';
COMMENT ON COLUMN clients.lost_at IS 'Дата потери клиента';
COMMENT ON COLUMN clients.lost_reason IS 'Причина потери клиента';
