import type { Profile } from "@backend/database/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { PageHeader } from "~/components/page-header";
import { TraineeReservations } from "./trainee-reservations";
import { useTRPC } from "~/utils/trpc";
import { useReactTableRowSelect } from "~/hooks/use-row-select";
import { profileColumnSets } from "~/utils/column-defs/profile";
import { DetailsDisplay } from "~/components/details-display";
import { EditForm } from "~/components/edit-form";
import { StandardDrawer } from "~/components/standard-drawer";
import { useState } from "react";

export function TraineeManager() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateQuery = useMutation(trpc.profile.update.mutationOptions());
  const traineesQuery = useQuery(trpc.adminRouter.getTrainees.queryOptions());
  const trainees = (traineesQuery.data ?? []) as Profile[];
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const [
    [selectedRow, _],
    [reactTableRowSelection, reactTableSelectionChange],
  ] = useReactTableRowSelect();

  const selectedTrainee = trainees[selectedRow] ?? null;

  const onTraineeUpdated = async (changes: Partial<Profile>) => {
    if (selectedTrainee == null) throw new Error("No trainee selected");
    console.log("Updating", changes);
    await updateQuery.mutateAsync({
      ...changes,
      id: selectedTrainee.id,
    });
    queryClient.invalidateQueries({
      queryKey: trpc.adminRouter.getTrainees.queryKey(),
    });
    setEditDrawerOpen(false);
  };

  return (
    <div className="flex-1">
      <PageHeader>Trainees</PageHeader>

      <div className="flex flex-col space-y-1 ">
        <div className="flex-1 border rounded p-3">
          <DataTable
            columns={profileColumnSets.complete}
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
            <StandardDrawer
              buttonText="Edit"
              title="Update Trainee Details"
              description="Save changes to go through with the edit."
              open={editDrawerOpen}
              onOpenChange={setEditDrawerOpen}
            >
              <EditForm
                item={selectedTrainee}
                columns={profileColumnSets.complete}
                onSave={onTraineeUpdated}
              />
            </StandardDrawer>

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
