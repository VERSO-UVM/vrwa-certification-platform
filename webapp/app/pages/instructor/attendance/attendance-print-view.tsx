/**
 * Configurable printable table for the attendance sign-in sheet.
 */
import { Button } from "~/components/ui/button";
import { useClassDetailsQuery } from "./use-class-details-query";
import { useRosterQuery } from "./use-roster-query";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Printer } from "lucide-react";
import { ClassTitle } from "./class-title";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

interface Column {
  header: string;
  enabled: boolean;
  id: number;
}

const defaultColumns: Column[] = [
  { header: "Sign in", enabled: true, id: 1 },
  { header: "Break 1", enabled: true, id: 2 },
  { header: "Break 2", enabled: true, id: 3 },
  { header: "", enabled: false, id: 4 },
];

export function AttendancePrintView({
  courseEventId,
}: {
  courseEventId: string;
}) {
  const { data: details } = useClassDetailsQuery(courseEventId);
  const { data: roster = [] } = useRosterQuery(courseEventId);
  const [columns, setColumns] = useState<Column[]>(defaultColumns);

  const updateColumn = ({ header, enabled, id }: Column) => {
    setColumns((columns) =>
      columns.map((c) => (c.id == id ? { id, header, enabled } : c)),
    );
  };

  return (
    <>
      <PageHeader>
        <ClassTitle courseEventId={courseEventId} />
        <Button
          className="mx-4 min-w-30"
          type="button"
          variant="secondary"
          onClick={() => print()}
        >
          <Printer /> Print
        </Button>
      </PageHeader>
      <Card variant="green" className="mb-4 border-0">
        <CardHeader>
          <CardTitle>Additional Columns</CardTitle>
          <CardDescription>
            Configure more columns for the sign-in sheet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {columns.map(({ header, enabled, id }) => {
            return (
              <div key={id} className="p-2">
                <Label>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      updateColumn({ id, header, enabled: checked })
                    }
                  />
                  <Input
                    value={header}
                    onChange={(e) =>
                      updateColumn({
                        id,
                        header: e.target.value,
                        enabled: Boolean(e.target.value),
                      })
                    }
                  />
                </Label>
              </div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <div className="print:visible print-root print:absolute print:left-0 print:top-0 print:right-0 print:m-0 print:p-3 border-black print:bg-white print:text-black p-8">
            <header className="mb-6 text-center">
              {details != null && details.classStartDatetime != null && (
                <h1 className="text-2xl font-bold">
                  {details?.courseName} -{" "}
                  {new Date(details.classStartDatetime).toLocaleDateString()}
                </h1>
              )}
              <p className="mt-2 text-sm">VRWA Training - Attendance Sheet</p>
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
                  {columns.map(({ id, header, enabled }) => {
                    if (enabled) {
                      return (
                        <th
                          key={id}
                          className="border border-black p-1 text-center w-20"
                        >
                          {header}
                        </th>
                      );
                    }
                  })}
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
                      {[
                        entry.address,
                        entry.city,
                        entry.state,
                        entry.postalCode,
                      ].join(", ")}
                    </td>
                    <td className="border border-black p-2">
                      {entry.phoneNumber ?? "-"}
                    </td>
                    <td className="border border-black p-2">{entry.email}</td>
                    {columns.map(({ id, header, enabled }) => {
                      if (enabled) {
                        return (
                          <td className="border border-black p-2 h-12"></td>
                        );
                      }
                    })}
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
