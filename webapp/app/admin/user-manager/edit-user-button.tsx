import type { UserDto } from "@backend/database/dtos";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { EditDrawer } from "~/components/entry-views/edit-drawer";
import { userDefs, userFieldHelper } from "~/utils/field-defs/user";
import { useTRPC } from "~/utils/trpc";

const fields = [
  // Display Email so they know whose role they are updating
  userFieldHelper.accessor("email", {
    header: "Email",
    meta: {
      editor: ({ ctx: { renderValue } }) => renderValue(),
    },
  }),
  userDefs.profiles,
  userDefs.role,
];

export function EditUserButton({ user }: { user: UserDto }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const updateQuery = useMutation(
    trpc.user.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.user.getUsers.queryKey(),
        });
      },
    }),
  );
  return (
    <EditDrawer
      drawer={{
        buttonText: "Change Role",
        title: "Update User Role",
        description: "Save changes to go through with the update.",
      }}
      item={user}
      columns={fields}
      onSave={async (changes) => {
        await updateQuery.mutateAsync({
          ...changes,
          id: user.id,
        });
      }}
    />
  );
}
