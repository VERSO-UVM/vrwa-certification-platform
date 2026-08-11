import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useClassDetailsQuery(courseId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.courses.instructor.get.queryOptions({
      courseId: courseId,
    }),
  );
}
