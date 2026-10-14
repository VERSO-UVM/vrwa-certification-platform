import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useCourseEventUpdateMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.courseEvents.admin.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.admin.pathKey(),
        });
      },
    }),
  );
}

export function useCourseEventCloneMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.courseEvents.admin.clone.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.admin.pathKey(),
        });
      },
    }),
  );
}

export function useCourseEventDeleteMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.courseEvents.admin.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.admin.pathKey(),
        });
      },
    }),
  );
}
