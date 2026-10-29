import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useReservationCreateMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.reservations.admin.create.mutationOptions({
      onSuccess: () => {
        // Don't async/await this; let it go in the background
        // This function can take a long time to finish!
        queryClient.invalidateQueries({
          queryKey: trpc.reservations.admin.pathKey(),
        });
      },
    }),
  );
}
