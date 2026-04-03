import type { ReservationDto } from "@backend/database/dtos";
import { createColumnHelper } from "@tanstack/react-table";
import { selectOptionsEditor, textInputEditor } from "../column-editors";
import { Status as PaymentStatus } from "@backend/database/schema";

export const reservationColumnHelper = createColumnHelper<ReservationDto>();

export const reservationColumnDefs = {
  firstName: reservationColumnHelper.accessor("firstName", {
    header: "First Name",
  }),
  lastName: reservationColumnHelper.accessor("lastName", {
    header: "Last Name",
  }),
  creditHours: reservationColumnHelper.accessor("creditHours", {
    header: "Credit Hours",
    meta: {
      editor: textInputEditor({
        type: "number",
        step: 0.1,
      }),
    },
  }),
  paymentStatus: reservationColumnHelper.accessor("paymentStatus", {
    header: "Payment Status",
    meta: {
      editor: selectOptionsEditor({
        options: [
          { label: "Paid", value: PaymentStatus.Paid },
          { label: "Unpaid", value: PaymentStatus.Unpaid },
        ],
      }),
    },
  }),
  classStartDateTime: reservationColumnHelper.accessor("classStartDatetime", {
    header: "Course Date",
    cell: ({ getValue }) => {
      const value = getValue();
      if (value == null) return value;
      return new Date(value).toLocaleDateString();
    },
  }),
  courseName: reservationColumnHelper.accessor("course.courseName", {
    header: "Course Name",
  }),
  isMember: reservationColumnHelper.accessor("isMember", {
    header: "Member",
    cell: ({ getValue }) => (getValue() == true ? "yes" : "no"),
  }),
};

export const reservationColumnPresets = {
  all: Object.values(reservationColumnDefs),
  basic: [
    reservationColumnDefs.courseName,
    reservationColumnDefs.classStartDateTime,
    reservationColumnDefs.creditHours,
    reservationColumnDefs.paymentStatus,
  ],
};
