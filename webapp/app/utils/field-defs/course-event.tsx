import type { CourseEventDto } from "@backend/database/dtos";
import { course, type CourseLocation } from "@backend/database/schema";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router";
import { LocationTypeBadge } from "~/components/location-type-badge";

export const courseEventFieldHelper = createColumnHelper<CourseEventDto>();

export const courseEventDefs = {
  courseName: courseEventFieldHelper.accessor("courseName", {
    header: "Name",
  }),
  courseNameLink: courseEventFieldHelper.accessor("courseName", {
    header: "Name",
    cell: ({ row, getValue }) => (
      <Link
        to={{
          pathname: "/admin/course-manager",
          search: `?class=${row.original.id}`,
        }}
        className="font-medium hover:underline"
      >
        {getValue() as string}
      </Link>
    ),
  }),
  courseDate: courseEventFieldHelper.accessor("classStartDatetime", {
    header: "Date",
    cell: ({ getValue }) => {
      const value = getValue();
      if (!value) return null;
      return new Date(value).toLocaleDateString();
    },
  }),
  courseLocationType: {
    accessorKey: "locationType",
    header: "Format",
    cell: ({ getValue }) => (
      <LocationTypeBadge value={getValue() as CourseLocation} />
    ),
  } satisfies ColumnDef<CourseEventDto, CourseLocation>,
  address: courseEventFieldHelper.accessor("physicalAddress", {
    header: "Location",
    cell: ({ row, getValue }) => (
      <div className="text-muted-foreground">
        {String(
          row.getValue("locationType") == "virtual" ? "Online" : getValue(),
        )}
      </div>
    ),
  }),
  seats: courseEventFieldHelper.accessor("seats", {
    header: "Seats",
    cell: ({ getValue }) => (
      <div className="text-right">{String(getValue())}</div>
    ),
  }),
} as const;

export const courseEventDefPresets = {
  default: [
    courseEventDefs.courseNameLink,
    courseEventDefs.courseDate,
    courseEventDefs.courseLocationType,
    courseEventDefs.address,
    courseEventDefs.seats,
  ],
};
