/**
 * Hooks for course mutations.
 */
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useCourseCloneMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.courses.admin.clone.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.courses.pathKey(),
        });
      },
    }),
  );
}

export function useCourseCreateMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.courses.admin.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.courses.pathKey(),
        });
      },
    }),
  );
}

