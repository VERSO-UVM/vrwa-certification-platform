import { useState } from "react";
import { CourseStatus, PaymentStatus } from "@backend/database/schema";
import type { CourseDto, CourseEventDto } from "@backend/database/dtos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageHeader } from "~/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Calendar, CreditCard, Trash, Users, X } from "lucide-react";
import type { Route } from "./+types/course-details";
import { ButtonGroup } from "~/components/ui/button-group";
import { EditForm } from "~/components/entry-views/edit-form";
import {
  courseEventDefs,
  courseEventRequiredFields,
} from "~/utils/field-defs/course-event";
import { courseDefs, courseRequiredFields } from "~/utils/field-defs/course";
import type { ColumnDef } from "@tanstack/react-table";
import { add } from "date-fns";
import {
  useCourseEventCloneMutation,
  useCourseEventDeleteMutation,
  useCourseEventUpdateMutation,
} from "./use-course-event-mutation";
import {
  useCourseDeleteMutation,
  useCourseUpdateMutation,
} from "./use-course-mutation";
import { RosterManager } from "./roster-manager";
import { prefetchLoader } from "~/utils/trpc.server";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC, type TRPC } from "~/utils/trpc";

export function meta() {
  return [{ title: "Course Details - VRWA Training Database" }];
}

const courseEventUpdateFormDefs = [
  courseEventDefs.courseDate,
  courseEventDefs.duration,
  courseEventDefs.courseLocationType,
  courseEventDefs.virtualLink,
  courseEventDefs.address,
  courseEventDefs.town,
  courseEventDefs.venue,
];

const courseUpdateFormDefs = [
  courseDefs.status,
  courseDefs.courseName,
  courseDefs.description,
  courseDefs.creditHours,
  courseDefs.priceCents,
  courseDefs.tags,
  courseDefs.creditCategories,
] as ColumnDef<CourseDto>[];

function courseDetailsQueries(
  trpc: TRPC,
  { courseId }: Route.LoaderArgs["params"],
) {
  return [
    trpc.courses.admin.get.queryOptions({
      id: courseId,
    }),
    trpc.courseEvents.admin.listCourse.queryOptions({ courseId }),
    trpc.reservations.admin.listCourse.queryOptions({ courseId }),
  ] as const;
}

/* Prefetch all queries during SSR. */
export const loader = prefetchLoader(courseDetailsQueries);

export default function CourseDetails({
  params: { courseId },
}: Route.ComponentProps) {
  const navigate = useNavigate();
  const [{ data: course }, { data: courseEvents }, { data: reservations }] =
    useSuspenseQueries({
      queries: courseDetailsQueries(useTRPC(), { courseId }),
    });

  /* Mutations */
  const courseEventUpdateMut = useCourseEventUpdateMutation();
  const courseEventCloneMut = useCourseEventCloneMutation();
  const courseEventDeleteMut = useCourseEventDeleteMutation();
  const courseUpdateMut = useCourseUpdateMutation();
  const courseDeleteMut = useCourseDeleteMutation();

  //what percentage of trainees enrolled have paid their fees
  function percentagePaid() {
    if (reservations == null) return null;
    const paidCount = reservations.filter(
      (r) => r.paymentStatus == PaymentStatus.Paid,
    ).length;
    if (reservations.length == 0) return 0; // Don't divide by zero
    return (paidCount / reservations.length) * 100;
  }

  const [selectedTab, setSelectedTab] = useState<string | null>(
    courseEvents?.[0]?.id ?? null,
  );
  if (!selectedTab && courseEvents?.[0] != null) {
    setSelectedTab(courseEvents?.[0]?.id);
  }

  if (course == null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Course not found. Return to{" "}
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
      <PageHeader>{course?.courseName}</PageHeader>
      <div className="grid gap-4 grid-cols-6">
        <Card className="col-span-full @xl:col-span-2" variant="green">
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="w-10 h-10 text-muted-foreground" />
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Total Enrollment</p>
              <p className="text-3xl font-bold">{reservations?.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full @xl:col-span-2" variant="yellow">
          <CardContent className="p-6 flex items-center gap-4">
            <CreditCard className="w-10 h-10 text-muted-foreground" />
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Tuition Paid</p>
              <p className="text-3xl font-bold">
                {percentagePaid()?.toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full @xl:col-span-2" variant="blue">
          <CardContent className="p-6 flex items-center gap-4">
            <Calendar className="w-10 h-10 text-muted-foreground" />
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground"># Sessions</p>
              <p className="text-3xl font-bold">{courseEvents?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full @6xl:col-span-3" variant="orange">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex justify-between">
              <div className="font-semibold underline">Course Overview</div>
              {course && (
                <Button
                  variant={
                    course.status == CourseStatus.Deleted
                      ? "destructive"
                      : "edit"
                  }
                  size="lg"
                  onClick={async () => {
                    if (course.status === CourseStatus.Deleted) {
                      if (
                        confirm(
                          "Are you sure you want to delete this course? All course information and reservations will be lost.",
                        )
                      ) {
                        await courseDeleteMut.mutateAsync({
                          id: courseId,
                        });
                        await navigate("/admin/course-manager");
                      } else {
                        return;
                      }
                    } else {
                      // Mark as deleted
                      await courseUpdateMut.mutateAsync({
                        status: CourseStatus.Deleted,
                        id: course.id,
                      });
                    }
                  }}
                >
                  <Trash />
                  {course.status === CourseStatus.Deleted
                    ? "Delete permanently"
                    : "Mark as deleted"}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <EditForm
              item={course ?? undefined}
              required={courseRequiredFields}
              onSave={(updates) => {
                if (!course) return Promise.reject("Course not found");
                return courseUpdateMut.mutateAsync({
                  ...updates,
                  id: course.id,
                });
              }}
              columns={courseUpdateFormDefs}
            />
          </CardContent>
        </Card>
        <Card className="col-span-full @6xl:col-span-3" variant="green">
          <CardHeader>
            <CardTitle>Training Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab ?? ""} onValueChange={setSelectedTab}>
              <div className="flex justify-between flex-wrap">
                <TabsList variant="line" className="overflow-x-scroll pb-3">
                  {courseEvents?.map((event) => {
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
                <ButtonGroup className="ml-auto">
                  <Button
                    variant="default"
                    onClick={() => {
                      if (!selectedTab) {
                        // No course event selected
                        return;
                      }
                      // Duplicate currently selected event to make it easy add new
                      // courseEvents with similar locations or other fields
                      const selectedEvent = courseEvents?.find(
                        (e) => e.id == selectedTab,
                      )?.classStartDatetime;
                      courseEventCloneMut.mutate(
                        {
                          courseEventId: selectedTab,
                          classStartDatetime: selectedEvent
                            ? add(selectedEvent, { days: 1 })
                            : undefined,
                        },
                        {
                          onSuccess: (newEvent) => {
                            setSelectedTab(newEvent.id);
                          },
                        },
                      );
                    }}
                  >
                    + Add Training Session
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={courseEvents != null && courseEvents.length <= 1}
                    onClick={() => {
                      if (selectedTab && courseEvents) {
                        // Select previous tab after deleting this one
                        const selectedIndex = courseEvents.findIndex(
                          (event) => event.id == selectedTab,
                        );
                        if (selectedIndex == -1) return;
                        const newTabIndex =
                          selectedIndex == 0 ? 1 : selectedIndex - 1;
                        const newTabId = courseEvents[newTabIndex]?.id;

                        courseEventDeleteMut.mutate(
                          {
                            id: selectedTab,
                          },
                          {
                            onSuccess: () => {
                              if (newTabId) {
                                setSelectedTab(newTabId);
                              }
                            },
                          },
                        );
                      }
                    }}
                  >
                    <X /> Remove
                  </Button>
                </ButtonGroup>
              </div>
              {courseEvents?.length ? (
                courseEvents.map((event) => (
                  <TabsContent key={event.id} value={event.id}>
                    <EditForm
                      key={event.id}
                      item={event as CourseEventDto}
                      required={courseEventRequiredFields}
                      columns={courseEventUpdateFormDefs}
                      onSave={async (data) => {
                        await courseEventUpdateMut.mutateAsync({
                          id: event.id,
                          ...data,
                        });
                      }}
                    />
                  </TabsContent>
                ))
              ) : (
                <p className="text-muted-foreground p-4">
                  No training sessions yet.
                </p>
              )}
            </Tabs>
          </CardContent>
        </Card>
        <RosterManager courseId={courseId} />
      </div>
    </div>
  );
}
