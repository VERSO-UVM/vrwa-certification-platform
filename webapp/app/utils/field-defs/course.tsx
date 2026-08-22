import type { CourseDto } from "@backend/database/dtos";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";
import { courseStartDate } from "../utils";
import {
  intInputEditor,
  multiSelectCheckboxEditor,
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
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useTRPC } from "../trpc";

export const courseFieldHelper = createColumnHelper<
  CourseDto | Course | CourseInsert
>();
export const courseDtoFieldHelper = createColumnHelper<CourseDto>();

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
      editor: textAreaEditor(),
    },
  }),

  creditHours: courseFieldHelper.accessor("creditHours", {
    header: "Credit Hours",
    meta: {
      editor: textInputEditor({ type: "number", step: 0.1 }),
    },
  }),

  priceCents: courseFieldHelper.accessor("priceCents", {
    header: "Fee ($)",
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
    header: "Seats",
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
    header: "Status",
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

  tags: courseFieldHelper.accessor("tags", {
    header: "Tags",
    meta: {
      editor: (() => {
        return (props) => {
          const trpc = useTRPC();
          const optionsQuery = useQuery(
            trpc.courses.admin.listTags.queryOptions(),
          );
          return (
            <MultiComboboxEditor
              {...props}
              value={props.value ?? []}
              options={optionsQuery?.data ?? []}
            />
          );
        };
      })(),
    },
  }),

  creditCategories: courseFieldHelper.accessor("creditHourCategories", {
    header: "Credit Types",
    meta: {
      editor: multiSelectCheckboxEditor({
        options: [
          { label: "Water", value: CreditHourCategory.Water },
          { label: "Water Category 1", value: CreditHourCategory.WaterC1, fieldProps: { className: "pl-4"} },
          { label: "Water Category 2", value: CreditHourCategory.WaterC2, fieldProps: { className: "pl-4"} },
          { label: "Water Category 3", value: CreditHourCategory.WaterC3, fieldProps: { className: "pl-4"} },
          { label: "Water Distribution 1", value: CreditHourCategory.WaterD1, fieldProps: { className: "pl-4"} },
          { label: "Water Distribution 2", value: CreditHourCategory.WaterD2, fieldProps: { className: "pl-4"} },
          { label: "Water Distribution 3", value: CreditHourCategory.WaterD3, fieldProps: { className: "pl-4"} },
          { label: "Wastewater", value: CreditHourCategory.Wastewater },
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
