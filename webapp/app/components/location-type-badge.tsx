import type { CourseLocation } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";


export function LocationTypeBadge({ value }: { value: CourseLocation }) {
  switch (value) {
    case "virtual":
      return <Badge variant="blue">Virtual</Badge>;
    case "hybrid":
      return <Badge variant="purple">Hybrid</Badge>;
    case "in-person":
      return <Badge variant="green">In Person</Badge>;
  }
}
