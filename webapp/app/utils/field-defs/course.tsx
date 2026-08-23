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
import {
  FieldDescription,
  FieldLabel,
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldContent,
  FieldTitle,
} from "~/components/ui/field";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { checkboxSelectorColumn } from "./extra";

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
      editor: ({ value, onChange, onBlur, overrides }) => {
        const [categories, setCategories] = useState(value);
        // For labels
        const idBase = overrides.id ?? "credit_types_select_";

        const includesWater = categories.includes(CreditHourCategory.Water);
        const waterCategories = [
          { label: "Water Category 1", value: CreditHourCategory.WaterC1 },
          { label: "Water Category 2", value: CreditHourCategory.WaterC2 },
          { label: "Water Category 3", value: CreditHourCategory.WaterC3 },
          { label: "Water Distribution 1", value: CreditHourCategory.WaterD1 },
          { label: "Water Distribution 2", value: CreditHourCategory.WaterD2 },
          { label: "Water Distribution 3", value: CreditHourCategory.WaterD3 },
        ];

        const change = (checked: unknown, value: CreditHourCategory) => {
          const add = Boolean(checked) ? [value] : [];
          let newItems = [...categories.filter((x) => x !== value), ...add];
          setCategories(newItems);
          const normalized = normalizeCreditHourCategories(newItems);
          onChange(normalized);
          onBlur(normalized);
        };

        return (
          <FieldGroup className="w-full pt-3">
            <FieldSet className="gap-3">
              <FieldLabel
                htmlFor={idBase + CreditHourCategory.Water}
                className={
                  !includesWater ? "border-transparent! bg-transparent!" : ""
                }
              >
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Water</FieldTitle>
                    <FieldDescription>Water categories.</FieldDescription>
                    {waterCategories.map((cat) => (
                      <div className="flex gap-2" key={cat.value}>
                        <Checkbox
                          id={idBase + cat.value}
                          checked={categories.includes(cat.value)}
                          disabled={!includesWater}
                          onCheckedChange={(x) => change(x, cat.value)}
                        />
                        <Label htmlFor={idBase + cat.value}>{cat.label}</Label>
                      </div>
                    ))}
                  </FieldContent>
                  <Checkbox
                    checked={categories.includes(CreditHourCategory.Water)}
                    onCheckedChange={(x) => {
                      change(x, CreditHourCategory.Water);
                    }}
                    id={idBase + "water"}
                  />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor={idBase + "wastewater"}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Wastewater</FieldTitle>
                    <FieldDescription>Wastewater categories.</FieldDescription>
                  </FieldContent>
                  <Checkbox
                    checked={categories.includes(CreditHourCategory.Wastewater)}
                    onCheckedChange={(x) =>
                      change(x, CreditHourCategory.Wastewater)
                    }
                    id={idBase + "wastewater"}
                  />
                </Field>
              </FieldLabel>
            </FieldSet>
          </FieldGroup>
        );
      },
    },
  }),
};

function normalizeCreditHourCategories(categories: CreditHourCategory[]) {
  for (const category of [
    CreditHourCategory.Water,
    CreditHourCategory.Wastewater,
  ]) {
    const includes = categories.includes(category);
    if (!includes) {
      categories = categories.filter((x) => !x.startsWith(category + ":"));
    }
  }
  return categories;
}
export const courseDefPresets = {
  table: [
    courseDefs.courseName,
    courseDefs.creditHours,
    courseDefs.upcomingClasses,
    courseDefs.spots,
  ],
};
