import { useParams } from "react-router";
import type { Route } from "./+types/attendance";
import { useSearchParamEntry } from "~/hooks/use-search-param-entry";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";

export default function AttendancePage({ params }: Route.ComponentProps) {
  const [viewMode, setViewMode] = useSearchParamEntry("view", "table");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return <>{viewMode}</>;
}
