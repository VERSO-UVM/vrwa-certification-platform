import type { Course } from "@backend/database/schema";
import { createColumnHelper } from "@tanstack/react-table";
import { textInputEditor } from "~/utils/field-editors";

export const courseFieldHelper = createColumnHelper<Course>();

export const courseDefs = {
  courseName: courseFieldHelper.accessor("courseName", {
    header: "Course Name",
    meta: {
      editor: textInputEditor(),
    },
  }),
  description: courseFieldHelper.accessor("description", {
    header: "Description",
    meta: {
      editor: textInputEditor(),
    },
  }),
  creditHours: courseFieldHelper.accessor("creditHours", {
    header: "Credit Hours",
  }),
  priceCents: courseFieldHelper.accessor("priceCents", {
    header: "Price",
    cell: ({ getValue }) => `$${(Number(getValue()) / 100).toFixed(2)}`,
  }),
};

export const courseDefPresets = {
  basic: [courseDefs.courseName, courseDefs.creditHours, courseDefs.priceCents],
  all: Object.values(courseDefs),
};
