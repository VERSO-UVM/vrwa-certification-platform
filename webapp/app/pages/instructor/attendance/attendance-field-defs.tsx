/**
 * Field defs for attendance data table. Extended version of utils/field-defs/reservation.tsx.
 */
import type { ReservationDto } from "@backend/database/dtos";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { useCreditHoursUpdate } from "./use-update-credit-hours-mutation";
import {
  reservationDefs,
  reservationFieldHelper,
} from "~/utils/field-defs/reservation";

export const attendanceFieldDefs = [
  reservationDefs.firstName,
  reservationDefs.lastName,
  reservationDefs.email,
  reservationDefs.paymentStatus,
  reservationFieldHelper.accessor(
    ({ creditHours }) => Number(creditHours) !== 0,
    {
      id: "present",
      header: "Present?",
      cell: ({ row, getValue: isPresent }) => {
        const item = row.original;
        const creditHoursUpdate = useCreditHoursUpdate(item.courseId);
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={isPresent()}
              onCheckedChange={(checked) =>
                creditHoursUpdate.mutate({
                  courseId: item.courseId,
                  profileId: item.profileId,
                  creditHours: checked ? item.course.creditHours : "0",
                })
              }
              id={`present-${item.profileId}`}
            />
            <Label htmlFor={`present-${item.profileId}`}>Present</Label>
          </div>
        );
      },
    },
  ),
  reservationFieldHelper.display({
    id: "creditHours",
    header: "Earned Hours",
    cell: ({ row }) => {
      const item = row.original;
      return <CreditHoursInput item={item} />;
    },
  }),
] satisfies ColumnDef<ReservationDto, any>[];

const CreditHoursInput = ({ item }: { item: ReservationDto }) => {
  const [creditHours, setCreditHours] = useState(item.creditHours);

  const [prevCreditHours, setPrevCreditHours] = useState(item.creditHours);
  if (prevCreditHours !== item.creditHours) {
    setPrevCreditHours(item.creditHours);
    setCreditHours(item.creditHours);
  }

  const creditHoursUpdate = useCreditHoursUpdate(item.courseId);
  return (
    <Input
      type="number"
      step={0.25}
      min={0}
      value={creditHours}
      placeholder={item.course.creditHours}
      className="w-28 focus:invalid:ring-pink-400"
      onBlur={(event) => {
        /* Don't let us hang on an invalid value */
        if (isNaN(event.target.valueAsNumber)) {
          setCreditHours(item.creditHours);
        }
      }}
      onChange={(event) => {
        setCreditHours(event.target.value);
        const number = event.target.valueAsNumber;
        if (!Number.isFinite(number) || number < 0) return;
        creditHoursUpdate.mutate({
          courseId: item.courseId,
          profileId: item.profileId,
          creditHours: number.toString(),
        });
      }}
    />
  );
};
