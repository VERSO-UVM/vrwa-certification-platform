import { format } from "date-fns";
import { useClassDetailsQuery } from "./use-class-details-query";

export function ClassTitle({ courseEventId }: { courseEventId: string }) {
  const { data: details } = useClassDetailsQuery(courseEventId);

  if (details == null) {
    return <>Loading class...</>;
  }

  return (
    <>
      {details.courseName} -{" "}
      {details.classStartDatetime
        ? format(new Date(details.classStartDatetime), "PPP p")
        : "Date TBD"}
    </>
  );
}
