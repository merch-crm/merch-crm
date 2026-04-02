ALTER TYPE "public"."security_event_type" ADD VALUE 'password_reset_requested' BEFORE 'email_change';--> statement-breakpoint
ALTER TYPE "public"."security_event_type" ADD VALUE 'rate_limit_exceeded' BEFORE 'admin_impersonation_start';--> statement-breakpoint
CREATE TABLE "calculator_consumables_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_type" varchar(50) NOT NULL,
	"ink_white_per_m2" numeric(10, 2),
	"ink_cmyk_per_m2" numeric(10, 2),
	"powder_per_m2" numeric(10, 2),
	"paper_per_m2" numeric(10, 2),
	"fill_percent" integer DEFAULT 80 NOT NULL,
	"waste_percent" integer DEFAULT 10 NOT NULL,
	"config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "calculator_consumables_settings_application_type_unique" UNIQUE("application_type")
);
--> statement-breakpoint
CREATE TABLE "meter_price_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_type" varchar(50) NOT NULL,
	"roll_width_mm" integer NOT NULL,
	"from_meters" numeric(10, 2) NOT NULL,
	"to_meters" numeric(10, 2),
	"price_per_meter" numeric(10, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_calculation_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_id" uuid NOT NULL,
	"name" varchar(100),
	"width_mm" integer NOT NULL,
	"height_mm" integer NOT NULL,
	"quantity" integer NOT NULL,
	"prints_per_row" integer NOT NULL,
	"rows_count" integer NOT NULL,
	"section_length_mm" integer NOT NULL,
	"section_area_m2" numeric(10, 4) NOT NULL,
	"placement_id" uuid,
	"placement_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"section_cost" numeric(12, 2) NOT NULL,
	"cost_per_print" numeric(10, 2) NOT NULL,
	"color" varchar(7) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "print_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calculation_number" varchar(50) NOT NULL,
	"application_type" varchar(50) NOT NULL,
	"roll_width_mm" integer NOT NULL,
	"edge_margin_mm" integer DEFAULT 10 NOT NULL,
	"print_gap_mm" integer DEFAULT 10 NOT NULL,
	"total_prints" integer NOT NULL,
	"total_length_m" numeric(10, 3) NOT NULL,
	"total_area_m2" numeric(10, 4) NOT NULL,
	"prints_area_m2" numeric(10, 4) NOT NULL,
	"efficiency_percent" numeric(5, 2) NOT NULL,
	"price_per_meter" numeric(10, 2) NOT NULL,
	"print_cost" numeric(12, 2) NOT NULL,
	"placement_cost" numeric(12, 2) NOT NULL,
	"materials_cost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"avg_cost_per_print" numeric(10, 2) NOT NULL,
	"min_cost_per_print" numeric(10, 2) NOT NULL,
	"max_cost_per_print" numeric(10, 2) NOT NULL,
	"consumption_data" jsonb,
	"order_id" uuid,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "print_calculations_calculation_number_unique" UNIQUE("calculation_number")
);
--> statement-breakpoint
CREATE TABLE "print_placements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_type" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" varchar(255),
	"width_mm" integer NOT NULL,
	"height_mm" integer NOT NULL,
	"work_price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "production_tasks" ADD COLUMN "defect_quantity" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD COLUMN "defect_category" varchar(50);--> statement-breakpoint
ALTER TABLE "production_tasks" ADD COLUMN "defect_comment" text;--> statement-breakpoint
ALTER TABLE "print_calculation_groups" ADD CONSTRAINT "print_calculation_groups_calculation_id_print_calculations_id_fk" FOREIGN KEY ("calculation_id") REFERENCES "public"."print_calculations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_calculation_groups" ADD CONSTRAINT "print_calculation_groups_placement_id_print_placements_id_fk" FOREIGN KEY ("placement_id") REFERENCES "public"."print_placements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_calculations" ADD CONSTRAINT "print_calculations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "print_calculations" ADD CONSTRAINT "print_calculations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "calculator_consumables_settings_created_at_idx" ON "calculator_consumables_settings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "meter_price_tiers_application_type_idx" ON "meter_price_tiers" USING btree ("application_type");--> statement-breakpoint
CREATE INDEX "meter_price_tiers_roll_width_idx" ON "meter_price_tiers" USING btree ("roll_width_mm");--> statement-breakpoint
CREATE INDEX "meter_price_tiers_active_idx" ON "meter_price_tiers" USING btree ("application_type","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "meter_price_tiers_unique_idx" ON "meter_price_tiers" USING btree ("application_type","roll_width_mm","from_meters");--> statement-breakpoint
CREATE INDEX "meter_price_tiers_created_at_idx" ON "meter_price_tiers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_calculation_groups_calculation_id_idx" ON "print_calculation_groups" USING btree ("calculation_id");--> statement-breakpoint
CREATE INDEX "print_calculation_groups_placement_id_idx" ON "print_calculation_groups" USING btree ("placement_id");--> statement-breakpoint
CREATE INDEX "print_calculation_groups_created_at_idx" ON "print_calculation_groups" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_calculations_application_type_idx" ON "print_calculations" USING btree ("application_type");--> statement-breakpoint
CREATE INDEX "print_calculations_order_id_idx" ON "print_calculations" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "print_calculations_created_by_idx" ON "print_calculations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "print_calculations_created_at_idx" ON "print_calculations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "print_calculations_number_idx" ON "print_calculations" USING btree ("calculation_number");--> statement-breakpoint
CREATE INDEX "print_placements_application_type_idx" ON "print_placements" USING btree ("application_type");--> statement-breakpoint
CREATE INDEX "print_placements_active_idx" ON "print_placements" USING btree ("application_type","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "print_placements_slug_idx" ON "print_placements" USING btree ("application_type","slug");--> statement-breakpoint
CREATE INDEX "print_placements_created_at_idx" ON "print_placements" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_production_tasks_defect_category" ON "production_tasks" USING btree ("defect_category") WHERE "production_tasks"."defect_quantity" > 0;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "password_hash";