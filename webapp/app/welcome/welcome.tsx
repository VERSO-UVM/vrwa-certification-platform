import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import type { Profile, CourseEvent, Reservation } from "../../../backend/src/database/schema";
import { DataTable } from "~/components/ui/data-table";


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
    accessorKey: "physicalAddress",
    header: "Address",
  },
  {
    accessorKey: "virtualLink",
    header: "Link",
  },
  {
    accessorKey: "locationType",
    header: "Instruction",
  },
  {
    accessorKey: "seats",
    header: "Seats",
  },
  {
    accessorKey: "classStartDatetime",
    header: "Date",
    cell: ({ getValue }) => new Date(getValue()).toLocaleString(),
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

export function Welcome() {
  const trpc = useTRPC();
  const profiles = useQuery(trpc.adminRouter.getProfiles.queryOptions());
  const courseEvents = useQuery(trpc.adminRouter.getCourseEvents.queryOptions());
  const reservations = useQuery(trpc.adminRouter.getReservations.queryOptions());
  
  return (
    <main className="flex flex-wrap items-center justify-center py-4">
      <Card className="min-w-lg">
        <CardTitle className="text-center">Upcoming Classes</CardTitle>
        <CardContent>
          <DataTable columns={courseEventTableDef} data={courseEvents.data ?? []} />
        </CardContent>
      </Card>

      <Card className="min-w-md">
        <CardTitle className="text-center">Reservations</CardTitle>
        <CardContent>
          <DataTable columns={reservationTabledef} data={reservations.data ?? []} />
        </CardContent>
      </Card>

      <Card className="min-w-md">
        <CardTitle className="text-center">Profiles</CardTitle>
        <CardContent>
          <DataTable columns={profileTableDef} data={profiles.data ?? []} />
        </CardContent>
      </Card>

    </main>
  );
}
