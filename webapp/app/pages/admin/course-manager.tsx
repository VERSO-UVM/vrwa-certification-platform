import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "~/components/ui/card";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import {
  courseDefPresets,
  courseDefs,
  courseFieldHelper,
} from "~/utils/field-defs/course";
import { courseStartDate } from "~/utils/utils";
import { CourseStatus } from "@backend/database/schema";
import { CloneCourse } from "./course-manager/clone-course";
import { useMemo } from "react";
import { EditDrawer } from "~/components/entry-views/edit-drawer";
import type { CourseDto } from "@backend/database/dtos";
import { useNavigate } from "react-router";

export function meta() {
  return [{ title: "Course Manager - VRWA Training Database" }];
}

const courseTableDefs = [
  ...courseDefPresets.table,
  courseFieldHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CloneCourse course={row.original} />,
  }),
];

const courseFormDefs = [
  courseDefs.courseName,
  courseDefs.description,
  courseDefs.priceCents,
  courseDefs.creditHours,
  courseDefs.spots,
];

const emptyCourse = {
  courseName: "",
  description: "",
  priceCents: 0,
  creditHours: "",
  seats: 0,
  sessions: [],
  instructorId: null,
  creditHourCategories: [],
  status: CourseStatus.Active,
  id: "",
  spotsFilled: 0,
  tags: [],
  waitlistSize: 0,
} as CourseDto;

export default function CourseManager() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { data: courses } = useQuery(trpc.courses.admin.list.queryOptions());
  const createCourseMut = useMutation(trpc.courses.admin.create.mutationOptions())

  // Courses going on this year
  const activeCourses = useMemo(
    () => courses?.filter((course) => course.status !== CourseStatus.Deleted),
    [courses],
  );

  const pastCourses = useMemo(
    () =>
      courses?.filter((course) => {
        const startYear = courseStartDate(course)?.getFullYear();
        return startYear != null && startYear < new Date().getFullYear();
      }),
    [courses],
  );

  const deletedCourses = useMemo(
    () => courses?.filter((course) => course.status == CourseStatus.Deleted),
    [courses],
  );

  return (
    <>
      <PageHeader>Course Manager</PageHeader>
      <div className="grid grid-cols-1 gap-4">
        <Card variant="blue">
          <CardHeader>
            <CardTitle>Courses Overview</CardTitle>
            <CardDescription>
              Click on a course to see more details!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={courseTableDefs}
              data={activeCourses}
              table={{
                enableRowSelection: false,
              }}
            />
          </CardContent>
          <div className="flex px-4">
            <EditDrawer
              item={emptyCourse}
              columns={courseFormDefs}
              onSave={async (updates) => {
                createCourseMut.mutateAsync({
                  ...updates
                })
              }}
              drawer={{
                title: "New Course",
                buttonText: "+ Add New Course from Scratch",
                description: "Create new course from scratch.",
              }}
            />
          </div>
        </Card>

        <Card variant="yellow">
          <CardHeader>
            <CardTitle>Previous Courses</CardTitle>
            <CardDescription>Courses taught in previous years.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={courseDefPresets.table}
              data={pastCourses}
              table={{
                enableRowSelection: false,
              }}
            />
          </CardContent>
        </Card>

        <Card variant="orange">
          <CardHeader>
            <CardTitle>Deleted Courses</CardTitle>
            <CardDescription>Courses marked as deleted.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={courseDefPresets.table}
              data={deletedCourses}
              table={{
                enableRowSelection: false,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
