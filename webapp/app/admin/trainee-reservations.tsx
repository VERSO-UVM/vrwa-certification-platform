import type { ReservationDto } from "@backend/database/dtos";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "~/components/ui/data-table";
import { useTRPC } from "~/utils/trpc";

const reservationTableDef: ColumnDef<ReservationDto>[] = [
  {
    accessorKey: "courseName",
    header: "Course Name",
  },
  {
    accessorKey: "classStartDateTime",
    header: "Course Date",
    cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
  },
  {
    accessorKey: "creditHours",
    header: "Credit Hours Received",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
  },
];

export function TraineeReservations({ profileId }: { profileId: string }) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.adminRouter.getTraineeReservations.queryOptions({ profileId: profileId }),
  );
  const reservations = (query.data ?? []) as ReservationDto[];

  return (
    <DataTable columns={reservationTableDef} data={reservations} />
  );
}
