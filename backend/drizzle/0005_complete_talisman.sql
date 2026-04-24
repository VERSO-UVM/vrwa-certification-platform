ALTER TABLE "courseEvent" DROP CONSTRAINT "courseEvent_courseId_course_id_fk";
--> statement-breakpoint
ALTER TABLE "courseEvent" ADD CONSTRAINT "courseEvent_courseId_course_id_fk" FOREIGN KEY ("courseId") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;