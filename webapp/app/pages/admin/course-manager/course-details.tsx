import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { PaymentStatus, Profile } from "@backend/database/schema";
import { type ColumnDef } from "@tanstack/react-table";
import type { ReservationDto } from "@backend/database/dtos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { useTRPC, useTRPCClient } from "~/utils/trpc";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "~/components/ui/select";
import { PaymentStatusBadge } from "~/components/payment-status-badge";
import { Badge } from "~/components/ui/badge";
import { Link } from "react-router";
import { Users, CreditCard, Calendar, Trash, ArrowLeft } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "~/components/ui/drawer";
import { NewCourseForm } from "~/pages/admin/course-manager/course-form";
import type { Route } from "./+types/course-details";
import { EditTraineeReservation } from "../trainee-manager/edit-reservation";
import { CourseEventForm } from "./course-event-form";
import { AddCourseEventButton as UpdateCourseEventButton } from "./add-course-event-button";
import { ButtonGroup } from "~/components/ui/button-group";

export function meta() {
  return [{ title: "Course Details - VRWA Training Database" }];
}

export default function CourseDetails({
  params: { courseId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();
  const updateMutation = useMutation(
    trpc.courseEvents.admin.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.admin.listCourse.queryKey(),
        });
      },
    }),
  );

  const course = useQuery(
    trpc.courses.admin.get.queryOptions({ id: courseId! }),
  );

  const reservations = useQuery(
    trpc.reservations.admin.listCourse.queryOptions({
      courseId: courseId!,
    }),
  );

  const trainees = useQuery(trpc.profiles.admin.listTrainees.queryOptions());

  const courseEvents = useQuery(
    trpc.courseEvents.admin.listCourse.queryOptions({
      courseId: courseId!,
    }),
  );

  //grouping reservations by courseEventId to easily access rosters
  const roster = reservations.data ?? [];
  const events = courseEvents.data ?? [];

  //getting courseEvents for tabs
  const eventIds = courseEvents.data?.map((e) => e.id) ?? [];

  async function deleteRow(profileId: string, courseId: string) {
    await client.reservations.admin.delete.mutate({
      profileId,
      courseId,
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.reservations.admin.listCourse.queryKey({
        courseId: courseId!,
      }),
    });
  }

  const seats = course.data?.seats ?? 0;
  const classFull = roster.length >= seats;

  //what percentage of trainees enrolled have paid their fees
  function percentagePaid() {
    let paid = 0;
    for (let i = 0; i < roster.length; i++) {
      if (roster[i]?.paymentStatus == "paid") paid++;
    }
    return (paid / roster.length) * 100;
  }

  //for if the course gets deleted
  const [courseDeleted, setCourseDeleted] = useState<boolean | false>(false);

  //for adding to roster
  const [selectedTrainee, setSelectedTrainee] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [traineePopupOpen, setTraineePopupOpen] = useState<boolean | false>(
    false,
  );
  const activeEventId = selectedTab ?? eventIds[0] ?? "";

  const selectedEvent =
    events.find((event) => event.id == activeEventId) || null;
  const rosterIds = new Set(roster.map((r) => r.profileId));
  const availableTrainees =
    trainees.data?.filter((t) => !rosterIds.has(t.id)) ?? [];

  //editing a course
  const [courseDrawerOpen, setCourseDrawerOpen] = useState<boolean | false>(
    false,
  );

  //Data Table
  const rosterTableDef: ColumnDef<ReservationDto>[] = useMemo(
    () => [
      {
        accessorKey: "lastName",
        header: "Last Name",
      },
      {
        accessorKey: "firstName",
        header: "First Name",
      },
      {
        accessorKey: "creditHours",
        header: "Awarded Hours",
      },
      {
        accessorKey: "isMember",
        header: "Member Status",
        cell: ({ getValue }) =>
          getValue() == true ? (
            <Badge variant="member"> Member</Badge>
          ) : (
            <Badge variant="not_member"> Non-Member</Badge>
          ),
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ getValue }) => (
          <PaymentStatusBadge value={getValue() as PaymentStatus} />
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          return (
            <ButtonGroup>
              <EditTraineeReservation reservation={row.original} />
              <Button
                variant="destructive"
                onClick={() =>
                  deleteRow(row.original.profileId, row.original.courseId)
                }
              >
                Remove Trainee
              </Button>
            </ButtonGroup>
          );
        },
      },
    ],
    [],
  );

  if (courseDeleted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-semibold">
          This course has been deleted. Return to{" "}
          <Link className="text-blue-500 underline" to="/admin/course-manager">
            {" "}
            course manager.
          </Link>
        </h1>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <Button className="p-6" variant="ghost" asChild>
        <Link to="/admin/course-manager">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>
      </Button>
      <PageHeader>{course.data?.courseName}</PageHeader>
      <div className="grid gap-4 grid-cols-1 @xl:grid-cols-3">
        <Card className="@xl:col-span-1" variant="green">
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="w-10 h-10 text-muted-foreground" />
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Total Enrollment</p>
              <p className="text-3xl font-bold">{roster.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="@xl:col-span-1" variant="yellow">
          <CardContent className="p-6 flex items-center gap-4">
            <CreditCard className="w-10 h-10 text-muted-foreground" />
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Tution Paid</p>
              <p className="text-3xl font-bold">
                {percentagePaid().toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="@xl:col-span-1" variant="blue">
          <CardContent className="p-6 flex items-center gap-4">
            <Calendar className="w-10 h-10 text-muted-foreground" />
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground"># Sessions</p>
              <p className="text-3xl font-bold">{roster.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full" variant="orange">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex justify-between">
              <div className="font-semibold underline">Course Overview</div>
              <Button
                variant="destructive"
                size="lg"
                className=""
                onClick={async () => {
                  if (
                    confirm(
                      "Are you sure you want to delete this course? All course information and reservations will be lost.",
                    )
                  ) {
                    await client.courses.admin.delete.mutate({
                      id: courseId!,
                    });
                    await queryClient.invalidateQueries({
                      queryKey: trpc.courses.admin.list.queryKey(),
                    });
                    setCourseDeleted(true);
                  } else {
                    return;
                  }
                }}
              >
                <Trash /> Delete Course
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <dl className="space-y-3">
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Description
                  </dt>
                  <dd>{course.data?.description}</dd>
                </div>

                <div>
                  <dt className="font-medium text-muted-foreground">
                    Enrollment Fee
                  </dt>
                  <dd>
                    ${course.data?.priceCents && course.data?.priceCents / 100}
                  </dd>
                </div>

                <div>
                  <dt className="font-medium text-muted-foreground">
                    Credit Hours
                  </dt>
                  <dd>{course.data?.creditHours}</dd>
                </div>
              </dl>
              <div className="flex justify-end mb-4 pr-4">
                <Drawer
                  direction="right"
                  open={courseDrawerOpen}
                  onOpenChange={setCourseDrawerOpen}
                >
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Update Course Details</DrawerTitle>
                      <DrawerDescription>
                        Edit an existing event
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="no-scrollbar overflow-y-auto px-4">
                      <NewCourseForm
                        key={courseId}
                        course={course.data}
                        onCreate={async (data) => {
                          await client.courses.admin.update.mutate({
                            ...data,
                            id: courseId,
                          });
                          await queryClient.invalidateQueries({
                            queryKey: trpc.courses.admin.get.queryKey({
                              id: courseId,
                            }),
                          });
                          setCourseDrawerOpen(false);
                        }}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
              <div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setCourseDrawerOpen(true);
                  }}
                >
                  Update Details
                </Button>
              </div>
              <div></div>
            </div>
          </CardContent>
        </Card>
        <Card variant="green" className="col-span-full">
          <CardHeader>
            <CardTitle>Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedTab ?? eventIds[0] ?? ""}
              onValueChange={setSelectedTab}
            >
              <div className="flex justify-between">
                <TabsList variant="line">
                  {courseEvents.data?.map((event) => {
                    const date = event.classStartDatetime
                      ? new Date(event.classStartDatetime)
                      : null;
                    return (
                      <TabsTrigger key={event.id} value={event.id}>
                        {date ? date.toLocaleDateString() : "-"}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                <UpdateCourseEventButton />
              </div>
              {courseEvents.data?.map((event) => (
                <TabsContent key={event.id} value={event.id}>
                  <CourseEventForm
                    key={selectedEvent?.courseId ?? "new"}
                    event={selectedEvent}
                    onCreate={async (data) => {
                      console.log("heyyy", selectedEvent, data);
                      if (selectedEvent) {
                        updateMutation.mutate({
                          id: selectedEvent.id,
                          ...data,
                        });
                        await queryClient.invalidateQueries({
                          queryKey: trpc.courseEvents.admin.list.queryKey(),
                        });
                      }
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        <Card className="col-span-full" variant="yellow">
          <CardHeader className="pb-3">
            <CardTitle>
              Class Roster{" "}
              {
                <Badge variant={classFull ? "destructive" : "outline"}>
                  {classFull ? "Full" : "Open"}
                </Badge>
              }
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={rosterTableDef} data={roster} />
            <div className="flex justify-end mt-4 pr-4">
              <Dialog
                open={traineePopupOpen}
                onOpenChange={setTraineePopupOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="secondary" size="lg">
                    + Add Trainee To Roster
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New Enrollment</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    select a trainee to add to the roster
                  </DialogDescription>
                  <Select
                    required
                    onValueChange={(value) => setSelectedTrainee(value)}
                  >
                    <SelectTrigger id="trainees" className="w-full max-w-48">
                      <SelectValue placeholder="Select a Trainee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {availableTrainees.map((trainee: Profile) => (
                          <SelectItem key={trainee.id} value={trainee.id}>
                            {trainee.firstName} {trainee.lastName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={async () => {
                      if (!selectedTrainee) return;

                      await client.reservations.admin.create.mutate({
                        profileId: selectedTrainee,
                        courseId: courseId,
                        creditHours: course.data?.creditHours ?? 0,
                        paymentStatus: "unpaid",
                      });

                      await queryClient.invalidateQueries({
                        queryKey: trpc.reservations.admin.listCourse.queryKey({
                          courseId: courseId,
                        }),
                      });

                      setTraineePopupOpen(false);
                    }}
                    disabled={classFull}
                  >
                    add to roster
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
