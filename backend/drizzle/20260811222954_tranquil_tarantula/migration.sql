CREATE TYPE "courseLocation" AS ENUM('in-person', 'virtual', 'hybrid');--> statement-breakpoint
CREATE TYPE "courseStatus" AS ENUM('active', 'deleted', 'canceled');--> statement-breakpoint
CREATE TYPE "creditHourType" AS ENUM('wastewater', 'waterCategoryOne', 'waterCategoryTwo', 'waterCategoryThree');--> statement-breakpoint
CREATE TYPE "paymentStatus" AS ENUM('paid', 'unpaid');--> statement-breakpoint
CREATE TABLE "attendance" (
	"profileId" varchar,
	"courseId" varchar,
	"type" varchar,
	"creditHours" numeric(6,3) NOT NULL,
	CONSTRAINT "attendance_pkey" PRIMARY KEY("profileId","courseId","type")
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" varchar PRIMARY KEY,
	"courseName" text NOT NULL,
	"description" text,
	"creditHours" integer NOT NULL,
	"priceCents" integer NOT NULL,
	"seats" integer NOT NULL,
	"instructorId" varchar,
	"status" "courseStatus" DEFAULT 'active'::"courseStatus" NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courseEvent" (
	"id" varchar PRIMARY KEY,
	"courseId" varchar NOT NULL,
	"locationType" varchar NOT NULL,
	"virtualLink" text,
	"physicalAddress" text,
	"classStartDatetime" timestamp with time zone,
	"duration" interval
);
--> statement-breakpoint
CREATE TABLE "courseMatter" (
	"courseId" varchar,
	"type" "creditHourType",
	"creditHours" numeric(6,3) NOT NULL,
	CONSTRAINT "courseMatter_pkey" PRIMARY KEY("courseId","type")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" varchar PRIMARY KEY,
	"userId" varchar NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"postalCode" text NOT NULL,
	"phoneNumber" text NOT NULL,
	"association" text
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"profileId" varchar,
	"courseId" varchar,
	"creditHours" numeric NOT NULL,
	"paymentStatus" "paymentStatus" NOT NULL,
	"createdAt" timestamp,
	CONSTRAINT "id" PRIMARY KEY("profileId","courseId")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY,
	"issuer" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	"active_profile_id" text
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" ("user_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" ("slug");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_profileId_profile_id_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id");--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id");--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_instructorId_profile_id_fkey" FOREIGN KEY ("instructorId") REFERENCES "profile"("id");--> statement-breakpoint
ALTER TABLE "courseEvent" ADD CONSTRAINT "courseEvent_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "courseMatter" ADD CONSTRAINT "courseMatter_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id");--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_user_id_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id");--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_profileId_profile_id_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id");--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fkey" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;