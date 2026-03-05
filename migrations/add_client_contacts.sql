-- Таблица контактных лиц для B2B клиентов
CREATE TABLE IF NOT EXISTS client_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Основная информация
    name TEXT NOT NULL,
    position TEXT,  -- Должность: "Генеральный директор", "Менеджер по закупкам"
    role TEXT NOT NULL DEFAULT 'other',  -- Роль: 'lpr', 'accountant', 'buyer', 'other'
    
    -- Контакты
    phone TEXT,
    email TEXT,
    telegram TEXT,
    
    -- Флаги
    is_primary BOOLEAN DEFAULT false,  -- Основной контакт
    
    -- Метаданные
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_client_contacts_client_id ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_contacts_role ON client_contacts(role);
CREATE INDEX IF NOT EXISTS idx_client_contacts_is_primary ON client_contacts(is_primary) WHERE is_primary = true;

-- Ограничение: только один primary контакт на клиента
CREATE UNIQUE INDEX IF NOT EXISTS idx_client_contacts_unique_primary 
ON client_contacts(client_id) 
WHERE is_primary = true;

-- Комментарии
COMMENT ON TABLE client_contacts IS 'Контактные лица для B2B клиентов';
COMMENT ON COLUMN client_contacts.role IS 'Роль: lpr (ЛПР), accountant (бухгалтер), buyer (закупщик), other (другое)';
COMMENT ON COLUMN client_contacts.is_primary IS 'Основной контакт для связи';
