import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Calendar, MapPin, Users, Printer, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";
import type { CourseEventDto } from "@backend/database/dtos";

export function ClassInfoCard({ session }: { session: CourseEventDto }) {
  return (
    <Card key={session.id} className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{session.courseName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            {session.classStartDatetime
              ? format(new Date(session.classStartDatetime), "PPP p")
              : "TBD"}
          </div>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4" />
            {session.locationType === "virtual"
              ? "Virtual"
              : session.physicalAddress || "TBD"}
          </div>
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            {session.seats} Seats
          </div>
        </div>

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
      </CardContent>
    </Card>
  );
}
