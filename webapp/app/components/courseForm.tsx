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
import { Textarea } from "./ui/textarea";

function useCourses() {
  const trpc = useTRPC();
  return useQuery(trpc.courseManagerRouter.getCourses.queryOptions());
}

//for input validation of tuition fee
function textToDollars(userInput: string) {
  let dollarAmt = userInput.trim();
  if (dollarAmt.charAt(0) === "$") {
    dollarAmt = dollarAmt.slice(1);
  }
  return Number(dollarAmt) * 100;
}

export function NewCourseForm({
  onCreate,
}: {
  onCreate: (data: any) => Promise<void>;
}) {
  const courses = useCourses();

  const [values, setValues] = useState({
    courseName: "",
    description: "",
    creditHours: 0,
    price: "",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onCreate({
      courseName: values.courseName.trim(),
      description: values.description.trim() || null,
      creditHours: values.creditHours,
      priceCents: textToDollars(values.price),
    });
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-6 p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="courseName">
            Course <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="courseName"
            type="text"
            required
            value={values.courseName}
            onChange={(e) =>
              setValues({ ...values, courseName: e.target.value })
            }
          ></Input>
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Desciption</FieldLabel>
          <Textarea
            id="desription"
            className="resize-none"
            value={values.description}
            onChange={(e) =>
              setValues({ ...values, description: e.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="creditHours">
            Credit Hours <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="creditHours"
            type="number"
            required
            value={values.creditHours}
            onChange={(e) =>
              setValues({ ...values, creditHours: Number(e.target.value) })
            }
          ></Input>
        </Field>
        <Field>
          <FieldLabel htmlFor="price">Enrollment Fee</FieldLabel>
          <Input
            id="price"
            type="text"
            placeholder="00.00"
            value={values.price}
            onChange={(e) => setValues({ ...values, price: e.target.value })}
          />
        </Field>
        <Field orientation="horizontal">
          <Button type="submit" className="w-full">
            {" "}
            Create Course{" "}
          </Button>
        </Field>
      </FieldGroup>
    </Form>
  );
}
