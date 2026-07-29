import { Link } from "react-router";
import type { Route } from "./+types/attendance";
import { useSearchParamEntry } from "~/hooks/use-search-param-entry";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import type { ReservationDto } from "@backend/database/dtos";
import { makeAttendanceDefs } from "./attendance/attendance-table-defs";
import { useRosterQuery } from "./attendance/use-roster-query";
import { useClassDetailsQuery } from "./attendance/use-class-details-query";
import { useCreditHoursUpdate } from "./attendance/use-update-credit-hours-mutation";
import { AttendancePrintView } from "./attendance/attendance-print-view";
import { AttendanceEditView } from "./attendance/attendance-edit-view";

export default function AttendancePage({
  params: { courseEventId },
}: Route.ComponentProps) {
  const [viewMode, setViewMode] = useSearchParamEntry("view", "table");
  const rosterQuery = useRosterQuery(courseEventId);
  const detailsQuery = useClassDetailsQuery(courseEventId);

  const roster = rosterQuery.data ?? [];
  const details = detailsQuery.data;

  return (
    <div className="p-6 space-y-6">
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

      {viewMode == "table" ? (
        <AttendanceEditView courseEventId={courseEventId} />
      ) : (
        <AttendancePrintView courseEventId={courseEventId} />
      )}
    </div>
  );
}
