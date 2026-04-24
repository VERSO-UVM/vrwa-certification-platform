import type { ColumnDef } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export type AttendanceRow = {
  profileId: string;
  courseEventId: string;
  firstName: string;
  lastName: string;
  email: string;
  paymentStatus: string;
  creditHours: string;
  attendanceMarkedAt: Date | string | null;
  defaultCreditHours: number;
  isMember?: boolean;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phoneNumber?: string;
};

const attendanceFieldHelper = createColumnHelper<AttendanceRow>();

export function makeAttendanceDefs(options: {
  onTogglePresent: (row: AttendanceRow, present: boolean) => void;
  onCreditHoursBlur: (row: AttendanceRow, value: number) => void;
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
        return (
          <Input
            type="number"
            step="0.25"
            min={0}
            defaultValue={item.creditHours}
            placeholder={String(item.defaultCreditHours)}
            className="w-28"
            onBlur={(event) => {
              const value = Number(event.target.value);
              if (!Number.isFinite(value) || value < 0) return;
              options.onCreditHoursBlur(item, value);
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
        const present = item.attendanceMarkedAt !== null;
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
  ] satisfies ColumnDef<AttendanceRow, any>[];
}
