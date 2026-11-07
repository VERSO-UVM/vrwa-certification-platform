/**
 * Drawer button to clone a course and its sessions.
 */
import type { CourseDto } from "@backend/database/dtos";
import { addYears } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useCourseCloneMutation } from "./use-course-mutation";
import { StandardDrawer } from "~/components/standard-drawer";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Checkbox } from "~/components/ui/checkbox";
import { DrawerClose, DrawerFooter } from "~/components/ui/drawer";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "~/components/ui/field";
import { Label } from "~/components/ui/label";

export function CloneCourse({ course }: { course: CourseDto }) {
  const navigate = useNavigate();
  const originalStartDate = course.startDate ?? new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    originalStartDate,
  );
  const [shouldCopySessions, setShouldCopySessions] = useState(true);
  const cloneMutation = useCourseCloneMutation();

  const cloneCourse = async () => {
    const { courseId } = await cloneMutation.mutateAsync({
      copyCourseEventsToDate:
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
      <div className="grid grid-cols-1 p-6 gap-4">
        <FieldLabel className="border p-4 rounded-xl w-full text-center">
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Copy training sessions</FieldTitle>
            </FieldContent>
            <Checkbox
              checked={shouldCopySessions}
              onCheckedChange={(checked) =>
                setShouldCopySessions(Boolean(checked))
              }
            />
          </Field>
        </FieldLabel>
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
      <DrawerFooter className="grid gap-2 p-0">
        <Button className="w-full" onClick={() => cloneCourse()}>
          Next
        </Button>
        <DrawerClose asChild>
          <Button variant="cancel_button" className="w-full">
            Cancel
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </StandardDrawer>
  );
}
