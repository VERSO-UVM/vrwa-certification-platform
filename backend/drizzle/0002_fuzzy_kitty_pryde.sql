CREATE TABLE "profile" (
	"id" varchar PRIMARY KEY NOT NULL,
	"accountId" varchar NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"profileId" varchar NOT NULL,
	"courseEventId" varchar NOT NULL,
	"creditHours" numeric NOT NULL,
	"paymentStatus" varchar NOT NULL,
	CONSTRAINT "id" PRIMARY KEY("profileId","courseEventId")
);
--> statement-breakpoint
ALTER TABLE "user" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "userId" TO "accountId";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "user_email_unique";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "user_orgId_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_profileId_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_courseEventId_courseEvent_id_fk" FOREIGN KEY ("courseEventId") REFERENCES "public"."courseEvent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_accountId_account_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "firstName";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "lastName";--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_email_unique" UNIQUE("email");