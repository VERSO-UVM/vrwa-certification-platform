CREATE TABLE "attendance" (
	"profileId" varchar NOT NULL,
	"courseId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"hours" numeric(6, 3) NOT NULL,
	CONSTRAINT "attendance_profileId_courseId_type_pk" PRIMARY KEY("profileId","courseId","type")
);
--> statement-breakpoint
CREATE TABLE "courseCredit" (
	"courseId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"hours" numeric(6, 3) NOT NULL,
	CONSTRAINT "courseCredit_courseId_type_pk" PRIMARY KEY("courseId","type")
);
--> statement-breakpoint
DROP INDEX "organization_slug_uidx";--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "active_profile_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "status" varchar DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "tags" text[] DEFAULT ARRAY[]::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "issuer" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_profileId_profile_id_fk" FOREIGN KEY ("profileId") REFERENCES "public"."profile"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courseCredit" ADD CONSTRAINT "courseCredit_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" USING btree ("issuer","account_id");