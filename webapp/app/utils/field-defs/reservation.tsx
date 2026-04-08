import type { ReservationDto } from "@backend/database/dtos";
import { createColumnHelper } from "@tanstack/react-table";
import { selectOptionsEditor, textInputEditor } from "../field-editors";
import { Status as PaymentStatus } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";

export const reservationFieldHelper = createColumnHelper<ReservationDto>();

export const reservationDefs = {
  firstName: reservationFieldHelper.accessor("firstName", {
    header: "First Name",
    cell: ({ renderValue }) => <span className="italic">{renderValue()}</span>,
  }),
  lastName: reservationFieldHelper.accessor("lastName", {
    header: "Last Name",
    cell: ({ renderValue }) => <span className="italic">{renderValue()}</span>,
  }),
  creditHours: reservationFieldHelper.accessor("creditHours", {
    header: "Credit Hours",
    meta: {
      editor: textInputEditor({
        type: "number",
        step: 0.1,
      }),
    },
  }),
  paymentStatus: reservationFieldHelper.accessor("paymentStatus", {
    header: "Payment Status",
    cell: ({ getValue }) => {
      switch (getValue()) {
        case PaymentStatus.Paid:
          return <Badge variant="outline">Paid</Badge>;
        case PaymentStatus.Unpaid:
          return <Badge variant="default">Unpaid</Badge>;
      }
    },
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "Paid", value: PaymentStatus.Paid },
          { label: "Unpaid", value: PaymentStatus.Unpaid },
        ],
      }),
    },
  }),
  classStartDateTime: reservationFieldHelper.accessor("classStartDatetime", {
    header: "Course Date",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null) return value;
      return new Date(value).toLocaleDateString();
    },
  }),
  courseName: reservationFieldHelper.accessor("course.courseName", {
    header: "Course Name",
  }),
  isMember: reservationFieldHelper.accessor("isMember", {
    header: "Member",
    cell: ({ getValue }) => (getValue() == true ? "yes" : "no"),
  }),
};

export const reservationDefPresets = {
  all: Object.values(reservationDefs),
  basic: [
    reservationDefs.courseName,
    reservationDefs.classStartDateTime,
    reservationDefs.creditHours,
    reservationDefs.paymentStatus,
  ],
};
