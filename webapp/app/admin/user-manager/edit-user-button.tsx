import type { UserDto } from "@backend/database/dtos";
import type { Profile } from "@backend/database/schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { EditDrawer } from "~/components/entry-views/edit-drawer";
import { profileDefPresets } from "~/utils/field-defs/profile";
import { userDefPresets, userDefs } from "~/utils/field-defs/user";
import { useTRPC } from "~/utils/trpc";

const fieldDefs = [userDefs.role];

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
      columns={fieldDefs}
      onSave={async (changes) => {
        await updateQuery.mutateAsync({
          ...changes,
          id: user.id,
        });
      }}
    />
  );
}
