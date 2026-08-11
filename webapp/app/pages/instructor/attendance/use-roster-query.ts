import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useRosterQuery(courseId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.reservations.instructor.listCourse.queryOptions({
      courseId,
    }),
  );
}
