import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPCClient, useTRPC } from "~/utils/trpc";
import { NewCourseEventForm } from "~/components/courseEventForm";
import { NewCourseForm } from "~/components/courseForm";

import {
  Card,
  CardContent,
  CardTitle,
  CardHeader,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { DataTable } from "~/components/data-table";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerDescription,
  DrawerTitle,
} from "~/components/ui/drawer";
import { PageHeader } from "~/components/page-header";
import { Link } from "react-router";
import { courseEventDefPresets } from "~/utils/field-defs/course-event";
import { courseDefPresets } from "~/utils/field-defs/course";
import { EditDrawer } from "~/components/entry-views/edit-drawer";

function useCourseEvents() {
  const trpc = useTRPC();
  return useQuery(trpc.adminRouter.getCourseEvents.queryOptions());
}

function useCourses() {
  const trpc = useTRPC();
  return useQuery(trpc.courseManagerRouter.getCourses.queryOptions());
}

export function CourseManager() {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();

  const courseEvents = useCourseEvents();
  const courses = useCourses();

  async function deleteRow(id: string) {
    await client.courseManagerRouter.deleteCourseEvent.mutate({ id });

    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
    });
  }

  const columnsCourseEvents: ColumnDef<any, any>[] = [
    ...(courseEventDefPresets.default as unknown as ColumnDef<any, any>[]),
    {
      id: "actions",
      cell: ({ row }) => (
        <ButtonGroup>
          <EditDrawer
            item={row.original}
            columns={courseEventDefPresets.default}
            drawer={{
              buttonText: "Edit",
              title: "Edit Course Event",
              description: "Update event details and save changes.",
            }}
            onSave={async (updates) => {
              await client.courseManagerRouter.updateCourseEvent.mutate({
                id: row.original.id,
                classStartDatetime: updates.classStartDatetime
                  ? new Date(updates.classStartDatetime as string | Date)
                  : undefined,
                seats: updates.seats as number | undefined,
                locationType: updates.locationType as
                  | "in-person"
                  | "virtual"
                  | "hybrid"
                  | undefined,
                physicalAddress:
                  (updates.physicalAddress as string | undefined) ?? undefined,
                virtualLink:
                  (updates.virtualLink as string | undefined) ?? undefined,
              });
              await queryClient.invalidateQueries({
                queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
              });
            }}
          />
          <Button
            variant="destructive"
            onClick={() => deleteRow(row.original.id)}
          >
            Delete
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  function getNumberOfClasses(courseId: string) {
    return (courseEvents.data ?? []).filter(
      (event) => event.courseId === courseId,
    ).length;
  }

  const columnsCourses: ColumnDef<any, any>[] = [
    ...(courseDefPresets.basic as unknown as ColumnDef<any, any>[]),
    {
      accessorKey: "id",
      header: "Upcoming Classes",
      cell: ({ row }) => getNumberOfClasses(row.original.id),
    },
    {
      id: "details",
      header: "Details",
      cell: ({ row }) => (
        <Link
          className="underline"
          to={`/admin/course-details/${row.original.id}`}
        >
          Open
        </Link>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <EditDrawer
          item={row.original}
          columns={courseDefPresets.all}
          drawer={{
            buttonText: "Edit",
            title: "Edit Course",
            description: "Update course details.",
          }}
          onSave={async (updates) => {
            await client.courseManagerRouter.updateCourse.mutate({
              id: row.original.id,
              courseName: updates.courseName as string | undefined,
              description: updates.description as string | null | undefined,
              creditHours: updates.creditHours as number | undefined,
              priceCents: updates.priceCents as number | undefined,
            });
            await queryClient.invalidateQueries({
              queryKey: trpc.courseManagerRouter.getCourses.queryKey(),
            });
          }}
        />
      ),
    },
  ];

  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false);
  const [courseEventDrawerOpen, setCourseEventDrawerOpen] = useState(false);
  return (
    <div className="flex-1">
      <PageHeader>Course Manager</PageHeader>
      <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
        <Card className="@xl:col-span-8">
          <CardHeader>
            <CardTitle>Classes Overview</CardTitle>
            <CardDescription>
              Quickly edit or remove existing course events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columnsCourseEvents}
              data={courseEvents.data ?? []}
            />
          </CardContent>
          <div className="flex justify-end mb-4 pr-4">
            <Drawer
              direction="right"
              open={courseEventDrawerOpen}
              onOpenChange={setCourseEventDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button variant="secondary" size="lg">
                  + Create New Course Event
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>New Course Event</DrawerTitle>
                  <DrawerDescription>
                    Create a new course event for an existing class
                  </DrawerDescription>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                  <NewCourseEventForm
                    onCreate={async (data) => {
                      await client.courseManagerRouter.createCourseEvent.mutate(
                        data,
                      );
                      await queryClient.invalidateQueries({
                        queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
                      });
                      setCourseEventDrawerOpen(false);
                    }}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </Card>
        <Card className="@xl:col-span-8">
          <CardHeader>
            <CardTitle>Courses Overview</CardTitle>
            <CardDescription>
              Click on a course to see more details!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={columnsCourses} data={courses.data ?? []} />
          </CardContent>
          <div className="flex justify-end mb-4 pr-4">
            <Drawer
              direction="right"
              open={courseDrawerOpen}
              onOpenChange={setCourseDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button variant="secondary" size="lg">
                  + Create New Course{" "}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>New Course</DrawerTitle>
                  <DrawerDescription>Create a new course</DrawerDescription>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                  <NewCourseForm
                    onCreate={async (data) => {
                      await client.courseManagerRouter.createCourse.mutate(
                        data,
                      );
                      await queryClient.invalidateQueries({
                        queryKey:
                          trpc.courseManagerRouter.getCourses.queryKey(),
                      });
                      setCourseDrawerOpen(false);
                    }}
                  />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </Card>
      </div>
    </div>
  );
}
