import type { Profile } from "@backend/database/schema";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "~/components/page-header";
import { DataTable } from "~/components/ui/data-table";
import { useTRPC } from "~/utils/trpc";

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

  return (
    <div className="flex-1">
      <PageHeader>Trainees</PageHeader>

      <DataTable
        columns={profileTableDef}
        data={trainees}
        showGlobalFilter={true}
        className="flex-1"
      />
    </div>
  );
}
