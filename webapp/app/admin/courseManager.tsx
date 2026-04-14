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
import { type CourseEvent } from "../../../backend/src/database/schema";
import { Calendar } from "~/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
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
  return useQuery<CourseEvent[]>(
    trpc.adminRouter.getCourseEvents.queryOptions(),
  );
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Partial<CourseEvent>>({});

  //for date picker
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("12:00");
  const [dateOpen, setDateOpen] = useState(false);

  function combineDateAndTime(date: Date | undefined, time: string) {
    if (!date) return null;

    const [hours, mins] = time.split(":").map(Number);
    const combo = new Date(date);
    combo.setHours(hours);
    combo.setMinutes(mins);
    combo.setSeconds(0);
    console.log(combo);
    return combo;
  }

  function editRow(row: CourseEvent) {
    setEditingId(row.id);

    const dateTime = row.classStartDatetime
      ? new Date(row.classStartDatetime)
      : undefined;

    setEditDate(dateTime);
    setEditTime(dateTime ? dateTime.toISOString().substring(11, 16) : "12:00");
    setEdits({ ...row });
  }

  function cancelEditing() {
    setEditingId(null);
    setEdits({});
  }

  async function saveEditing() {
    if (!editingId) return;

    const classTime = combineDateAndTime(editDate, editTime);

    await client.courseManagerRouter.updateCourseEvent.mutate({
      id: editingId,
      seats: edits.seats ?? null,
      locationType: edits.locationType!,
      physicalAddress: edits.physicalAddress?.trim() || null,
      //no place to put virtual link atm
      virtualLink: null,
      classStartDatetime: classTime,
    });

    await queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getCourseEvents.queryKey(),
    });

    cancelEditing();
  }

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
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <Input
            value={edits.physicalAddress ?? ""}
            type="text"
            onChange={(e) =>
              setEdits((prev) => ({
                ...prev,
                physicalAddress: e.target.value,
              }))
            }
            className="border p-1"
          />
        ) : (
          (row.original.physicalAddress ?? "-")
        ),
      meta: {
        className: "text-muted-foreground",
      },
    },
    {
      accessorKey: "virtualLink",
      header: "Link",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <input
            value={edits.virtualLink ?? ""}
            onChange={(e) =>
              setEdits((prev) => ({
                ...prev,
                virtualLink: e.target.value,
              }))
            }
            className="border p-1"
          />
        ) : (
          (row.original.virtualLink ?? "-")
        ),
      meta: {
        className: "text-muted-foreground",
      },
    },
    {
      accessorKey: "locationType",
      header: "Format",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <select
            value={edits.locationType}
            onChange={(e) =>
              setEdits((prev) => ({
                ...prev,
                locationType: e.target.value as
                  | "in-person"
                  | "virtual"
                  | "hybrid",
              }))
            }
            className="border p-1"
          >
            <option value="in-person">In Person</option>
            <option value="virtual">Virtual</option>
            <option value="hybrid">Hybrid</option>
          </select>
        ) : (
          <LocationTypeBadge value={row.original.locationType} />
        ),
    },

    {
      accessorKey: "seats",
      header: "Seats",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <input
            type="number"
            value={edits.seats ?? ""}
            onChange={(e) =>
              setEdits((prev) => ({
                ...prev,
                seats: Number(e.target.value),
              }))
            }
            className="border p-1 w-20"
          />
        ) : (
          (row.original.seats ?? "-")
        ),
    },

    {
      accessorKey: "classStartDatetime",
      header: "Date",
      cell: ({ row }) =>
        editingId === row.original.id ? (
          <FieldGroup className="mx-auto max-w-xs flex-column">
            <Field>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date-picker"
                    className="w-full justify-between"
                  >
                    {editDate ? format(editDate, "P") : "Select date"}

                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(d) => {
                      setEditDate(d);
                      setDateOpen(false);
                    }}
                    captionLayout="dropdown"
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </Field>
            <Field>
              <input
                type="Time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="border p-2 rounded-md w-full text-sm"
              />
            </Field>
          </FieldGroup>
        ) : row.original.classStartDatetime ? (
          new Date(row.original.classStartDatetime).toLocaleDateString()
        ) : (
          "-"
        ),
    },

    {
      id: "actions",
      cell: ({ row }) => {
        const isEditing = editingId === row.original.id;

        return isEditing ? (
          <ButtonGroup>
            <Button variant="secondary" onClick={saveEditing}>
              Save
            </Button>
            <Button variant="secondary" onClick={cancelEditing}>
              Cancel
            </Button>
          </ButtonGroup>
        ) : (
          <ButtonGroup>
            <Button variant="secondary" onClick={() => editRow(row.original)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteRow(row.original.id)}
            >
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
                        queryKey: trpc.adminRouter.getCourses.queryKey(),
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
