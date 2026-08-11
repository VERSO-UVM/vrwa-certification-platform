import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useCreditHoursUpdate(courseId: string) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.reservations.instructor.updateCreditHours.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reservations.instructor.listCourse.queryFilter({
            courseId: courseId,
          }),
        );
      },
    }),
  );
}
