import type { Profile } from "@backend/database/schema";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { EditDrawer } from "~/components/edit-drawer";
import { profileColumnPresets } from "~/utils/column-defs/profile";
import { useTRPC } from "~/utils/trpc";

export function TraineeEditButton({
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
