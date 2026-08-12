/**
 * DataTable version of attendance table supporting updating of
 * trainee attendance and earned credit hours.
 */

import { attendanceFieldDefs } from "./attendance-field-defs";
import { useRosterQuery } from "./use-roster-query";
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

export function AttendanceEditView({ courseId }: { courseId: string }) {
  const { data: roster = [] } = useRosterQuery(courseId);

  return (
    <>
      <PageHeader>
        <ClassTitle courseId={courseId} />
      </PageHeader>
      <Card variant="green" className="border-0">
        <CardHeader>
          <CardTitle>Manage Attendance</CardTitle>
          <CardDescription>
            Update attendance and credit hours for trainees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={attendanceFieldDefs}
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
