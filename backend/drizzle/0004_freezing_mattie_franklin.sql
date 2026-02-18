CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
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
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization" RENAME COLUMN "orgName" TO "name";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "accountId" TO "user_id";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_email_unique";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_orgId_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "profile" DROP CONSTRAINT "profile_accountId_account_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_accountId_account_id_fk";
--> statement-breakpoint
DROP INDEX "email_idx";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organization" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "account_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "provider_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "access_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_organization_id" text;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_accountId_user_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_id_idx" ON "course" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "courseEvent_id_idx" ON "courseEvent" USING btree ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reservation_profileId_idx" ON "reservation" USING btree ("profileId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "hasRegistered";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "passwordHash";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "role";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "orgId";--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");