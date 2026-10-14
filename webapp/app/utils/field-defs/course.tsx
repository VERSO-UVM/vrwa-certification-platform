import type { CourseDto } from "@backend/database/dtos";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";
import { courseStartDate } from "../utils";
import {
  intInputEditor,
  priceCentsEditor,
  selectOptionsEditor,
  textAreaEditor,
  textInputEditor,
} from "../field-editors";
import {
  CourseStatus,
  CreditHourCategory,
  type Course,
} from "@backend/database/schema";
import type { CourseInsert } from "@backend/routers/course";
import { MultiComboboxEditor } from "~/components/field-editors/combobox";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../trpc";
import {
  FieldDescription,
  FieldLabel,
  Field,
  FieldGroup,
  FieldSet,
  FieldContent,
  FieldTitle,
} from "~/components/ui/field";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import {
  BadgeDollarSign,
  Book,
  Droplet,
  GraduationCap,
  Info,
  MessageSquareText,
  Star,
  Tag,
  Tags,
  Trophy,
  Users,
} from "lucide-react";

export const courseFieldHelper = createColumnHelper<
  CourseDto | Course | CourseInsert
>();
export const courseDtoFieldHelper = createColumnHelper<CourseDto>();

export const courseDefs = {
  courseName: courseFieldHelper.accessor("courseName", {
    header: () => (
      <>
        <Book /> Title
      </>
    ),
    cell: ({ row, getValue }) => (
      <Link
        to={`/admin/course-details/${row.original.id}`}
        className="font-medium"
      >
        {getValue() as string}
      </Link>
    ),
    meta: {
      editor: textInputEditor(),
    },
  }),

  description: courseFieldHelper.accessor("description", {
    header: () => (
      <>
        <MessageSquareText /> Class Description
      </>
    ),
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">{String(getValue())}</div>
    ),
    meta: {
      editor: textAreaEditor(),
    },
  }),

  creditHours: courseFieldHelper.accessor("creditHours", {
    header: () => (
      <>
        <GraduationCap /> Credit Hours
      </>
    ),
    meta: {
      editor: textInputEditor({ type: "number", step: 0.1 }),
    },
  }),

  priceCents: courseFieldHelper.accessor("priceCents", {
    header: () => (
      <>
        <BadgeDollarSign /> Fee
      </>
    ),
    cell: ({ getValue }) => `$${(Number(getValue()) / 100).toFixed(2)}`,
    meta: {
      editor: priceCentsEditor(),
    },
  }),

  upcomingClasses: courseDtoFieldHelper.accessor(
    (course) => course.sessions.length,
    {
      header: "Sessions",
    },
  ),

  seats: courseFieldHelper.accessor("seats", {
    header: () => (
      <>
        <Users /> Seats
      </>
    ),
    meta: {
      editor: intInputEditor({ step: 1 }),
    },
  }),

  spots: courseFieldHelper.accessor("spotsFilled", {
    header: "Filled",
    cell: ({ renderValue, row }) => (
      <>
        {renderValue()}/{row.original.seats}
      </>
    ),
  }),

  startDate: courseDtoFieldHelper.accessor(courseStartDate, {
    header: "Start Date",
    sortingFn: "datetime",
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return null;
      return value.toLocaleDateString();
    },
  }),

  status: courseFieldHelper.accessor("status", {
    header: () => (
      <>
        <Info /> Status
      </>
    ),
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "Active", value: CourseStatus.Active },
          { label: "Canceled", value: CourseStatus.Canceled },
          { label: "Deleted", value: CourseStatus.Deleted },
        ],
      }),
    },
  }),
};

export const courseDefPresets = {
  table: [
    courseDefs.courseName,
    courseDefs.creditHours,
    courseDefs.upcomingClasses,
    courseDefs.spots,
  ],
};

export const courseRequiredFields = {
  courseName: "",
  priceCents: 0,
  creditHours: "",
  seats: 0,
} satisfies Partial<Course>;
