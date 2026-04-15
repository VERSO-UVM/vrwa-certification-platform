ALTER TABLE "account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password";