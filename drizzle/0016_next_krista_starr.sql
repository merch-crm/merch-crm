CREATE TYPE "public"."camera_status" AS ENUM('online', 'offline', 'error', 'connecting');--> statement-breakpoint
CREATE TYPE "public"."presence_event_type" AS ENUM('detected', 'lost', 'recognized', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('work', 'break', 'idle');--> statement-breakpoint
CREATE TABLE "cameras" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"xiaomi_account_id" uuid,
	"device_id" varchar(100) NOT NULL,
	"model" varchar(100),
	"name" varchar(255) NOT NULL,
	"local_name" varchar(255),
	"location" varchar(255),
	"local_ip" varchar(45),
	"stream_url" text,
	"status" "camera_status" DEFAULT 'offline' NOT NULL,
	"last_online_at" timestamp,
	"error_message" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"confidence_threshold" numeric(3, 2) DEFAULT '0.60',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_work_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"first_seen_at" timestamp,
	"last_seen_at" timestamp,
	"work_seconds" integer DEFAULT 0 NOT NULL,
	"idle_seconds" integer DEFAULT 0 NOT NULL,
	"break_seconds" integer DEFAULT 0 NOT NULL,
	"productivity" numeric(5, 2),
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"late_arrival_minutes" integer DEFAULT 0,
	"early_departure_minutes" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_faces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"face_encoding" jsonb NOT NULL,
	"photo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"quality" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "presence_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"camera_id" uuid,
	"workstation_id" uuid,
	"event_type" "presence_event_type" NOT NULL,
	"confidence" numeric(3, 2),
	"face_encoding" jsonb,
	"face_position" jsonb,
	"snapshot_url" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "presence_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"description" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_by_id" uuid,
	CONSTRAINT "presence_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "work_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"camera_id" uuid,
	"date" timestamp NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration_seconds" integer DEFAULT 0,
	"session_type" "session_type" DEFAULT 'work' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workstations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"camera_id" uuid,
	"assigned_user_id" uuid,
	"zone" jsonb,
	"color" varchar(7) DEFAULT '#3B82F6',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"requires_assigned_user" boolean DEFAULT false,
	"last_seen_user_id" uuid,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xiaomi_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"xiaomi_user_id" varchar(50) NOT NULL,
	"email" varchar(255),
	"nickname" varchar(255),
	"encrypted_token" text NOT NULL,
	"region" varchar(10) DEFAULT 'cn' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	CONSTRAINT "xiaomi_accounts_xiaomi_user_id_unique" UNIQUE("xiaomi_user_id")
);
--> statement-breakpoint
CREATE TABLE "client_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"position" text,
	"role" text DEFAULT 'other' NOT NULL,
	"phone" text,
	"email" text,
	"telegram" text,
	"is_primary" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "loyalty_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_key" text NOT NULL,
	"level_name" text NOT NULL,
	"min_orders_amount" numeric(12, 2) DEFAULT '0',
	"min_orders_count" integer DEFAULT 0,
	"discount_percent" numeric(5, 2) DEFAULT '0',
	"bonus_description" text,
	"color" text DEFAULT '#64748b',
	"icon" text DEFAULT 'star',
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "loyalty_levels_level_key_unique" UNIQUE("level_key")
);
--> statement-breakpoint
CREATE TABLE "client_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"channel_id" uuid,
	"channel_type" text NOT NULL,
	"external_chat_id" text,
	"status" text DEFAULT 'active',
	"unread_count" integer DEFAULT 0,
	"last_message_at" timestamp with time zone,
	"last_message_preview" text,
	"assigned_manager_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communication_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"channel_type" text NOT NULL,
	"icon" text,
	"color" text,
	"is_active" boolean DEFAULT true,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"direction" text NOT NULL,
	"message_type" text DEFAULT 'text',
	"content" text,
	"media_url" text,
	"media_type" text,
	"external_message_id" text,
	"status" text DEFAULT 'sent',
	"sent_by_id" uuid,
	"sent_at" timestamp with time zone DEFAULT now(),
	"delivered_at" timestamp with time zone,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"metadata" jsonb DEFAULT '{}'::jsonb
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text,
	"shortcut" text,
	"usage_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "funnel_stage" text DEFAULT 'lead';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "funnel_stage_changed_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lost_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lost_reason" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "loyalty_level_id" uuid;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "loyalty_level_set_manually" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "loyalty_level_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "total_orders_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "total_orders_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "average_check" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_order_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "first_order_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "days_since_last_order" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rfm_recency" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rfm_frequency" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rfm_monetary" integer;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rfm_score" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rfm_segment" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "rfm_calculated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "inventory_attributes" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "cameras" ADD CONSTRAINT "cameras_xiaomi_account_id_xiaomi_accounts_id_fk" FOREIGN KEY ("xiaomi_account_id") REFERENCES "public"."xiaomi_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_work_stats" ADD CONSTRAINT "daily_work_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_faces" ADD CONSTRAINT "employee_faces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_faces" ADD CONSTRAINT "employee_faces_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_camera_id_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."cameras"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence_logs" ADD CONSTRAINT "presence_logs_workstation_id_workstations_id_fk" FOREIGN KEY ("workstation_id") REFERENCES "public"."workstations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presence_settings" ADD CONSTRAINT "presence_settings_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_sessions" ADD CONSTRAINT "work_sessions_camera_id_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."cameras"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_camera_id_cameras_id_fk" FOREIGN KEY ("camera_id") REFERENCES "public"."cameras"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workstations" ADD CONSTRAINT "workstations_assigned_user_id_users_id_fk" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xiaomi_accounts" ADD CONSTRAINT "xiaomi_accounts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_conversations" ADD CONSTRAINT "client_conversations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_conversations" ADD CONSTRAINT "client_conversations_channel_id_communication_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."communication_channels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_conversations" ADD CONSTRAINT "client_conversations_assigned_manager_id_users_id_fk" FOREIGN KEY ("assigned_manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversation_id_client_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."client_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_sent_by_id_users_id_fk" FOREIGN KEY ("sent_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cameras_xiaomi_account_id_idx" ON "cameras" USING btree ("xiaomi_account_id");--> statement-breakpoint
CREATE INDEX "cameras_device_id_idx" ON "cameras" USING btree ("device_id");--> statement-breakpoint
CREATE INDEX "cameras_status_idx" ON "cameras" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cameras_is_enabled_idx" ON "cameras" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "cameras_created_at_idx" ON "cameras" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "daily_work_stats_user_id_idx" ON "daily_work_stats" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_work_stats_date_idx" ON "daily_work_stats" USING btree ("date");--> statement-breakpoint
CREATE INDEX "daily_work_stats_user_date_idx" ON "daily_work_stats" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "daily_work_stats_created_at_idx" ON "daily_work_stats" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "employee_faces_user_id_idx" ON "employee_faces" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "employee_faces_is_active_idx" ON "employee_faces" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "employee_faces_is_primary_idx" ON "employee_faces" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "employee_faces_created_at_idx" ON "employee_faces" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "presence_logs_user_id_idx" ON "presence_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "presence_logs_camera_id_idx" ON "presence_logs" USING btree ("camera_id");--> statement-breakpoint
CREATE INDEX "presence_logs_workstation_id_idx" ON "presence_logs" USING btree ("workstation_id");--> statement-breakpoint
CREATE INDEX "presence_logs_event_type_idx" ON "presence_logs" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "presence_logs_timestamp_idx" ON "presence_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "presence_logs_created_at_idx" ON "presence_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "presence_settings_key_idx" ON "presence_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "presence_settings_created_at_idx" ON "presence_settings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "work_sessions_user_id_idx" ON "work_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "work_sessions_camera_id_idx" ON "work_sessions" USING btree ("camera_id");--> statement-breakpoint
CREATE INDEX "work_sessions_date_idx" ON "work_sessions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "work_sessions_session_type_idx" ON "work_sessions" USING btree ("session_type");--> statement-breakpoint
CREATE INDEX "work_sessions_user_date_idx" ON "work_sessions" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "work_sessions_created_at_idx" ON "work_sessions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "workstations_camera_id_idx" ON "workstations" USING btree ("camera_id");--> statement-breakpoint
CREATE INDEX "workstations_assigned_user_id_idx" ON "workstations" USING btree ("assigned_user_id");--> statement-breakpoint
CREATE INDEX "workstations_is_active_idx" ON "workstations" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "workstations_created_at_idx" ON "workstations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "xiaomi_accounts_xiaomi_user_id_idx" ON "xiaomi_accounts" USING btree ("xiaomi_user_id");--> statement-breakpoint
CREATE INDEX "xiaomi_accounts_email_idx" ON "xiaomi_accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "xiaomi_accounts_is_active_idx" ON "xiaomi_accounts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "xiaomi_accounts_created_at_idx" ON "xiaomi_accounts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_client_id" ON "client_contacts" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_role" ON "client_contacts" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_email" ON "client_contacts" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_phone" ON "client_contacts" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_client_contacts_created_at" ON "client_contacts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_loyalty_levels_priority" ON "loyalty_levels" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "idx_loyalty_levels_created_at" ON "loyalty_levels" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_client_id" ON "client_conversations" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_channel_type" ON "client_conversations" USING btree ("channel_type");--> statement-breakpoint
CREATE INDEX "idx_conversations_status" ON "client_conversations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_conversations_assigned_manager" ON "client_conversations" USING btree ("assigned_manager_id");--> statement-breakpoint
CREATE INDEX "idx_conversations_last_message" ON "client_conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "idx_conversations_created_at" ON "client_conversations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_channels_created_at" ON "communication_channels" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_id" ON "conversation_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_messages_sent_at" ON "conversation_messages" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "idx_messages_direction" ON "conversation_messages" USING btree ("direction");--> statement-breakpoint
CREATE INDEX "idx_messages_status" ON "conversation_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_messages_created_at" ON "conversation_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_templates_category" ON "message_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_templates_shortcut" ON "message_templates" USING btree ("shortcut");--> statement-breakpoint
CREATE INDEX "idx_templates_created_at" ON "message_templates" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_loyalty_level_id_loyalty_levels_id_fk" FOREIGN KEY ("loyalty_level_id") REFERENCES "public"."loyalty_levels"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_attributes" ADD CONSTRAINT "inventory_attributes_category_id_inventory_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."inventory_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_clients_funnel_stage" ON "clients" USING btree ("funnel_stage");--> statement-breakpoint
CREATE INDEX "idx_clients_loyalty_level" ON "clients" USING btree ("loyalty_level_id");--> statement-breakpoint
CREATE INDEX "idx_clients_total_orders_count" ON "clients" USING btree ("total_orders_count");--> statement-breakpoint
CREATE INDEX "idx_clients_total_orders_amount" ON "clients" USING btree ("total_orders_amount");--> statement-breakpoint
CREATE INDEX "idx_clients_last_order_at" ON "clients" USING btree ("last_order_at");--> statement-breakpoint
CREATE INDEX "idx_clients_rfm_segment" ON "clients" USING btree ("rfm_segment");--> statement-breakpoint
CREATE INDEX "idx_clients_rfm_score" ON "clients" USING btree ("rfm_score");--> statement-breakpoint
CREATE INDEX "inv_attr_category_idx" ON "inventory_attributes" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "inv_attr_type_value_category_idx" ON "inventory_attributes" USING btree ("type","value","category_id");