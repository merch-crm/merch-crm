ALTER TABLE "clients" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "first_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "patronymic" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "company" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "telegram" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "comments" text;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "contact_person";