import type { ReservationDto } from "@backend/database/dtos";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

const attendanceFieldHelper = createColumnHelper<ReservationDto>();

export function makeAttendanceDefs(options: {
  onTogglePresent: (row: ReservationDto, present: boolean) => void;
  onSetCreditHours: (row: ReservationDto, value: number) => void;
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
      id: "present",
      header: "Present?",
      cell: ({ row }) => {
        const item = row.original;
        const present = Number(item.creditHours) !== 0;
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={present}
              onCheckedChange={(checked) =>
                options.onTogglePresent(item, checked)
              }
              id="is-present"
            />
            <Label htmlFor="is-present">Present</Label>
          </div>
        );
      },
    }),
    attendanceFieldHelper.display({
      id: "creditHours",
      header: "Earned Hours",
      cell: ({ row }) => {
        const item = row.original;
        const [creditHours, setCreditHours] = useState(item.creditHours);
        // Sync actual credit hours with input
        useEffect(() => setCreditHours(item.creditHours), [item.creditHours]);
        return (
          <Input
            type="number"
            step={0.25}
            min={0}
            value={creditHours}
            placeholder={String(item.course.creditHours)}
            className="w-28"
            onChange={(event) => {
              setCreditHours(event.target.value);
              const number = event.target.valueAsNumber;
              if (!Number.isFinite(number) || number < 0) return;
              options.onSetCreditHours(item, number);
            }}
          />
        );
      },
    }),
  ] satisfies ColumnDef<ReservationDto, any>[];
}
