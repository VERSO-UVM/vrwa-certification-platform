import type { CourseDto } from "@backend/database/dtos";
import { useMutation } from "@tanstack/react-query";
import { addYears } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router";
import { StandardDrawer } from "~/components/standard-drawer";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { DrawerClose } from "~/components/ui/drawer";
import { Label } from "~/components/ui/label";
import { useTRPC } from "~/utils/trpc";
import { courseStartDate } from "~/utils/utils";

export function CloneCourse({ course }: { course: CourseDto }) {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const originalStartDate = courseStartDate(course) ?? new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(originalStartDate);
  const [shouldCopySessions, setShouldCopySessions] = useState(true);
  const cloneMutation = useMutation(trpc.courses.admin.clone.mutationOptions());

  const cloneCourse = async () => {
    const { courseId } = await cloneMutation.mutateAsync({
      copyCourseEvents:
        shouldCopySessions && selectedDate ? selectedDate : undefined,
      courseId: course.id,
    });
    navigate(`/admin/course-details/${courseId}`);
  };

  return (
    <StandardDrawer
      title="Clone Course"
      description={`Create course based on ${course.courseName}.`}
      openButton={
        <Button
          onClick={(e) => {
            e.stopPropagation();
          }}
          variant="default"
        >
          Clone
        </Button>
      }
    >
      <div className="flex flex-col justify-between">
        <div className="grid grid-cols-1 p-6 gap-4">
          <Label className="border p-4 rounded-xl">
            <Checkbox
              checked={shouldCopySessions}
              onCheckedChange={(checked) =>
                setShouldCopySessions(Boolean(checked))
              }
            />
            Copy sessions
          </Label>
          {shouldCopySessions && (
            <div className="border p-4 rounded-xl flex flex-col">
              <Label htmlFor="start-date">Start date</Label>
              <Calendar
                id="start-date"
                mode="single"
                selected={selectedDate}
                onSelect={(date) => setSelectedDate(date)}
                captionLayout="dropdown"
                className="rounded-md w-full"
                startMonth={addYears(originalStartDate, -1)}
                endMonth={addYears(originalStartDate, 4)}
              />
            </div>
          )}
        </div>
        <div className="grid gap-2">
          <Button className="w-full" onClick={() => cloneCourse()}>
            Next
          </Button>
          <DrawerClose>
            <Button variant="cancel_button" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </div>
      </div>
    </StandardDrawer>
  );
}
