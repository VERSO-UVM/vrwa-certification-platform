ALTER TABLE "reservation" DROP CONSTRAINT "id";--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "id" varchar;--> statement-breakpoint
ALTER TABLE "reservation" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_profileId_courseId_unique" UNIQUE("profileId","courseId");