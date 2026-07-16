import { useQuery } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import {
  userDefPresets,
  userDefs,
  userFieldHelper,
} from "~/utils/field-defs/user";
import { useTRPC } from "~/utils/trpc";
import { EditUserButton } from "./user-manager/edit-user-button";
import { useSessionData } from "~/utils/session";

const userColumns = [
  userDefs.email,
  userDefs.role,
  userFieldHelper.display({
    header: "Actions",
    cell: ({ row, cell }) => {
      const session = useSessionData();
      if (row.original.email == session?.user.email) {
        return <p className="font-light">(This is you)</p>;
      }
      return <EditUserButton user={row.original} />;
    },
  }),
];

export function UserManager() {
  const trpc = useTRPC();
  const usersQuery = useQuery(trpc.user.getUsers.queryOptions());
  const users = usersQuery.data ?? [];
  return (
    <>
      <PageHeader>Users</PageHeader>

      <DataTable
        data={users}
        columns={userColumns}
        table={{
          enableRowSelection: false,
        }}
      />
    </>
  );
}
