import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "app/components/ui/card";
import type { Profile, CourseEvent, Reservation, CourseLocation } from "../../../backend/src/database/schema";
import { DataTable } from "~/components/ui/data-table";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";


const profileTableDef: ColumnDef<Profile>[] = [
  {
    accessorKey: "accountId",
    header: "Account ID",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
];

const courseEventTableDef: ColumnDef<CourseEvent>[] = [
  {
    accessorKey: "courseName",
    header: "Name",
    meta: {
      className: "font-medium",
    }
  },
  {
    accessorKey: "classStartDatetime",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  },
  {
    accessorKey: "locationType",
    header: "Format",
    cell: ({ getValue }) => <LocationTypeBadge value={getValue()} />
  },
  {
    accessorKey: "physicalAddress",
    header: "Location",
    cell: ({ row, getValue }) => row.getValue("locationType") == "virtual" ? "Online" : getValue(),
    meta: {
      className: "text-muted-foreground",
    }
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
    accessorKey: "creditHours",
    header: "Credit Hours",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
  },
];

export function AdminDashboard() {
  const trpc = useTRPC();
  const profiles = useQuery(trpc.adminRouter.getProfiles.queryOptions());
  const courseEvents = useQuery(trpc.adminRouter.getCourseEvents.queryOptions());
  const reservations = useQuery(trpc.adminRouter.getReservations.queryOptions());
  
  return (
    <main className="flex flex-wrap items-center justify-center py-4 gap-4">
      <div className="w-full flex justify-center px-4">
        <Card className="">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>
                Click on a class to see it in the course manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable columns={courseEventTableDef} data={courseEvents.data ?? []} showGlobalFilter={false} />
          </CardContent>
        </Card>
      </div>

      <Card className="min-w-md">
        <CardTitle className="text-center">Profiles</CardTitle>
        <CardContent>
          <DataTable columns={profileTableDef} data={profiles.data ?? []} />
        </CardContent>
      </Card>

      <Card className="min-w-md">
        <CardTitle className="text-center">Reservations</CardTitle>
<CardContent>
          <DataTable columns={reservationTabledef} data={reservations.data ?? []} />
        </CardContent>
      </Card>

    </main>
  );
}

export function LocationTypeBadge({ value } : { value: CourseLocation }) {
  switch (value) {
    case "virtual":
      return (
        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">Virtual</span>
      )
    case "hybrid":
      return (
        <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">Hybrid</span>
      )

    case "in-person":
      return (
        <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">In Person</span>
      )
  }
}
