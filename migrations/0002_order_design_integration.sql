-- migrations/20260309_order_design_integration.sql

-- Enum для статуса дизайна
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item_design_status') THEN
        CREATE TYPE order_item_design_status AS ENUM (
          'not_required',
          'pending',
          'in_progress',
          'review',
          'approved',
          'revision'
        );
    END IF;
END
$$;

-- Дизайн-задачи для заказов
CREATE TABLE IF NOT EXISTS order_design_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  application_type_id UUID REFERENCES application_types(id) ON DELETE SET NULL,
  source_design_id UUID REFERENCES print_designs(id) ON DELETE SET NULL,
  print_area VARCHAR(50),
  quantity INTEGER DEFAULT 1,
  colors INTEGER,
  status order_item_design_status NOT NULL DEFAULT 'pending',
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  client_notes TEXT,
  internal_notes TEXT,
  priority INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_design_tasks_order_id_idx ON order_design_tasks(order_id);
CREATE INDEX IF NOT EXISTS order_design_tasks_order_item_id_idx ON order_design_tasks(order_item_id);
CREATE INDEX IF NOT EXISTS order_design_tasks_status_idx ON order_design_tasks(status);
CREATE INDEX IF NOT EXISTS order_design_tasks_assignee_id_idx ON order_design_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS order_design_tasks_due_date_idx ON order_design_tasks(due_date);
CREATE INDEX IF NOT EXISTS order_design_tasks_sort_order_idx ON order_design_tasks(sort_order);

-- Файлы дизайна
CREATE TABLE IF NOT EXISTS order_design_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES order_design_tasks(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  thumbnail_path TEXT,
  size INTEGER NOT NULL,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  comment TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_design_files_task_id_idx ON order_design_files(task_id);
CREATE INDEX IF NOT EXISTS order_design_files_type_idx ON order_design_files(type);
CREATE INDEX IF NOT EXISTS order_design_files_is_active_idx ON order_design_files(is_active);

-- История дизайна
CREATE TABLE IF NOT EXISTS order_design_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES order_design_tasks(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  comment TEXT,
  performed_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_design_history_task_id_idx ON order_design_history(task_id);
CREATE INDEX IF NOT EXISTS order_design_history_event_idx ON order_design_history(event);
CREATE INDEX IF NOT EXISTS order_design_history_created_at_idx ON order_design_history(created_at);

-- Добавляем поля в order_items для дизайна
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'design_status') THEN
        ALTER TABLE order_items ADD COLUMN design_status order_item_design_status DEFAULT 'not_required';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'design_task_id') THEN
        ALTER TABLE order_items ADD COLUMN design_task_id UUID REFERENCES order_design_tasks(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'application_type_id') THEN
        ALTER TABLE order_items ADD COLUMN application_type_id UUID REFERENCES application_types(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'print_file_path') THEN
        ALTER TABLE order_items ADD COLUMN print_file_path TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'mockup_path') THEN
        ALTER TABLE order_items ADD COLUMN mockup_path TEXT;
    END IF;
END
$$;
