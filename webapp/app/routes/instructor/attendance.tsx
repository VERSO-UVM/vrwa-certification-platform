import { useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { useTRPC } from "~/utils/trpc";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import {
  makeAttendanceDefs,
  type AttendanceRow,
} from "~/utils/field-defs/attendance";
import { format } from "date-fns";

export default function AttendancePage() {
  const { courseEventId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const printMode = searchParams.get("view") === "print";
  const eventId = courseEventId ?? "";
  const rosterQuery = useQuery(
    trpc.instructor.getEventRoster.queryOptions(
      { courseEventId: eventId },
      { enabled: !!courseEventId },
    ),
  );
  const detailsQuery = useQuery(
    trpc.instructor.getEventDetails.queryOptions(
      { courseEventId: eventId },
      { enabled: !!courseEventId },
    ),
  );

  const markMutation = useMutation(
    trpc.instructor.markAttendance.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.instructor.getEventRoster.queryFilter({
            courseEventId: eventId,
          }),
        );
      },
    }),
  );

  const unmarkMutation = useMutation(
    trpc.instructor.unmarkAttendance.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.instructor.getEventRoster.queryFilter({
            courseEventId: eventId,
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
            markMutation.mutate({
              courseEventId: row.courseEventId,
              profileId: row.profileId,
              creditHours: row.defaultCreditHours,
            });
            return;
          }
          unmarkMutation.mutate({
            courseEventId: row.courseEventId,
            profileId: row.profileId,
          });
        },
        onCreditHoursBlur: (row, value) => {
          markMutation.mutate({
            courseEventId: row.courseEventId,
            profileId: row.profileId,
            creditHours: value,
          });
        },
      }),
    [markMutation, unmarkMutation],
  );

  if (rosterQuery.isLoading || detailsQuery.isLoading) {
    return <div className="p-10 text-center">Loading roster...</div>;
  }
  if (rosterQuery.isError || detailsQuery.isError || !details) {
    return (
      <div className="p-10 text-center text-red-500">
        Could not find course event.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 attendance-page">
      <div className="no-print flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/instructor">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant={printMode ? "outline" : "default"}
            onClick={() => setSearchParams({ view: "table" })}
          >
            Manage Attendance
          </Button>
          <Button
            variant={printMode ? "default" : "outline"}
            onClick={() => setSearchParams({ view: "print" })}
          >
            <Printer className="mr-2 h-4 w-4" /> Print Attendance Sheet
          </Button>
        </div>
      </div>

      <PageHeader>
        {details.courseName} -{" "}
        {details.classStartDatetime
          ? format(new Date(details.classStartDatetime), "PPP p")
          : "Date TBD"}
      </PageHeader>

      {!printMode ? (
        <DataTable columns={columns} data={roster as AttendanceRow[]} />
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
