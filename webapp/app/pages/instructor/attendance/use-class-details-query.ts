import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useClassDetailsQuery(courseEventId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.courseEvents.instructor.get.queryOptions(
      { courseEventId: courseEventId },
    ),
  );
}
