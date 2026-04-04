import { useQuery } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import {
  profileDefs,
  profileFieldHelper,
} from "~/utils/field-defs/profile";
import {
  getOnRowSelectionChange,
  getRowSelectionState,
} from "~/utils/single-row-select";
import { Trainee } from "./trainee-manager/trainee";
import { useHashString } from "~/hooks/use-hash-string";
import { TraineeEditButton } from "./trainee-manager/edit-profile";

const columnDefs = (() => {
  const { firstName, lastName, city, postalCode, isMember } = profileDefs;
  return [
    firstName,
    lastName,
    city,
    postalCode,
    isMember,
    profileFieldHelper.display({
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

  const [selectedId, setSelectedId] = useHashString(null);
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
              onRowSelectionChange: getOnRowSelectionChange(
                selectedRow,
                setSelectedRow,
              ),
              state: {
                rowSelection: getRowSelectionState(selectedRow),
              },
            }}
          />
        </div>
        {selectedTrainee ? <Trainee trainee={selectedTrainee} /> : null}
      </div>
    </div>
  );
}
