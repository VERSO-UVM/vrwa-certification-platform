import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { CourseLocation } from "@backend/database/schema";
import type { CourseEventDto, ReservationDto } from "@backend/database/dtos";
import { DataTable } from "~/components/data-table";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Book, Trophy, Users } from "lucide-react";
import { LocationTypeBadge } from "~/components/location-type-badge";
import { PageHeader } from "~/components/page-header";
import {
  courseEventDefPresets,
  courseEventDefs,
} from "~/utils/field-defs/course-event";
import { reservationDefPresets } from "~/utils/field-defs/reservation";

export function AdminDashboard() {
  const trpc = useTRPC();
  const courseEvents = useQuery(
    trpc.adminRouter.getCourseEvents.queryOptions(),
  );
  const reservations = useQuery(
    trpc.adminRouter.getReservations.queryOptions(),
  );
  const navigate = useNavigate();

  return (
    <div className="flex-1">
      <PageHeader>Admin Dashboard</PageHeader>

      <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
        <Card className="@xl:col-span-5">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>
              Click on a class to see it in the&nbsp;
              <Link
                className="text-blue-500 underline"
                to="/admin/course-manager"
              >
                course manager.
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={courseEventDefPresets.default}
              data={courseEvents.data ?? []}
              table={{
                enableRowSelection: false,
              }}
            />
          </CardContent>
        </Card>
        <Card className="space-y-4 @xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-center">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="ghost"
              className="justify-start h-auto py-3 px-2"
              asChild
            >
              <Link to="/admin/profiles">
                <Users className="mr-2 h-4 w-4" /> Allot credit hours
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="justify-start h-auto py-3 px-2"
              asChild
            >
              <Link to="">
                <Book className="mr-2 h-4 w-4" /> View past courses
              </Link>
            </Button>

            <Button
              variant="ghost"
              className="justify-start h-auto py-3 px-2"
              asChild
            >
              <Link to="/admin/certifications">
                <Trophy className="mr-2 h-4 w-4" /> Send out certificates
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardTitle className="text-center">Search Reservations</CardTitle>
          <CardContent>
            <DataTable
              columns={reservationDefPresets.all}
              data={(reservations.data as ReservationDto[]) ?? []}
              table={{
                onRowSelectionChange: (selection) => {
                  // For now let's just make clicking a row
                  // try to go the profile details in the trainee page
                  const value =
                    selection instanceof Function ? selection({}) : selection;
                  const id = Object.keys(value)?.[0];
                  if (!id) return null;
                  const row = parseInt(id);
                  if (reservations.data?.[row]) {
                    navigate(
                      "/admin/trainees#" + reservations.data[row].profileId,
                    );
                  }
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
