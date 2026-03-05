-- migrations/add_loyalty_settings.sql

-- Таблица настроек уровней лояльности
CREATE TABLE IF NOT EXISTS loyalty_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Идентификация
    level_key TEXT NOT NULL UNIQUE,  -- 'standard', 'silver', 'gold' или custom
    level_name TEXT NOT NULL,         -- Отображаемое название
    
    -- Пороги для автоматического перехода
    min_orders_amount DECIMAL(12, 2) DEFAULT 0,  -- Минимальная сумма заказов
    min_orders_count INTEGER DEFAULT 0,           -- Минимальное количество заказов
    
    -- Привилегии
    discount_percent DECIMAL(5, 2) DEFAULT 0,     -- Скидка в процентах
    bonus_description TEXT,                        -- Описание дополнительных бонусов
    
    -- Визуальные настройки
    color TEXT DEFAULT '#64748b',                 -- Цвет уровня (HEX)
    icon TEXT DEFAULT 'star',                     -- Иконка (название)
    priority INTEGER DEFAULT 0,                   -- Порядок сортировки (чем выше, тем престижнее)
    
    -- Статус
    is_active BOOLEAN DEFAULT true,
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_loyalty_levels_priority ON loyalty_levels(priority DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_levels_active ON loyalty_levels(is_active) WHERE is_active = true;

-- Начальные данные
INSERT INTO loyalty_levels (level_key, level_name, min_orders_amount, min_orders_count, discount_percent, color, icon, priority) VALUES
    ('standard', 'Стандарт', 0, 0, 0, '#64748b', 'user', 0),
    ('silver', 'Серебро', 50000, 3, 5, '#94a3b8', 'award', 1),
    ('gold', 'Золото', 150000, 10, 10, '#f59e0b', 'crown', 2)
ON CONFLICT (level_key) DO NOTHING;

-- Добавляем поля лояльности в таблицу clients
-- Note: Making it nullable and adding FK
ALTER TABLE clients ADD COLUMN IF NOT EXISTS loyalty_level_id UUID REFERENCES loyalty_levels(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS loyalty_level_set_manually BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS loyalty_level_changed_at TIMESTAMP WITH TIME ZONE;

-- Индекс
CREATE INDEX IF NOT EXISTS idx_clients_loyalty_level ON clients(loyalty_level_id);

-- Комментарии
COMMENT ON TABLE loyalty_levels IS 'Настройки уровней лояльности клиентов';
COMMENT ON COLUMN clients.loyalty_level_id IS 'Текущий уровень лояльности клиента';
COMMENT ON COLUMN clients.loyalty_level_set_manually IS 'Уровень установлен вручную (не пересчитывать автоматически)';
