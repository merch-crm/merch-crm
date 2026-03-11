-- migrations/production_full.sql

-- Enums
DO $$ BEGIN
    CREATE TYPE equipment_status AS ENUM ('active', 'maintenance', 'repair', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production_task_status AS ENUM ('pending', 'in_progress', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE production_task_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Оборудование
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  max_width INTEGER,
  max_height INTEGER,
  speed INTEGER,
  application_type_ids JSONB DEFAULT '[]',
  status equipment_status NOT NULL DEFAULT 'active',
  location VARCHAR(255),
  last_maintenance_at TIMESTAMP,
  next_maintenance_at TIMESTAMP,
  maintenance_notes TEXT,
  image_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS equipment_code_idx ON equipment(code);
CREATE INDEX IF NOT EXISTS equipment_category_idx ON equipment(category);
CREATE INDEX IF NOT EXISTS equipment_status_idx ON equipment(status);

-- Производственные линии
CREATE TABLE IF NOT EXISTS production_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  application_type_id UUID REFERENCES application_types(id) ON DELETE SET NULL,
  equipment_ids JSONB DEFAULT '[]',
  capacity INTEGER DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  color VARCHAR(7),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS production_lines_code_idx ON production_lines(code);
CREATE INDEX IF NOT EXISTS production_lines_app_type_idx ON production_lines(application_type_id);
CREATE INDEX IF NOT EXISTS production_lines_is_active_idx ON production_lines(is_active);

-- Сотрудники производства
CREATE TABLE IF NOT EXISTS production_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  position VARCHAR(100),
  specialization_ids JSONB DEFAULT '[]',
  line_ids JSONB DEFAULT '[]',
  hourly_rate INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_path TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS production_staff_user_id_idx ON production_staff(user_id);
CREATE INDEX IF NOT EXISTS production_staff_is_active_idx ON production_staff(is_active);

-- Производственные задачи
CREATE TABLE IF NOT EXISTS production_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(50) NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  application_type_id UUID REFERENCES application_types(id) ON DELETE SET NULL,
  line_id UUID REFERENCES production_lines(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES production_staff(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  completed_quantity INTEGER DEFAULT 0,
  status production_task_status NOT NULL DEFAULT 'pending',
  priority production_task_priority NOT NULL DEFAULT 'normal',
  start_date TIMESTAMP,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  estimated_time INTEGER,
  actual_time INTEGER,
  design_files JSONB DEFAULT '[]',
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS production_tasks_number_idx ON production_tasks(number);
CREATE INDEX IF NOT EXISTS production_tasks_order_id_idx ON production_tasks(order_id);
CREATE INDEX IF NOT EXISTS production_tasks_line_id_idx ON production_tasks(line_id);
CREATE INDEX IF NOT EXISTS production_tasks_assignee_id_idx ON production_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS production_tasks_status_idx ON production_tasks(status);
CREATE INDEX IF NOT EXISTS production_tasks_priority_idx ON production_tasks(priority);
CREATE INDEX IF NOT EXISTS production_tasks_due_date_idx ON production_tasks(dueDate);
CREATE INDEX IF NOT EXISTS production_tasks_sort_order_idx ON production_tasks(sort_order);

-- Логи производства
CREATE TABLE IF NOT EXISTS production_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES production_tasks(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  details JSONB,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS production_logs_task_id_idx ON production_logs(task_id);
CREATE INDEX IF NOT EXISTS production_logs_event_idx ON production_logs(event);
CREATE INDEX IF NOT EXISTS production_logs_created_at_idx ON production_logs(created_at);

-- Начальные данные для оборудования
INSERT INTO equipment (name, code, category, brand, model, status) 
SELECT 'DTF принтер Epson L1800', 'DTF-001', 'printer', 'Epson', 'L1800', 'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE code = 'DTF-001');

INSERT INTO equipment (name, code, category, brand, model, status)
SELECT 'Термопресс 40x60', 'PRESS-001', 'press', 'Generic', '40x60', 'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE code = 'PRESS-001');

INSERT INTO equipment (name, code, category, brand, model, status)
SELECT 'Режущий плоттер', 'CUT-001', 'cutter', 'Silhouette', 'Cameo 4', 'active'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE code = 'CUT-001');

-- Начальные линии
INSERT INTO production_lines (name, code, capacity, color)
SELECT 'Линия DTF #1', 'LINE-DTF-1', 100, '#3B82F6'
WHERE NOT EXISTS (SELECT 1 FROM production_lines WHERE code = 'LINE-DTF-1');

INSERT INTO production_lines (name, code, capacity, color)
SELECT 'Линия вышивки #1', 'LINE-EMB-1', 50, '#EC4899'
WHERE NOT EXISTS (SELECT 1 FROM production_lines WHERE code = 'LINE-EMB-1');
