import { useMemo } from "react";
import { makeAttendanceDefs } from "./attendance-field-defs";
import { useClassDetailsQuery } from "./use-class-details-query";
import { useRosterQuery } from "./use-roster-query";
import { useCreditHoursUpdate } from "./use-update-credit-hours-mutation";
import { DataTable } from "~/components/data-table";
import type { ReservationDto } from "@backend/database/dtos";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { MAX_PAGE_SIZE } from "~/components/data-table/page-size-select";
import { ClassTitle } from "./class-title";

export function AttendanceEditView({
  courseEventId,
}: {
  courseEventId: string;
}) {
  const { data: details } = useClassDetailsQuery(courseEventId);
  const { data: roster = [] } = useRosterQuery(courseEventId);
  const creditHoursUpdate = useCreditHoursUpdate(courseEventId);

  const columns = useMemo(
    () =>
      makeAttendanceDefs({
        onTogglePresent: (row, present) => {
          if (present) {
            creditHoursUpdate.mutate({
              courseEventId: row.courseEventId,
              profileId: row.profileId,
              creditHours: row.course.creditHours,
            });
          } else {
            creditHoursUpdate.mutate({
              courseEventId: row.courseEventId,
              profileId: row.profileId,
              creditHours: 0,
            });
          }
        },
        onSetCreditHours: (row, value) => {
          creditHoursUpdate.mutate({
            courseEventId: row.courseEventId,
            profileId: row.profileId,
            creditHours: value,
          });
        },
      }),
    [],
  );

  return (
    <>
      <PageHeader>
        <ClassTitle courseEventId={courseEventId} />
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>Manage Attendance</CardTitle>
          <CardDescription>
            Update attendance and credit hours for trainees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={roster as ReservationDto[]}
            table={{
              enableRowSelection: false,
              initialState: {
                pagination: {
                  pageSize: MAX_PAGE_SIZE,
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
