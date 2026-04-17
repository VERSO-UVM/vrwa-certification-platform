import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "~/components/data-table";
import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  userDefPresets,
  userDefs,
  type UserDto,
} from "~/utils/field-defs/user";
import { EditDrawer } from "~/components/entry-views/edit-drawer";
import { userFieldHelper } from "~/utils/field-defs/user";

export function UserManager() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const usersQuery = useQuery(trpc.account.list.queryOptions());

  const updateUserRoleMutation = useMutation(
    trpc.account.updateRole.mutationOptions({
      onSuccess: () => {
        toast.success("User role updated successfully!");
        queryClient.invalidateQueries(trpc.account.list.queryFilter());
      },
      onError: (err) => {
        toast.error(`Failed to update user role: ${err.message}`);
      },
    }),
  );

  const columnDefs: ColumnDef<UserDto, any>[] = [
    ...userDefPresets.basic,
    userDefs.createdAt,
    userFieldHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <EditDrawer
          item={row.original}
          columns={[userDefs.role]}
          drawer={{
            buttonText: "Edit",
            title: "Update Role",
            description: "Choose the role and save changes.",
          }}
          onSave={async (updates) => {
            const role = updates.role as
              | "user"
              | "instructor"
              | "admin"
              | undefined;
            if (!role) return;
            await updateUserRoleMutation.mutateAsync({
              userId: row.original.id,
              role,
            });
          }}
        />
      ),
    }),
  ];

  if (usersQuery.isLoading)
    return <div className="p-10 text-center">Loading users...</div>;

  return (
    <div className="flex-1">
      <PageHeader>User Management</PageHeader>
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <DataTable
          columns={columnDefs}
          data={(usersQuery.data ?? []) as unknown as UserDto[]}
        />
      </div>
    </div>
  );
}
