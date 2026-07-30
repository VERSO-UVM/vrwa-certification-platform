import type { ReservationDto } from "@backend/database/dtos";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export function useRosterQuery(courseEventId: string) {
  const trpc = useTRPC();

  return useQuery(
    trpc.reservations.instructor.listCourseEvent.queryOptions({
      courseEventId,
    }),
  );
}
