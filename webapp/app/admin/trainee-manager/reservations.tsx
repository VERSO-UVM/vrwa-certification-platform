import type { ReservationDto } from "@backend/database/dtos";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { useTRPC } from "~/utils/trpc";
import { EditTraineeReservation } from "./edit-reservation";
import {
  reservationFieldHelper,
  reservationDefs,
} from "~/utils/field-defs/reservation";
import type { ColumnDef } from "@tanstack/react-table";
import type { PaymentStatus } from "@backend/database/schema";

const columnDefs = [
  reservationDefs.courseName,
  {
    ...reservationDefs.creditHours,
    cell: ({ renderValue }) => (
      <span className="font-bold">{renderValue()}</span>
    ),
  } satisfies ColumnDef<ReservationDto, string>,
  {
    ...reservationDefs.paymentStatus,
    cell: ({ renderValue }) => (
      <span className="font-bold">{renderValue()}</span>
    ),
  } satisfies ColumnDef<ReservationDto, PaymentStatus>,
  reservationFieldHelper.display({
    header: "Actions",
    cell: ({ row }) => <EditTraineeReservation reservation={row.original} />,
  }),
  reservationDefs.classStartDateTime,
];

export function TraineeReservations({ profileId }: { profileId: string }) {
  const trpc = useTRPC();
  const query = useQuery(
    trpc.adminRouter.getTraineeReservations.queryOptions({
      profileId: profileId,
    }),
  );
  const reservations = (query.data ?? []) as ReservationDto[];

  return (
    <DataTable
      columns={columnDefs}
      data={reservations}
      table={{
        enableRowSelection: false,
      }}
    />
  );
}
