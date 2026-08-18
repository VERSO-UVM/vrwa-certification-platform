import type { CourseDto } from "@backend/database/dtos";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { courseStartDate, dateFormat } from "../utils";

export const courseFieldHelper = createColumnHelper<CourseDto>();

export const courseDefs = {
  courseName: courseFieldHelper.accessor("courseName", {
    header: "Course",
    cell: ({ row, getValue }) => (
      <Link
        to={`/admin/course-details/${row.original.id}`}
        className="font-medium"
      >
        {getValue() as string}
      </Link>
    ),
  }),

  description: courseFieldHelper.accessor("description", {
    header: "Class Description",
    cell: ({ getValue }) => (
      <div className="text-muted-foreground">{String(getValue())}</div>
    ),
  }),

  creditHours: courseFieldHelper.accessor("creditHours", {
    header: "Credit Hours",
  }),

  priceCents: courseFieldHelper.accessor("priceCents", {
    header: "Fee",
    cell: ({ getValue }) => `$${(Number(getValue()) / 100).toFixed(2)}`,
  }),

  upcomingClasses: courseFieldHelper.accessor(
    (course) => course.sessions.length,
    {
      header: "Sessions",
    },
  ),

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
