ALTER TABLE "session" ALTER COLUMN "expiresAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "hasRegistered" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "hasRegistered" SET NOT NULL;