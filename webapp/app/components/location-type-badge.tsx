import type { CourseLocation } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";

export function LocationTypeBadge({ value }: { value: CourseLocation }) {
  switch (value) {
    case "virtual":
      return <Badge variant="violet">Virtual</Badge>;
    case "hybrid":
      return <Badge variant="indigo">Hybrid</Badge>;
    case "in-person":
      return <Badge variant="indigo">In Person</Badge>;
  }
}
