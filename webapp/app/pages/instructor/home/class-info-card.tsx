import type { CourseEventDto } from "@backend/database/dtos";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { ClassLinks } from "./class-links";
import { ClassStats } from "./class-stats";

const classInfoCardVariants = ["blue", "green", "yellow"] as const;

export function ClassInfoCard({
  session,
  index,
}: {
  session: CourseEventDto;
  index: number;
}) {
  const variant = index % classInfoCardVariants.length;
  return (
    <Card
      key={session.id}
      className="flex flex-col"
      variant={classInfoCardVariants[variant]}
    >
      <CardHeader>
        <CardTitle className="text-lg">{session.courseName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <ClassStats session={session} />
        <ClassLinks session={session} />
      </CardContent>
    </Card>
  );
}
