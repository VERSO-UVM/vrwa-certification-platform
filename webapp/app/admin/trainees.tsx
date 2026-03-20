import type { Profile } from "@backend/database/schema";
import { useQuery } from "@tanstack/react-query";
import {
  type Table,
  type ColumnDef,
  type RowSelectionState,
  RowSelection,
} from "@tanstack/react-table";
import { useRef, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { PageHeader } from "~/components/page-header";
import { DataTable } from "~/components/ui/data-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Divide } from "lucide-react";
import { TraineeReservations } from "./trainee-reservations";

const profileTableDef: ColumnDef<Profile>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
];

export function TraineeManager() {
  const trpc = useTRPC();
  const traineesQuery = useQuery(trpc.adminRouter.getTrainees.queryOptions());
  const trainees = (traineesQuery.data ?? []) as Profile[];

  const [rowSelection, setRowSelection] = useState<number>(0);
  const reactTableRowSelection = { [rowSelection.toString()]: true };
  const selectedIndex = rowSelection;
  const selectedTrainee =
    selectedIndex != null ? trainees[selectedIndex] : null;

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader>Trainees</PageHeader>

      <div className="flex flex-col space-y-1">
        <div className="flex-1 border rounded p-3">
          <DataTable
            columns={profileTableDef}
            data={trainees}
            table={{
              onRowSelectionChange: (newState) => {
                const [selection, ...additionalSelections] = Object.entries(
                  typeof newState == "function"
                    ? newState(reactTableRowSelection)
                    : newState,
                )
                  .filter(([_, selected]) => selected)
                  .map(([id, _]) => parseInt(id));
                if (selection != null && additionalSelections.length == 0) {
                  setRowSelection(selection);
                }
              },
              state: {
                rowSelection: reactTableRowSelection,
              },
            }}
          />
        </div>
        {selectedTrainee != null ? (
          <div className="bg-gray-50 p-5 rounded">
            <h2 className="text-xl font-medium pb-4">{selectedTrainee.firstName} {selectedTrainee.lastName}</h2>
            <ul className="flex flex-col space-y-2 pb-2">
              <li>
                <b>First Name(s):</b> {selectedTrainee.firstName}
              </li>
              <li>
                <b>Last Name(s):</b> {selectedTrainee.lastName}
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
            <h2 className="text-lg font-medium py-4">Reservations</h2>
            <TraineeReservations profileId={selectedTrainee.id} />

            <Button>Edit</Button>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}
