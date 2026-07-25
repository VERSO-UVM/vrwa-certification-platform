import { Link } from "react-router";
import type { Route } from "./+types/attendance";
import { useSearchParamEntry } from "~/hooks/use-search-param-entry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";
import { makeAttendanceDefs } from "./attendance/attendance-table-defs";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { format } from "date-fns";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import type { ReservationDto } from "@backend/database/dtos";

export default function AttendancePage({
  params: { courseEventId },
}: Route.ComponentProps) {
  const [viewMode, setViewMode] = useSearchParamEntry("view", "table");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const rosterQuery = useQuery(
    trpc.reservations.instructor.listCourseEvent.queryOptions(
      { courseEventId },
      { enabled: !!courseEventId },
    ),
  );

  const detailsQuery = useQuery(
    trpc.courseEvents.instructor.get.queryOptions(
      { courseEventId: courseEventId },
      { enabled: !!courseEventId },
    ),
  );

  const updateMutation = useMutation(
    trpc.reservations.instructor.updateCreditHours.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reservations.instructor.listCourseEvent.queryFilter({
            courseEventId: courseEventId,
          }),
        );
      },
    }),
  );

  const roster = rosterQuery.data ?? [];
  const details = detailsQuery.data;

  const columns = useMemo(
    () =>
      makeAttendanceDefs({
        onTogglePresent: (row, present) => {
          if (present) {
            updateMutation.mutate({
              courseEventId: row.courseEventId,
              profileId: row.profileId,
              creditHours: row.course.creditHours,
            });
          } else {
            updateMutation.mutate({
              courseEventId: row.courseEventId,
              profileId: row.profileId,
              creditHours: 0,
            });
          }
        },
        onCreditHoursBlur: (row, value) => {
          updateMutation.mutate({
            courseEventId: row.courseEventId,
            profileId: row.profileId,
            creditHours: value,
          });
        },
      }),
    [],
  );

  return (
    <div className="p-6 space-y-6 attendance-page">
      <div className="no-print flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/instructor">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode == "print" ? "outline" : "default"}
            onClick={() => setViewMode("table")}
          >
            Manage Attendance
          </Button>
          <Button
            variant={viewMode == "print" ? "default" : "outline"}
            onClick={() => setViewMode("print")}
          >
            <Printer className="mr-2 h-4 w-4" /> Print Attendance Sheet
          </Button>
        </div>
      </div>

      <PageHeader>
        {details != null ? (
          <>
            {details.courseName} -{" "}
            {details.classStartDatetime
              ? format(new Date(details.classStartDatetime), "PPP p")
              : "Date TBD"}
          </>
        ) : (
          <>Loading course details...</>
        )}
      </PageHeader>

      {viewMode == "table" ? (
        <DataTable columns={columns} data={roster as ReservationDto[]} />
      ) : (
        <div className="print-root border border-black bg-white text-black p-8">
          <header className="mb-6 text-center">
            <h1 className="text-2xl font-bold uppercase underline">
              Course Attendance Sheet
            </h1>
            <p className="mt-2 text-sm">VRWA Training Course</p>
          </header>
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-left">Name</th>
                <th className="border border-black p-2 text-left">
                  System/Organization
                </th>
                <th className="border border-black p-2 text-left">Address</th>
                <th className="border border-black p-2 text-left">Phone</th>
                <th className="border border-black p-2 text-left">Email</th>
                <th className="border border-black p-2 text-center w-20">
                  Sign In
                </th>
                <th className="border border-black p-2 text-center w-20">
                  Break 1
                </th>
                <th className="border border-black p-2 text-center w-20">
                  Break 2
                </th>
              </tr>
            </thead>
            <tbody>
              {roster.map((entry) => (
                <tr key={`${entry.profileId}-${entry.courseEventId}`}>
                  <td className="border border-black p-2 font-medium">
                    {entry.firstName} {entry.lastName}
                  </td>
                  <td className="border border-black p-2">
                    {entry.isMember ? "VRWA Member" : "Non-Member"}
                  </td>
                  <td className="border border-black p-2">
                    {[entry.address, entry.city, entry.state, entry.postalCode]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="border border-black p-2">
                    {entry.phoneNumber ?? "-"}
                  </td>
                  <td className="border border-black p-2">{entry.email}</td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                  <td className="border border-black p-2 h-12"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
