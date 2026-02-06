import { asc, getTableColumns } from "drizzle-orm";
import db from "src/database";
import { account, courseEvent, profile, reservation } from "src/database/schema";
import type { AccountInfo, CourseEvent, Profile, Reservation } from "src/database/schema";
import { basicProcedure, router } from "src/utils/trpc";

//createCourseEvent
//updateCourseEvent
//deleteCourseEvent

//addTrainee
//removeTrainee

//getCourseRoster
//getCourseStats
