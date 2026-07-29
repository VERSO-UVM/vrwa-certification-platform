import type { ReservationDto } from "@backend/database/dtos";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const attendanceFieldHelper = createColumnHelper<ReservationDto>();

export function makeAttendanceDefs(options: {
  onTogglePresent: (row: ReservationDto, present: boolean) => void;
  onCreditHoursBlur: (row: ReservationDto, value: number) => void;
}) {
  return [
    attendanceFieldHelper.accessor("firstName", { header: "First Name" }),
    attendanceFieldHelper.accessor("lastName", { header: "Last Name" }),
    attendanceFieldHelper.accessor("email", { header: "Email" }),
    attendanceFieldHelper.accessor("paymentStatus", {
      header: "Payment",
      cell: ({ getValue }) => {
        const v = getValue();
        if (v === "paid") return "Paid";
        if (v === "unpaid") return "Unpaid";
        return v;
      },
    }),
    attendanceFieldHelper.display({
      id: "creditHours",
      header: "Earned Hours",
      cell: ({ row }) => {
        const item = row.original;
        const [creditHours, setCreditHours] = useState(item.creditHours.toString());
        useEffect(() => setCreditHours(item.creditHours), [item.creditHours]);
        return (
          <Input
            type="number"
            step="0.25"
            min={0}
            value={creditHours}
            placeholder={String(item.course.creditHours)}
            className="w-28"
            onChange={(event) => {
              setCreditHours(event.target.value);
              const number = event.target.valueAsNumber;
              if (!Number.isFinite(number) || number < 0) return;
              options.onCreditHoursBlur(item, number);
            }}
          />
        );
      },
    }),
    attendanceFieldHelper.display({
      id: "present",
      header: "Present?",
      cell: ({ row }) => {
        const item = row.original;
        const present = Number(item.creditHours) !== 0;
        return (
          <Button
            type="button"
            variant={present ? "default" : "outline"}
            size="sm"
            onClick={() => options.onTogglePresent(item, !present)}
          >
            {present ? "Present" : "Absent"}
          </Button>
        );
      },
    }),
  ] satisfies ColumnDef<ReservationDto, any>[];
}
