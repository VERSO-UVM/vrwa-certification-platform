import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { useClassDetailsQuery } from "./use-class-details-query";
import { useRosterQuery } from "./use-roster-query";
import { PageHeader } from "~/components/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Printer } from "lucide-react";

export function AttendancePrintView({
  courseEventId,
}: {
  courseEventId: string;
}) {
  const { data: details } = useClassDetailsQuery(courseEventId);
  const { data: roster = [] } = useRosterQuery(courseEventId);

  return (
    <>
      <PageHeader>
        {details != null ? (
          <>
            <div className="">
              {details.courseName} -{" "}
              {details.classStartDatetime
                ? format(new Date(details.classStartDatetime), "PPP p")
                : "Date TBD"}
              <Button className="mx-4 min-w-30" type="button" variant="secondary" onClick={() => print()}>
                <Printer /> Print
              </Button>
            </div>
          </>
        ) : (
          <>Loading course details...</>
        )}
      </PageHeader>
      <Card>
      <CardContent>
      <div className="print:visible print-root print:absolute print:left-0 print:top-0 print:right-0 print:m-0 print:p-3 border-black print:bg-white print:text-black p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold uppercase underline">
            Class Attendance Sheet
          </h1>
          {details != null && details.classStartDatetime != null && (
            <p className="mt-2 text-sm">
              {details?.courseName} -{" "}
              {new Date(details.classStartDatetime).toLocaleDateString()}
            </p>
          )}
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
      </CardContent>
      </Card>
    </>
  );
}
