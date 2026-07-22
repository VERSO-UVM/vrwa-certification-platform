import type { Role } from "@backend/auth/permissions";
import type { CourseLocation } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";

export function RoleBadge({ value }: { value: Role }) {
  switch (value) {
    case "instructor":
      return <Badge variant="other_blue">Instructor</Badge>;
    case "user":
      return <Badge variant="yellow">Trainee</Badge>;
    case "admin":
      return <Badge variant="other_green">Admin</Badge>;
  }
}
