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
import type { CourseEventDto } from "@backend/database/dtos";
import { DataTable } from "~/components/data-table";
import {
  courseEventDefPresets,
  courseEventDefs,
  courseEventFieldHelper,
} from "~/utils/field-defs/course-event";
import { Link } from "react-router";

export function meta() {
  return [{ title: "Instructor Dashboard" }];
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
  const { data: courseEvents = [], isPending } = useQuery(
    trpc.courseEvents.instructor.listUpcoming.queryOptions(),
  );

  const pastClasses = courseEvents.filter(
    (courseEvent) =>
      new Date(courseEvent.classStartDatetime ?? "") < new Date(),
  );
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  const upcomingClasses = courseEvents.filter((courseEvent) => {
    return (
      courseEvent.classStartDatetime &&
      new Date(courseEvent.classStartDatetime) > today
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader>My Classes</PageHeader>

      <h2 className="text-xl font-medium">Upcoming Classes</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {upcomingClasses?.map((session, i) => (
          <ClassInfoCard key={session.id} session={session} index={i} />
        ))}
        {upcomingClasses?.length === 0 &&
          (isPending ? (
            <div className="p-10">Fetching upcoming classes...</div>
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
              No upcoming classes right now!
            </div>
          ))}
      </div>

      <h2 className="text-xl font-medium">Past Classes</h2>
      <Card className="@xl:col-span-5" variant="blue">
        <CardHeader>
          <CardTitle>Past Classes</CardTitle>
          <CardDescription>
            Click on a class to get to attendance page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columnDefs}
            data={(courseEvents as CourseEventDto[]) ?? []}
            table={{
              enableRowSelection: false,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
