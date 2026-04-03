import { useEffect, useState } from "react";
import type { Profile } from "@backend/database/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import { TraineeReservations } from "./trainee-manager/reservations";
import { useTRPC } from "~/utils/trpc";
import {
  profileColumnDefs,
  profileColumnHelper,
  profileColumnPresets,
} from "~/utils/column-defs/profile";
import { EditDrawer } from "~/components/edit-drawer";
import { DetailsDisplay } from "~/components/details-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useSearchParamEntry } from "~/hooks/use-search-param-entry";
import { getOnRowSelectionChange, getRowSelectionState } from "~/utils/single-row-select";

const columnDefs = (() => {
  const { firstName, lastName, city, postalCode, isMember } = profileColumnDefs;
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

  const [selectedId, setSelectedId] = useSearchParamEntry("id", null);
  const match = trainees.findIndex((x) => x.id == selectedId);
  const selectedRow = match !== -1 ? match : 0;
  const setSelectedRow = (index: number) =>
    setSelectedId(trainees[index]?.id ?? null);

  const selectedTrainee = trainees[selectedRow] ?? null;

  return (
    <div className="flex-1">
      <PageHeader>Trainees</PageHeader>

      <div className="flex flex-col space-y-1 ">
        <div className="flex-1 rounded p-3">
          <DataTable
            columns={columnDefs}
            data={trainees}
            table={{
              onRowSelectionChange: getOnRowSelectionChange(selectedRow, setSelectedRow),
              state: {
                rowSelection: getRowSelectionState(selectedRow),
              },
            }}
          />
        </div>
        {selectedTrainee != null ? (
          <div className="p-5 rounded">
            <h2 className="text-xl font-medium text-center p-4 my-0 bg-accent rounded-xl">
              {selectedTrainee.firstName} {selectedTrainee.lastName}
            </h2>

            <div className="flex place-content-between space-x-5 flex-wrap">
              <Card className="flex-1 border-none shadow-none">
                <CardHeader>
                  <CardTitle>Classes</CardTitle>
                  <CardDescription>
                    Manage alloted credit hours for past classes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TraineeReservations profileId={selectedTrainee.id} />
                </CardContent>
              </Card>
              <Card className="w-[250px] border-none shadow-none">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>
                    {selectedTrainee.firstName + " " + selectedTrainee.lastName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TraineeEditButton label="Edit" trainee={selectedTrainee} />
                  <div className="pt-4"></div>
                  <DetailsDisplay
                    item={selectedTrainee}
                    columns={profileColumnPresets.all}
                  />
                </CardContent>
              </Card>
            </div>
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
      columns={profileColumnPresets.all}
      onSave={async (changes) => {
        await updateQuery.mutateAsync({
          ...changes,
          id: trainee.id,
        });
      }}
    />
  );
}
