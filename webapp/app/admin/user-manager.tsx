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
import { Button } from "~/components/ui/button";
import { SquarePen } from "lucide-react";

const userColumns = [
  userDefs.email,
  userDefs.role,
  userDefs.profiles,
  userFieldHelper.display({
    header: "Actions",
    cell: ({ row }) => {
      const session = useSessionData();
      if (row.original.email == session?.user.email) {
        // Don't let them demote themselves. They would not
        // be able to change themselves back to admin after.
        return (
          <Button variant="secondary" disabled className="">
            <SquarePen /> You're admin
          </Button>
        );
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
