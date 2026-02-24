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
import type {
  CourseEvent,
  CourseLocation,
  Reservation,
} from "@backend/database/schema.ts";
import { DataTable } from "~/components/ui/data-table";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Book, Trophy, Users } from "lucide-react";
import { LocationTypeBadge } from "~/components/location-type-badge";

const courseEventTableDef: ColumnDef<CourseEvent>[] = [
  {
    accessorKey: "courseName",
    header: "Name",
    cell: ({ row, getValue }) => (
      <Link
        to={{
          pathname: "/admin/course-manager",
          search: `?class=${row.original.id}`,
        }}
      >
        {getValue() as string}
      </Link>
    ),
    meta: {
      className: "font-medium hover:underline",
    },
  },
  {
    accessorKey: "classStartDatetime",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
  {
    accessorKey: "locationType",
    header: "Format",
    cell: ({ getValue }) => <LocationTypeBadge value={getValue()} />,
  },
  {
    accessorKey: "physicalAddress",
    header: "Location",
    cell: ({ row, getValue }) =>
      row.getValue("locationType") == "virtual" ? "Online" : getValue(),
    meta: {
      className: "text-muted-foreground",
    },
  },
  {
    accessorKey: "seats",
    header: "Seats",
    meta: {
      className: "text-right",
    },
  },
];

const reservationTabledef: ColumnDef<Reservation>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "isMember",
    header: "Member",
    cell: ({ getValue }) => (getValue() == true ? "yes" : "no"),
  },
  {
    accessorKey: "creditHours",
    header: "Credit Hours",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
  },
  {
    accessorKey: "courseName",
    header: "Course Name",
  },
  {
    accessorKey: "classStartDateTime",
    header: "Course Date",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
];

export function AdminDashboard() {
  const trpc = useTRPC();
  const courseEvents = useQuery(
    trpc.adminRouter.getCourseEvents.queryOptions(),
  );
  const reservations = useQuery(
    trpc.adminRouter.getReservations.queryOptions(),
  );

  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold tracking-tight pb-6">Admin Dashboard</h1>

      <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
        <Card className="@xl:col-span-5">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>
              Click on a class to see it in the&nbsp;
              <Link
                className="text-blue-500 underline"
                to="admin/course-manager"
              >
                course manager.
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={courseEventTableDef}
              data={courseEvents.data ?? []}
              showGlobalFilter={true}
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
              <Link to="">
                <Trophy className="mr-2 h-4 w-4" /> Send out certificates
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardTitle className="text-center">Search Reservations</CardTitle>
          <CardContent>
            <DataTable
              columns={reservationTabledef}
              data={reservations.data ?? []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

