import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import { Calendar, MapPin, Users, Printer, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router";

import { useQuery } from "@tanstack/react-query";

export function InstructorHome() {
  const trpc = useTRPC();
  const { data: courses, isPending } = useQuery(
    trpc.instructor.getMyUpcomingCourses.queryOptions(),
  );

  if (isPending) return <div className="p-10">Loading your courses...</div>;

  return (
    <div className="space-y-6">
      <PageHeader>VRWA | Instructor Dashboard</PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <Card key={course.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{course.courseName}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {course.classStartDatetime
                    ? format(new Date(course.classStartDatetime), "PPP p")
                    : "TBD"}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {course.locationType === "virtual"
                    ? "Virtual"
                    : course.physicalAddress || "TBD"}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {course.seats} Seats
                </div>
              </div>

              <div className="pt-4">
                <ButtonGroup className="w-full">
                  <Button size="sm" className="flex-1" asChild>
                    <Link to={`/instructor/attendance/${course.id}?view=table`}>
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Attendance
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/instructor/attendance/${course.id}?view=print`}>
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Link>
                  </Button>
                </ButtonGroup>
              </div>
            </CardContent>
          </Card>
        ))}
        {courses?.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
            No courses assigned to you yet.
          </div>
        )}
      </div>
    </div>
  );
}
