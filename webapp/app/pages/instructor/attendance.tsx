/**
 * Instructor class attendance page.
 */
import { Link } from "react-router";
import type { Route } from "./+types/attendance";
import { useSearchParamEntry } from "~/hooks/use-search-param-entry";
import { Button } from "~/components/ui/button";
import { AttendancePrintView } from "./attendance/attendance-print-view";
import { AttendanceEditView } from "./attendance/attendance-edit-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ArrowLeft } from "lucide-react";

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
          <TabsTrigger value="print">Sign-in Sheet</TabsTrigger>
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
