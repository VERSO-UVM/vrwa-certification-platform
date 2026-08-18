import { format } from "date-fns";
import { useClassDetailsQuery } from "./use-class-details-query";

export function ClassTitle({ courseId }: { courseId: string }) {
  const { data: details } = useClassDetailsQuery(courseId);

  if (!details) {
    return <>Loading class...</>;
  }
  const startDate = details.sessions[0]?.classStartDatetime;

  return (
    <>
      {details.courseName} -{" "}
      {startDate ? format(startDate, "PPP p") : "Date TBD"}
    </>
  );
}
