import type { Profile } from "@backend/database/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { PageHeader } from "~/components/page-header";
import { TraineeReservations } from "./trainee-reservations";
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
            columns={profileColumnSets.default}
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
            <DetailsDisplay item={selectedTrainee} columns={profileColumnSets.complete} />
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
