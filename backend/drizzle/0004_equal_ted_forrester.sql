ALTER TABLE "reservation" DROP CONSTRAINT "reservation_courseEventId_courseEvent_id_fk";
--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_courseEventId_courseEvent_id_fk" FOREIGN KEY ("courseEventId") REFERENCES "public"."courseEvent"("id") ON DELETE cascade ON UPDATE no action;