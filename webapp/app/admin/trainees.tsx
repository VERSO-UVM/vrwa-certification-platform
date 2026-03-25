import type { Profile } from "@backend/database/schema";
import { useQuery } from "@tanstack/react-query";
import type {
  ColumnDef,
  RowSelectionState,
  Updater,
} from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { PageHeader } from "~/components/page-header";
import { TraineeReservations } from "./trainee-reservations";
import { useState } from "react";
import { useTRPC } from "~/utils/trpc";
import { useReactTableRowSelect } from "~/hooks/use-row-select";
import { profileColumnSets } from "~/utils/column-defs/profile";
import { DetailsDisplay } from "~/components/ui/details-display";

export function TraineeManager() {
  const trpc = useTRPC();
  const traineesQuery = useQuery(trpc.adminRouter.getTrainees.queryOptions());
  const trainees = (traineesQuery.data ?? []) as Profile[];

  const [
    [selectedRow, _],
    [reactTableRowSelection, reactTableSelectionChange],
  ] = useReactTableRowSelect();

  const selectedTrainee = trainees[selectedRow] ?? null;

  return (
    <div className="flex-1">
      <PageHeader>Trainees</PageHeader>

      <div className="flex flex-col space-y-1 max-w-5xl ">
        <div className="flex-1 border rounded p-3">
          <DataTable
            columns={profileTableDef}
            data={trainees}
            table={{
              onRowSelectionChange: reactTableSelectionChange,
              state: {
                rowSelection: reactTableRowSelection,
              },
            }}
          />
        </div>
        {selectedTrainee != null ? (
          <div className="p-5 rounded">
            <h2 className="text-xl font-medium pb-4">
              {selectedTrainee.firstName} {selectedTrainee.lastName}
            </h2>
            <ul className="flex flex-col space-y-2 pb-2">
              <li>
                <b>First Name(s):</b> {selectedTrainee.firstName}
              </li>
              <li>
                <b>Last Name(s):</b> {selectedTrainee.lastName}
              </li>
              <li>
                <b>Address:</b> {selectedTrainee.address}
              </li>
              <li>
                <b>City:</b> {selectedTrainee.city}
              </li>
              <li>
                <b>Postal Code:</b> {selectedTrainee.postalCode}
              </li>
              <li>
                <b>Phone Number:</b> {selectedTrainee.phoneNumber}
              </li>
              <li>
                <b>Is Member:</b> {selectedTrainee.isMember ? "Yes" : "No"}
              </li>
            </ul>

            <Button>Edit</Button>

            <h2 className="text-lg font-medium py-4">Classes</h2>
            <TraineeReservations profileId={selectedTrainee.id} />
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
