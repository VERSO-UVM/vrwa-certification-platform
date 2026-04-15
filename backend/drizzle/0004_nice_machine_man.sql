ALTER TABLE "reservation" ADD COLUMN "status" varchar DEFAULT 'registered' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;