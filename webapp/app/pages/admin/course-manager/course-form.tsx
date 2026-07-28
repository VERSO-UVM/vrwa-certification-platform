import { useState } from "react";
import { Form } from "@radix-ui/react-form";
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Button } from "~/components/ui/button";
import type { Course } from "@backend/database/schema";
import type { CourseUpdateInput } from "@backend/routers/course";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

//for input validation of tuition fee
function textToDollars(userInput: string) {
  let dollarAmt = userInput.trim();
  if (dollarAmt.charAt(0) === "$") {
    dollarAmt = dollarAmt.slice(1);
  }
  return Math.round(Number(dollarAmt) * 100);
}

export interface NewCourseFormProps {
  onCreate: (data: CourseUpdateInput) => void;
  course?: Course | null;
}

export function NewCourseForm({ onCreate, course }: NewCourseFormProps) {
  let priceString = "";
  if (course) {
    priceString = (course.priceCents / 100).toFixed(2).toString();
  }

  const [values, setValues] = useState(() => {
    if (!course) {
      return {
        courseName: "",
        description: "",
        creditHours: 0,
        price: "",
      };
    } else {
      return {
        courseName: course.courseName,
        description: course.description,
        creditHours: course.creditHours,
        price: priceString,
      };
    }
  });

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    onCreate({
      courseName: values.courseName.trim(),
      description: values.description?.trim() ?? null,
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
            value={values.description ?? ""}
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
            {course ? "Update Course" : "Create Course"}{" "}
          </Button>
        </Field>
      </FieldGroup>
    </Form>
  );
}
