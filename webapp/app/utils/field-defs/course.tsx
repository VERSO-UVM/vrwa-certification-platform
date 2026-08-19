import type { CourseDto } from "@backend/database/dtos";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { courseStartDate, dateFormat } from "../utils";
import { intInputEditor, textInputEditor } from "../field-editors";

export const courseFieldHelper = createColumnHelper<CourseDto>();

export const courseDefs = {
  courseName: courseFieldHelper.accessor("courseName", {
    header: "Title",
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
    header: "Class Description",
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">{String(getValue())}</div>
    ),
    meta: {
      editor: textInputEditor(),
    },
  }),

  creditHours: courseFieldHelper.accessor("creditHours", {
    header: "Credit Hours",
    meta: {
      editor: textInputEditor({ type: "number", step: 0.1 }),
    },
  }),

  priceCents: courseFieldHelper.accessor("priceCents", {
    header: "Fee",
    cell: ({ getValue }) => `$${(Number(getValue()) / 100).toFixed(2)}`,
    meta: {
      editor: intInputEditor({ step: 0.01 }),
    },
  }),

  upcomingClasses: courseFieldHelper.accessor(
    (course) => course.sessions.length,
    {
      header: "Sessions",
    },
  ),

  seats: courseFieldHelper.accessor("seats", {
    header: "Seats",
    meta: {
      editor: intInputEditor({ step: 0.01 }),
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

  startDate: courseFieldHelper.accessor(courseStartDate, {
    header: "Start Date",
    sortingFn: "datetime",
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return null;
      return value.toLocaleDateString();
    },
  }),
};

export const courseDefPresets = {
  table: [
    courseDefs.courseName,
    courseDefs.startDate,
    courseDefs.creditHours,
    courseDefs.upcomingClasses,
    courseDefs.spots,
  ],
};
