CREATE TABLE "course" (
	"id" varchar PRIMARY KEY NOT NULL,
	"courseName" text NOT NULL,
	"description" text,
	"creditHours" integer NOT NULL,
	"priceCents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courseEvent" (
	"id" varchar PRIMARY KEY NOT NULL,
	"courseId" varchar NOT NULL,
	"locationType" varchar NOT NULL,
	"virtualLink" text,
	"physicalAddress" text,
	"seats" integer,
	"classStartDatetime" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" varchar PRIMARY KEY NOT NULL,
	"orgName" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"expiresAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" varchar PRIMARY KEY NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"hasRegistered" boolean,
	"email" text NOT NULL,
	"password" text,
	"role" varchar NOT NULL,
	"orgId" varchar,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courseEvent" ADD CONSTRAINT "courseEvent_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "user" USING btree ("email");