import type { CourseEventDto } from "@backend/database/dtos";
import { CourseLocation } from "@backend/database/schema";
import { createColumnHelper } from "@tanstack/react-table";
import { Link } from "react-router";
import { LocationTypeBadge } from "~/components/location-type-badge";
import {
  dateEditor,
  intInputEditor,
  selectOptionsEditor,
  textInputEditor,
  TimeInput,
} from "../field-editors";
import { add, addMinutes, differenceInMinutes } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Label } from "~/components/ui/label";

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
          pathname: `/admin/course-details/${row.original.courseId}`,
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
    meta: {
      editor: dateEditor(),
    },
  }),

  courseLocationType: courseEventFieldHelper.accessor("locationType", {
    header: "Format",
    cell: ({ getValue }) => (
      <LocationTypeBadge value={getValue() as CourseLocation} />
    ),

    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "In-Person", value: CourseLocation.InPerson },
          { label: "Virtual", value: CourseLocation.Virtual },
          { label: "Hybrid", value: CourseLocation.Hybrid },
        ],
      }),
    },
  }),

  address: courseEventFieldHelper.accessor("physicalAddress", {
    header: "Address",
    cell: ({ row, getValue }) => (
      <div className="text-muted-foreground">
        {String(
          row.getValue("locationType") == "virtual" ? "Online" : getValue(),
        )}
      </div>
    ),

    meta: {
      editor: textInputEditor({
        required: false, // Can be empty
      }),
    },
  }),

  town: courseEventFieldHelper.accessor("town", {
    header: "Town",
    meta: {
      editor: textInputEditor({
        required: false,
      }),
    },
  }),

  venue: courseEventFieldHelper.accessor("venue", {
    header: "Venue",
    meta: {
      editor: textInputEditor({
        required: false,
      }),
    },
  }),

  seats: courseEventFieldHelper.accessor("seats", {
    header: "Seats",
    cell: ({ getValue }) => (
      <div className="text-right">{String(getValue())}</div>
    ),
  }),
  virtualLink: courseEventFieldHelper.accessor("virtualLink", {
    header: "Class Link",
    cell: ({ getValue }) => (
      <div className="text-right">{String(getValue())}</div>
    ),
    meta: {
      editor: textInputEditor(),
    },
  }),

  duration: courseEventFieldHelper.accessor("durationMinutes", {
    header: "Duration (minutes)",
    meta: {
      editor: (() => {
        const MinutesInput = intInputEditor();
        return ({ value, getRow, onChange, onBlur, overrides }) => {
          const [duration, setDuration] = useState(value);
          const startDate = getRow().classStartDatetime;
          const endDate = useMemo(
            () => (startDate ? addMinutes(startDate, duration ?? 0) : null),
            [startDate, duration],
          );

          return (
            <div className="grid grid-cols-2 gap-4">
              <MinutesInput
                value={duration}
                onChange={(newMinutes) => {
                  setDuration(newMinutes);
                }}
                onBlur={() => onBlur(duration)}
                getRow={getRow}
                overrides={overrides}
              />
              <TimeInput
                value={endDate}
                onBlur={() => onBlur(duration)}
                overrides={{}}
                getRow={() => {}}
                onChange={(newDate) => {
                  if (startDate == null) {
                    onChange(duration);
                    return;
                  }
                  if (newDate == null) {
                    setDuration(0);
                    onChange(0);
                    return;
                  }
                  const newDuration = differenceInMinutes(newDate, startDate);
                  if (newDuration >= 0) {
                    setDuration(newDuration);
                    onChange(newDuration);
                  }
                }}
              />
            </div>
          );
        };
      })(),
    },
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
