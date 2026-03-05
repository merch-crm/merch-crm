-- Таблица каналов коммуникации
CREATE TABLE communication_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- telegram, instagram, vk, whatsapp, email, sms
  icon TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Начальные данные каналов
INSERT INTO communication_channels (name, channel_type, icon, color, is_active) VALUES
  ('Telegram', 'telegram', 'Send', '#26A5E4', true),
  ('Instagram', 'instagram', 'Instagram', '#E4405F', true),
  ('ВКонтакте', 'vk', 'Globe', '#4680C2', true),
  ('WhatsApp', 'whatsapp', 'MessageCircle', '#25D366', false),
  ('Email', 'email', 'Mail', '#6366F1', true),
  ('SMS', 'sms', 'Smartphone', '#10B981', false);

-- Таблица чатов/диалогов с клиентами
CREATE TABLE client_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES communication_channels(id),
  channel_type TEXT NOT NULL,
  external_chat_id TEXT, -- ID чата во внешней системе
  status TEXT DEFAULT 'active', -- active, archived, blocked
  unread_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  assigned_manager_id UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conversations_client_id ON client_conversations(client_id);
CREATE INDEX idx_conversations_channel_type ON client_conversations(channel_type);
CREATE INDEX idx_conversations_status ON client_conversations(status);
CREATE INDEX idx_conversations_assigned_manager ON client_conversations(assigned_manager_id);
CREATE INDEX idx_conversations_last_message ON client_conversations(last_message_at DESC);

-- Таблица сообщений
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES client_conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL, -- inbound, outbound
  message_type TEXT DEFAULT 'text', -- text, image, file, voice, sticker
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  external_message_id TEXT,
  status TEXT DEFAULT 'sent', -- pending, sent, delivered, read, failed
  sent_by_id UUID REFERENCES users(id), -- NULL для входящих от клиента
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON conversation_messages(sent_at DESC);
CREATE INDEX idx_messages_direction ON conversation_messages(direction);

-- Таблица шаблонов быстрых ответов
CREATE TABLE message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT, -- greeting, info, closing, promo
  shortcut TEXT, -- быстрый код для вставки, например /hello
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON message_templates(category);
CREATE INDEX idx_templates_shortcut ON message_templates(shortcut);

-- Начальные шаблоны
INSERT INTO message_templates (title, content, category, shortcut) VALUES
  ('Приветствие', 'Здравствуйте! Чем могу помочь?', 'greeting', '/hi'),
  ('Благодарность', 'Спасибо за обращение! Если возникнут вопросы — пишите.', 'closing', '/thanks'),
  ('Уточнение заказа', 'Подскажите, пожалуйста, номер вашего заказа.', 'info', '/order'),
  ('Время работы', 'Мы работаем с 9:00 до 18:00 по будням.', 'info', '/time'),
  ('Ожидание', 'Минуту, уточняю информацию...', 'info', '/wait');

COMMENT ON TABLE client_conversations IS 'Диалоги с клиентами по разным каналам';
COMMENT ON TABLE conversation_messages IS 'Сообщения в диалогах';
COMMENT ON TABLE message_templates IS 'Шаблоны быстрых ответов';
