ALTER TABLE "reservation" ADD COLUMN "memberRate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "stripeCheckoutSessionId" varchar;