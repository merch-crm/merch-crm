CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_created_idx" ON "accounts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "two_factors_user_idx" ON "two_factors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "two_factors_created_idx" ON "two_factors" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "verification_tokens_created_idx" ON "verification_tokens" USING btree ("created_at");