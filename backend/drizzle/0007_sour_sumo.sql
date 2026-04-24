ALTER TABLE "reservation" ADD COLUMN "stripe_invoice_id" varchar;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "stripe_customer_id" text;