import { useState } from "react";
import { useTRPC } from "~/utils/trpc";
import {
  Form,
  FormControl,
  FormMessage,
  FormSubmit,
} from "@radix-ui/react-form";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import type { Course } from "@backend/database/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "~/components/ui/select";

function useCourses() {
  const trpc = useTRPC();
  return useQuery(trpc.courseManagerRouter.getCourses.queryOptions());
}

export function NewCourseEventForm({ onCreate }: { onCreate: (data: any) => Promise<void> }) {
  const courses = useCourses();

  const [values, setValues] = useState({
    courseId: "",
    locationType: "in-person",
    seats: 0,
    physicalAddress: "",
    virtualLink: "",
    date: new Date(),
    time: "12:00",
  });

  function combineDateAndTime(date: Date, time: string) {
    const [hours, mins] = time.split(":").map(Number);
    const combo = new Date(date);
    combo.setHours(hours ?? 0);
    combo.setMinutes(mins ?? 0);
    combo.setSeconds(0);
    return combo;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const classStartDatetime = combineDateAndTime(values.date, values.time);

    onCreate({
      courseId: values.courseId,
      locationType: values.locationType,
      seats: values.seats,
      classStartDatetime,
      physicalAddress: values.physicalAddress.trim() || null,
      virtualLink: values.virtualLink.trim() || null,
    });
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-6 p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="courses">
            Course <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            required
            value={values.courseId}
            onValueChange={(v) => setValues({ ...values, courseId: v })}
          >
            <SelectTrigger id="courses" className="w-full max-w-48">
              <SelectValue placeholder="Select a Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Courses</SelectLabel>
                {courses.data?.map((course: Course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.courseName}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="seats">
            Seats <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="seats"
            type="number"
            min={1}
            required
            value={values.seats}
            onChange={(e) =>
              setValues({ ...values, seats: Number(e.target.value) })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="locationType">
            Location Type <span className="text-destructive">*</span>
          </FieldLabel>
          <Select
            value={values.locationType}
            onValueChange={(v) => setValues({ ...values, locationType: v })}
          >
            <SelectTrigger id="locationType" className="w-full">
              <SelectValue placeholder="Select a Location Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Location</SelectLabel>
                <SelectItem value="in-person">In Person</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="physicalAddress">Physical Address</FieldLabel>
          <Input
            id="physicalAddress"
            type="text"
            placeholder="123 Main St"
            value={values.physicalAddress}
            onChange={(e) =>
              setValues({ ...values, physicalAddress: e.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="virtualLink">Virtual Link </FieldLabel>
          <Input
            id="virtualLink"
            type="url"
            placeholder="https://yourlink.com"
            value={values.virtualLink}
            onChange={(e) =>
              setValues({ ...values, virtualLink: e.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="date">
            Date <span className="text-destructive">*</span>
          </FieldLabel>
          <Calendar
            id="date"
            mode="single"
            selected={values.date}
            onSelect={(d) => d && setValues({ ...values, date: d })}
            className="rounded-md border"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="time">
            Time <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="time"
            type="time"
            required
            value={values.time}
            onChange={(e) => setValues({ ...values, time: e.target.value })}
          />
        </Field>
        <Field orientation="horizontal">
          <Button type="submit" className="w-full">
            {" "}
            Create Course Event{" "}
          </Button>
        </Field>
      </FieldGroup>
    </Form>
  );
}
