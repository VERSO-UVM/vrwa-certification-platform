CREATE TYPE "public"."courseStatus" AS ENUM('active', 'deleted', 'canceled');--> statement-breakpoint
ALTER TABLE "courseEvent" DROP CONSTRAINT "courseEvent_instructorId_profile_id_fk";
--> statement-breakpoint
DROP INDEX "account_issuer_accountId_uidx";--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."courseStatus";--> statement-breakpoint
ALTER TABLE "course" ALTER COLUMN "status" SET DATA TYPE "public"."courseStatus" USING "status"::"public"."courseStatus";--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "active_profile_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "seats" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "instructorId" varchar;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_instructorId_profile_id_fk" FOREIGN KEY ("instructorId") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "issuer";--> statement-breakpoint
ALTER TABLE "courseEvent" DROP COLUMN "seats";--> statement-breakpoint
ALTER TABLE "courseEvent" DROP COLUMN "instructorId";