/**
 * Mutations for courseEvents. For the moment they invalidate ALL courseEvent queries in the
 * background on success.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useCourseEventUpdateMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.courseEvents.admin.update.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.pathKey(),
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
        void queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.pathKey(),
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
        void queryClient.invalidateQueries({
          queryKey: trpc.courseEvents.pathKey(),
        });
      },
    }),
  );
}
