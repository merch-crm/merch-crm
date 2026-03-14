-- ============================================================================
-- METER PRICE TIERS - Прогрессивная шкала цен за погонный метр
-- ============================================================================

CREATE TABLE IF NOT EXISTS meter_price_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_type VARCHAR(50) NOT NULL,
    roll_width_mm INTEGER NOT NULL,
    from_meters DECIMAL(10, 2) NOT NULL,
    to_meters DECIMAL(10, 2),
    price_per_meter DECIMAL(10, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS meter_price_tiers_application_type_idx 
    ON meter_price_tiers(application_type);
CREATE INDEX IF NOT EXISTS meter_price_tiers_roll_width_idx 
    ON meter_price_tiers(roll_width_mm);
CREATE INDEX IF NOT EXISTS meter_price_tiers_active_idx 
    ON meter_price_tiers(application_type, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS meter_price_tiers_unique_idx 
    ON meter_price_tiers(application_type, roll_width_mm, from_meters);

-- ============================================================================
-- PRINT PLACEMENTS - Типы нанесений (места на изделии)
-- ============================================================================

CREATE TABLE IF NOT EXISTS print_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    width_mm INTEGER NOT NULL,
    height_mm INTEGER NOT NULL,
    work_price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS print_placements_application_type_idx 
    ON print_placements(application_type);
CREATE INDEX IF NOT EXISTS print_placements_active_idx 
    ON print_placements(application_type, is_active);
CREATE UNIQUE INDEX IF NOT EXISTS print_placements_slug_idx 
    ON print_placements(application_type, slug);

-- ============================================================================
-- CALCULATOR CONSUMABLES SETTINGS - Настройки расхода материалов
-- ============================================================================

CREATE TABLE IF NOT EXISTS calculator_consumables_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_type VARCHAR(50) NOT NULL UNIQUE,
    ink_white_per_m2 DECIMAL(10, 2),
    ink_cmyk_per_m2 DECIMAL(10, 2),
    powder_per_m2 DECIMAL(10, 2),
    paper_per_m2 DECIMAL(10, 2),
    fill_percent INTEGER NOT NULL DEFAULT 80,
    waste_percent INTEGER NOT NULL DEFAULT 10,
    config JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PRINT CALCULATIONS - Сохранённые расчёты
-- ============================================================================

CREATE TABLE IF NOT EXISTS print_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calculation_number VARCHAR(50) NOT NULL UNIQUE,
    application_type VARCHAR(50) NOT NULL,
    
    -- Параметры
    roll_width_mm INTEGER NOT NULL,
    edge_margin_mm INTEGER NOT NULL DEFAULT 10,
    print_gap_mm INTEGER NOT NULL DEFAULT 10,
    
    -- Результаты раскладки
    total_prints INTEGER NOT NULL,
    total_length_m DECIMAL(10, 3) NOT NULL,
    total_area_m2 DECIMAL(10, 4) NOT NULL,
    prints_area_m2 DECIMAL(10, 4) NOT NULL,
    efficiency_percent DECIMAL(5, 2) NOT NULL,
    
    -- Стоимость
    price_per_meter DECIMAL(10, 2) NOT NULL,
    print_cost DECIMAL(12, 2) NOT NULL,
    placement_cost DECIMAL(12, 2) NOT NULL,
    materials_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(12, 2) NOT NULL,
    
    -- Статистика
    avg_cost_per_print DECIMAL(10, 2) NOT NULL,
    min_cost_per_print DECIMAL(10, 2) NOT NULL,
    max_cost_per_print DECIMAL(10, 2) NOT NULL,
    
    -- JSON данные
    consumption_data JSONB,
    
    -- Связи
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS print_calculations_application_type_idx 
    ON print_calculations(application_type);
CREATE INDEX IF NOT EXISTS print_calculations_order_id_idx 
    ON print_calculations(order_id);
CREATE INDEX IF NOT EXISTS print_calculations_created_by_idx 
    ON print_calculations(created_by);
CREATE INDEX IF NOT EXISTS print_calculations_created_at_idx 
    ON print_calculations(created_at);
CREATE INDEX IF NOT EXISTS print_calculations_number_idx 
    ON print_calculations(calculation_number);

-- ============================================================================
-- PRINT CALCULATION GROUPS - Группы принтов в расчёте
-- ============================================================================

CREATE TABLE IF NOT EXISTS print_calculation_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calculation_id UUID NOT NULL REFERENCES print_calculations(id) ON DELETE CASCADE,
    
    -- Параметры принта
    name VARCHAR(100),
    width_mm INTEGER NOT NULL,
    height_mm INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    
    -- Раскладка
    prints_per_row INTEGER NOT NULL,
    rows_count INTEGER NOT NULL,
    section_length_mm INTEGER NOT NULL,
    section_area_m2 DECIMAL(10, 4) NOT NULL,
    
    -- Нанесение
    placement_id UUID REFERENCES print_placements(id) ON DELETE SET NULL,
    placement_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    
    -- Стоимость
    section_cost DECIMAL(12, 2) NOT NULL,
    cost_per_print DECIMAL(10, 2) NOT NULL,
    
    -- Визуализация
    color VARCHAR(7) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS print_calculation_groups_calculation_id_idx 
    ON print_calculation_groups(calculation_id);
CREATE INDEX IF NOT EXISTS print_calculation_groups_placement_id_idx 
    ON print_calculation_groups(placement_id);

-- ============================================================================
-- TRIGGER для автообновления updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;

$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_meter_price_tiers_updated_at
    BEFORE UPDATE ON meter_price_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_print_placements_updated_at
    BEFORE UPDATE ON print_placements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_calculator_consumables_settings_updated_at
    BEFORE UPDATE ON calculator_consumables_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_print_calculations_updated_at
    BEFORE UPDATE ON print_calculations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
