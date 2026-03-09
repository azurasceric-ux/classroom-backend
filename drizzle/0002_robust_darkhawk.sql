ALTER TABLE "account" ADD CONSTRAINT "account_account_id_unique" UNIQUE("account_id");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_provider_id_unique" UNIQUE("provider_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");