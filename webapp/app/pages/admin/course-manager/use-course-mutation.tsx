/**
 * Hooks for course mutations.
 */
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

function useInvalidateCourseQueries() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return () => {
    /* Don't await; invalidate in background */
    void queryClient.invalidateQueries({
      queryKey: trpc.courses.pathKey(),
    });
  };
}

export function useCourseCloneMutation() {
  const trpc = useTRPC();
  const invalidateQueries = useInvalidateCourseQueries();

  return useMutation(
    trpc.courses.admin.clone.mutationOptions({
      onSuccess: invalidateQueries,
    }),
  );
}

export function useCourseCreateMutation() {
  const trpc = useTRPC();
  const invalidateQueries = useInvalidateCourseQueries();

  return useMutation(
    trpc.courses.admin.create.mutationOptions({
      onSuccess: invalidateQueries,
    }),
  );
}

export function useCourseUpdateMutation() {
  const trpc = useTRPC();
  const invalidateQueries = useInvalidateCourseQueries();

  return useMutation(
    trpc.courses.admin.update.mutationOptions({
      onSuccess: invalidateQueries,
    }),
  );
}

export function useCourseDeleteMutation() {
  const trpc = useTRPC();
  const invalidateQueries = useInvalidateCourseQueries();

  return useMutation(
    trpc.courses.admin.delete.mutationOptions({
      onSuccess: invalidateQueries,
    }),
  );
}
