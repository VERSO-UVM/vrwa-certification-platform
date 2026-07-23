import { asc, eq } from "drizzle-orm";
import { instructorProcedure, router } from "~/utils/trpc";
import { type CourseEventDto } from "~/database/dtos";
import { courseEvent } from "~/database/schema";
import { courseEventQuery } from "~/database/queries";


export const instructorRouter = router({
});
