/**
 * Instructor home/dashboard page with view of upcoming classes.
 */
import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { ClassInfoCard } from "./class-info-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DataTable } from "~/components/data-table";
import {
  courseEventDefs,
  courseEventFieldHelper,
} from "~/utils/field-defs/course-event";
import { Link } from "react-router";
import { useMemo } from "react";
import { SkeletonCard } from "~/components/ui/skeleton";

export function meta() {
  return [{ title: "Instructor Dashboard" }];
}

/**
 * Use start of the day instead of the current time so that
 * a class on the current day is still at the top of the page
 * in Upcoming Classes.
 */
function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

const columnDefs = [
  courseEventFieldHelper.accessor("courseName", {
    header: "Name",
    cell: ({ row, getValue }) => (
      <Link
        to={{
          pathname: `/instructor/attendance/${row.original.id}`,
          search: `?view=edit`,
        }}
        className="font-medium hover:underline"
      >
        {getValue() as string}
      </Link>
    ),
  }),
  courseEventDefs.courseDate,
  courseEventDefs.courseLocationType,
  courseEventDefs.address,
  courseEventDefs.seats,
];

export default function InstructorHome() {
  const trpc = useTRPC();
  const { data: courseEvents, isPending } = useQuery(
    trpc.courseEvents.instructor.listUpcoming.queryOptions(),
  );
  const today = startOfToday();

  const pastClasses = useMemo(
    () =>
      courseEvents?.filter(
        ({ classStartDatetime }) =>
          classStartDatetime != null && classStartDatetime < today,
      ),
    [courseEvents],
  );
  const upcomingClasses = useMemo(
    () =>
      (courseEvents ?? []).filter(({ classStartDatetime }) => {
        // Consider a null classStartDatetime as a class which has not yet
        // been scheduled. Thus it is a future class.
        return classStartDatetime == null || classStartDatetime > today;
      }),
    [courseEvents],
  );

  return (
    <div>
      <PageHeader>My Classes</PageHeader>

      <h2 className="text-xl font-medium pb-5">Upcoming Classes</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {upcomingClasses.map((session, i) => (
          <ClassInfoCard key={session.id} session={session} index={i} />
        ))}
        {upcomingClasses.length === 0 &&
          (isPending ? (
            <>
              <SkeletonCard variant="blue" />
              <SkeletonCard variant="green" />
              <SkeletonCard variant="yellow" />
            </>
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-lg">
              No upcoming classes right now!
            </div>
          ))}
      </div>

      <h2 className="text-xl font-medium pt-8 pb-5">Past Classes</h2>

      <Card className="@xl:col-span-5" variant="blue">
        <CardHeader>
          <CardTitle>Past Classes</CardTitle>
          <CardDescription>
            Click on a class name to manage attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columnDefs}
            data={pastClasses}
            table={{
              enableRowSelection: false,
              initialState: {
                sorting: [
                  {
                    id: "classStartDatetime",
                    desc: true,
                  },
                ],
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
