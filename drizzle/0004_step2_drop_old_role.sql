-- Step 2: Drop old role column after data migration
ALTER TABLE "users" DROP COLUMN "role";
DROP TYPE "public"."role";
