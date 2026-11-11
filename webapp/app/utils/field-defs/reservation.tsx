import type { ReservationDto } from "@backend/database/dtos";
import { createColumnHelper } from "@tanstack/react-table";
import { selectOptionsEditor, textInputEditor } from "../field-editors";
import {
  PaymentStatus,
  ReservationStatus,
  type Reservation,
} from "@backend/database/schema";
import { PaymentStatusBadge } from "~/components/payment-status-badge";
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
  email: reservationFieldHelper.accessor("email", {
    header: "Email",
    cell: ({ renderValue }) => (
      <span className="tracking-tight">{renderValue()}</span>
    ),
  }),
  reservationStatus: reservationFieldHelper.accessor("reservationStatus", {
    header: "Status",
    cell: ({ getValue }) => {
      switch (getValue()) {
        case ReservationStatus.Accepted:
          return <Badge variant="green">Accepted</Badge>;
        case ReservationStatus.Waitlisted:
          return <Badge variant="blue">Waitlisted</Badge>;
        case ReservationStatus.Declined:
          return <Badge variant="orange">Declined</Badge>;
      }
    },
    meta: {
      editor: selectOptionsEditor<ReservationStatus>({
        options: [
          { label: "Accepted", value: ReservationStatus.Accepted },
          { label: "Waitlisted", value: ReservationStatus.Waitlisted },
          { label: "Declined", value: ReservationStatus.Declined },
        ],
      }),
    },
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
  courseCreditHours: reservationFieldHelper.accessor("course.creditHours", {
    header: "Course Credit Hours",
  }),
  paymentStatus: reservationFieldHelper.accessor("paymentStatus", {
    header: "Payment",
    cell: ({ getValue }) => <PaymentStatusBadge value={getValue()} />,
    meta: {
      editor: selectOptionsEditor<PaymentStatus>({
        options: [
          { label: "Draft", value: PaymentStatus.Draft },
          { label: "Open", value: PaymentStatus.Open },
          { label: "Paid", value: PaymentStatus.Paid },
          { label: "Refunded", value: PaymentStatus.Refunded },
          { label: "Void", value: PaymentStatus.Void },
          { label: "Uncollectible", value: PaymentStatus.Uncollectible },
        ],
      }),
    },
  }),
  stripeInvoiceId: reservationFieldHelper.accessor("stripeInvoiceId", {
    header: "Invoice",
    cell: ({ renderValue }) => (
      <span className="tracking-tight font-mono text-xs">{renderValue()}</span>
    ),
  }),
  createdAt: reservationFieldHelper.accessor("createdAt", {
    header: "Registered",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
  }),
  statusUpdatedAt: reservationFieldHelper.accessor("statusUpdatedAt", {
    header: "Status Updated",
    cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
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

export const reservationRequiredFields = {
  creditHours: "",
} satisfies Partial<Reservation>;

export const reservationDefPresets = {
  all: Object.values(reservationDefs),
  basic: [
    reservationDefs.courseName,
    reservationDefs.classStartDateTime,
    reservationDefs.reservationStatus,
    reservationDefs.creditHours,
    reservationDefs.paymentStatus,
  ],
  editor: {
    columns: [reservationDefs.creditHours, reservationDefs.paymentStatus],
    required: reservationRequiredFields,
  },
};
