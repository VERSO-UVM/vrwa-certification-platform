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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function AttendancePage({
  params: { courseEventId },
}: Route.ComponentProps) {
  const [viewMode, setViewMode] = useSearchParamEntry("view", "edit");

  return (
    <Tabs value={viewMode} onValueChange={setViewMode}>
      <div className="pb-6 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/instructor">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Classes
          </Link>
        </Button>
        <TabsList variant="line">
          <TabsTrigger value="edit">Manage Attendance</TabsTrigger>
          <TabsTrigger value="print">Printable View</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="edit">
        <AttendanceEditView courseEventId={courseEventId} />
      </TabsContent>
      <TabsContent value="print">
        <AttendancePrintView courseEventId={courseEventId} />
      </TabsContent>
    </Tabs>
  );
}
