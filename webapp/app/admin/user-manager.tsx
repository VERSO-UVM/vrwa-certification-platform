import { useQuery } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import { userDefPresets, userDefs } from "~/utils/field-defs/user";
import { useTRPC } from "~/utils/trpc";

const userColumns = [
  userDefs.email,
  userDefs.role,
];

export function UserManager() {
  const trpc = useTRPC();
  const usersQuery = useQuery(trpc.user.getUsers.queryOptions());
  const users = usersQuery.data ?? [];
  return (
    <>
      <PageHeader>Users</PageHeader>

      <DataTable data={users} columns={userColumns}/>
    </>
  );
}
