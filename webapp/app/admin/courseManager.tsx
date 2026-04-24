import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTRPCClient, useTRPC } from "~/utils/trpc";
import { CourseEventForm } from "~/components/courseEventForm";
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
import type { CourseLocation } from "@backend/database/schema";
import { type CourseEvent } from "../../../backend/src/database/schema";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerDescription,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "~/components/ui/drawer";
import { LocationTypeBadge } from "~/components/location-type-badge";
import { Input } from "~/components/ui/input";
import { PageHeader } from "~/components/page-header";
import { Link } from "react-router";

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

  const columnsCourseEvents: ColumnDef<CourseEvent>[] = [
    {
      accessorKey: "courseName",
      header: "Course",
    },

    {
      accessorKey: "physicalAddress",
      header: "Address",
    },
    {
      accessorKey: "virtualLink",
      header: "Link",
    },
    {
      accessorKey: "locationType",
      header: "Format",
      cell: ({ getValue }) => (
        <LocationTypeBadge value={getValue() as CourseLocation} />
      ),
    },

    {
      accessorKey: "seats",
      header: "Seats",
    },

    {
      accessorKey: "classStartDatetime",
      header: "Date",
      cell: ({ getValue }) =>
        new Date(getValue() as string).toLocaleDateString(),
    },

    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <ButtonGroup>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedEvent(row.original);
                setCourseEventDrawerOpen(true);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete this  event? All event information and reservations will be lost.",
                  )
                ) {
                  deleteRow(row.original.id);
                } else {
                  return;
                }
              }}
            >
              {" "}
              Delete
            </Button>
          </ButtonGroup>
        );
      },
    },
  ];

  function getNumberOfClasses(courseId: string) {
    return (courseEvents.data ?? []).filter(
      (event) => event.courseId === courseId,
    ).length;
  }

  const columnsCourses: ColumnDef<CourseEvent>[] = [
    {
      accessorKey: "courseName",
      header: "Course",
      cell: ({ row, getValue }) => (
        <Link to={`/admin/course-details/${row.original.id}`}>
          {getValue() as string}
        </Link>
      ),
    },
    {
      accessorKey: "description",
      header: "Class Description",
      meta: {
        className: "text-muted-foreground",
      },
    },
    {
      accessorKey: "creditHours",
      header: "Credit Hours",
    },
    {
      accessorKey: "priceCents",
      header: "Tuition Fee",
      cell: ({ getValue }) => `$${(Number(getValue()) / 100).toFixed(2)}`,
    },
    {
      accessorKey: "id",
      header: "Upcoming Classes",
      cell: ({ row }) => getNumberOfClasses(row.original.id),
    },
  ];

  const [courseDrawerOpen, setCourseDrawerOpen] = useState(false);
  const [courseEventDrawerOpen, setCourseEventDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CourseEvent | null>(null);
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
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setSelectedEvent(null);
                setCourseEventDrawerOpen(true);
              }}
            >
              + Create New Course Event
            </Button>
            <Drawer
              direction="right"
              open={courseEventDrawerOpen}
              onOpenChange={setCourseEventDrawerOpen}
            >
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    {selectedEvent ? "Edit Course Event" : "New Course Event"}
                  </DrawerTitle>
                  <DrawerDescription>
                    {selectedEvent
                      ? "Make changes to an existing course event"
                      : "Create a new course event for an existing class"}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="no-scrollbar overflow-y-auto px-4">
                  <CourseEventForm
                    key={selectedEvent?.courseId ?? "new"}
                    event={selectedEvent}
                    onCreate={async (data) => {
                      if (selectedEvent) {
                        await client.courseManagerRouter.updateCourseEvent.mutate(
                          { id: selectedEvent.id, ...data },
                        );
                        await queryClient.invalidateQueries({
                          queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
                        });
                      } else {
                        await client.courseManagerRouter.createCourseEvent.mutate(
                          data,
                        );
                        await queryClient.invalidateQueries({
                          queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
                        });
                      }
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
