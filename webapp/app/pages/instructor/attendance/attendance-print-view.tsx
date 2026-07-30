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
import { Car, Printer } from "lucide-react";
import { ClassTitle } from "./class-title";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

const defaultColumns = [
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

  const [columns, setColumns] = useState(defaultColumns);

  const updateColumn = ({
    header,
    enabled,
    id,
  }: (typeof defaultColumns)[0]) => {
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
      <Card>
        <CardHeader>
          <CardTitle>Additional Fields</CardTitle>
          <CardDescription>
            Add more columns to the sign in sheet.
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
                      setColumns((columns) =>
                        columns.map((c) =>
                          c.id == id
                            ? {
                                id: id,
                                header: e.target.value,
                                enabled: Boolean(e.target.value),
                              }
                            : c,
                        ),
                      )
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
                  {columns.map(({ id, header }) => {
                    if (!header) return <></>;
                    return (
                      <th className="border border-black p-1 text-center w-20">
                        {header}
                      </th>
                    );
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
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </td>
                    <td className="border border-black p-2">
                      {entry.phoneNumber ?? "-"}
                    </td>
                    <td className="border border-black p-2">{entry.email}</td>
                    {columns.map(({ id, header }) => {
                      if (!header) return <></>;
                      return <td className="border border-black p-2 h-12"></td>;
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
