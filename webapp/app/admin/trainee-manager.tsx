import type { Profile } from "@backend/database/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "~/components/ui/data-table";
import { PageHeader } from "~/components/page-header";
import { TraineeReservations } from "./trainee-manager/reservations";
import { useTRPC } from "~/utils/trpc";
import { useReactTableRowSelect } from "~/hooks/use-row-select";
import {
  profileColumnDefMap,
  profileColumnHelper,
  profileColumns,
} from "~/utils/column-defs/profile";
import { EditDrawer } from "~/components/edit-drawer";
import { DetailsDisplay } from "~/components/details-display";

const columnDefs = (() => {
  const { firstName, lastName, city, postalCode, isMember } =
    profileColumnDefMap;
  return [
    firstName,
    lastName,
    city,
    postalCode,
    isMember,
    profileColumnHelper.display({
      header: "Actions",
      cell: ({ row }) => {
        return <TraineeEditButton trainee={row.original} label="Edit" />;
      },
    }),
  ];
})();

export function TraineeManager() {
  const trpc = useTRPC();
  const traineesQuery = useQuery(trpc.adminRouter.getTrainees.queryOptions());
  const trainees = traineesQuery.data ?? [];
  const [
    [selectedRow, _],
    [reactTableRowSelection, reactTableSelectionChange],
  ] = useReactTableRowSelect();

  const selectedTrainee = trainees[selectedRow] ?? null;

  return (
    <div className="flex-1">
      <PageHeader>Trainees</PageHeader>

      <div className="flex flex-col space-y-1 ">
        <div className="flex-1 border rounded p-3">
          <DataTable
            columns={columnDefs}
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
            <h2 className="text-lg font-medium py-4">Classes</h2>
            <TraineeReservations profileId={selectedTrainee.id} />

            <h2 className="text-lg font-medium py-4">Trainee Details</h2>
            <TraineeEditButton
              label="Edit"
              trainee={selectedTrainee}
            />
            <div className="pt-4"></div>
            <DetailsDisplay
              item={selectedTrainee}
              columns={profileColumns.all}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TraineeEditButton({
  trainee,
  label,
}: {
  trainee: Profile;
  label: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateQuery = useMutation(
    trpc.profile.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.adminRouter.getTrainees.queryKey(),
        });
      },
    }),
  );
  return (
    <EditDrawer
      drawer={{
        buttonText: label,
        title: "Update Trainee Details",
        description: "Save changes to go through with the edit.",
      }}
      item={trainee}
      columns={profileColumns.all}
      onSave={async (changes) => {
        await updateQuery.mutateAsync({
          ...changes,
          id: trainee.id,
        });
      }}
    />
  );
}
