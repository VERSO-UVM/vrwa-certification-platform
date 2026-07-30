/**
 * Instructor home/dashboard page with view of upcoming classes.
 */
import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { ClassInfoCard } from "./home/class-info-card";

export function meta() {
  return [{ title: "Instructor Dashboard" }];
}

export default function InstructorHome() {
  const trpc = useTRPC();
  const { data: courseEvents, isPending } = useQuery(
    trpc.courseEvents.instructor.listUpcoming.queryOptions(),
  );

  return (
    <div className="space-y-6">
      <PageHeader>Upcoming Classes</PageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courseEvents?.map((session, i) => (
          <ClassInfoCard key={session.id} session={session} index={i} />
        ))}
        {courseEvents?.length === 0 &&
          (isPending ? (
            <div className="p-10">Fetching upcoming classes...</div>
          ) : (
            <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
              No upcoming classes right now!
            </div>
          ))}
      </div>
    </div>
  );
}
