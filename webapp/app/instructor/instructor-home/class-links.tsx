import type { CourseEventDto } from "@backend/database/dtos";
import { ClipboardCheck, Printer } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";

export function ClassLinks({ session }: { session: CourseEventDto }) {
  return (
    <div className="pt-4">
      <ButtonGroup className="w-full">
        <Button size="sm" className="flex-1" asChild>
          <Link to={`/instructor/attendance/${session.id}?view=table`}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Attendance
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={`/instructor/attendance/${session.id}?view=print`}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Link>
        </Button>
      </ButtonGroup>
    </div>
  );
}
