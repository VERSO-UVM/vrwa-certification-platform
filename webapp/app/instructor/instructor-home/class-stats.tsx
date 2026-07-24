import type { CourseEventDto } from "@backend/database/dtos";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";

export function ClassStats({ session }: { session: CourseEventDto }) {
  return (
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
  );
}
