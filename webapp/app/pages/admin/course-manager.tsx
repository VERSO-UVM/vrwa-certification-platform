import { useMemo, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPCClient, useTRPC } from "~/utils/trpc";
import { CourseEventForm } from "./course-manager/course-event-form";

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/data-table";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerDescription,
  DrawerTitle,
} from "~/components/ui/drawer";
import { PageHeader } from "~/components/page-header";
import type { CourseDto, CourseEventDto } from "@backend/database/dtos";
import { courseDefPresets } from "~/utils/field-defs/course";
import { courseStartDate } from "~/utils/utils";
import { CourseStatus } from "@backend/database/schema";
import { getOnRowSelectionChange } from "~/utils/single-row-select";
import type { TableOptions } from "@tanstack/react-table";
import { useNavigate } from "react-router";

export function meta() {
  return [{ title: "Course Manager - VRWA Training Database" }];
}

function useCourses() {
  const trpc = useTRPC();
  return useQuery(trpc.courses.admin.list.queryOptions());
}

export default function CourseManager() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();
  const { data: courses } = useCourses();
  const navigate = useNavigate();

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

  const makeTableProps = (
    courseList?: CourseDto[],
  ): Partial<TableOptions<CourseDto>> => ({
    onRowSelectionChange: getOnRowSelectionChange(-1, (index) => {
      if (courseList?.[index]) {
        navigate(`/admin/course-details/${courseList[index].id}`);
      }
    }),
  });

  const [courseEventDrawerOpen, setCourseEventDrawerOpen] = useState(false);

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
              columns={courseDefPresets.table}
              data={activeCourses}
              table={makeTableProps(activeCourses)}
            />
          </CardContent>
          <div className="flex px-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={() => setCourseEventDrawerOpen(true)}
            >
              + Create New Course
            </Button>
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
              table={makeTableProps(pastCourses)}
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
              table={makeTableProps(deletedCourses)}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
