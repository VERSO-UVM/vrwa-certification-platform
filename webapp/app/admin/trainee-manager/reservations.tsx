import type { ReservationDto } from "@backend/database/dtos";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "~/components/ui/data-table";
import { useReactTableRowSelect } from "~/hooks/use-row-select";
import { useTRPC } from "~/utils/trpc";
import { EditTraineeReservation } from "./edit-reservation";
import {
  reservationColumnDefLists,
  reservationColumnHelper,
} from "~/utils/column-defs/reservation";

const columnDefs = [
  ...reservationColumnDefLists.basic,
  reservationColumnHelper.display({
    header: "Actions",
    cell: ({ row }) => <EditTraineeReservation reservation={row.original} />,
  }),
];

export function TraineeReservations({ profileId }: { profileId: string }) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.adminRouter.getTraineeReservations.queryOptions({
      profileId: profileId,
    }),
  );
  const reservations = (query.data ?? []) as ReservationDto[];

  const [[index], [rowSelection, onRowSelectionChange]] =
    useReactTableRowSelect();
  const selectedReservation = reservations[index] ?? null;

  return (
    <DataTable
      columns={columnDefs}
      data={reservations}
      table={{
        onRowSelectionChange,
        state: {
          rowSelection,
        },
      }}
    />
  );
}
