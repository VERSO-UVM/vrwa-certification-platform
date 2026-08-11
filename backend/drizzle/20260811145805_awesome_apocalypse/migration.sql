ALTER TABLE "reservation" DROP CONSTRAINT "reservation_courseEventId_courseEvent_id_fk";--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "courseId" varchar;--> statement-breakpoint
ALTER TABLE "reservation" DROP COLUMN "courseEventId";--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "id" PRIMARY KEY("profileId","courseId");--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_courseId_course_id_fkey" FOREIGN KEY ("courseId") REFERENCES "course"("id") ON DELETE CASCADE;