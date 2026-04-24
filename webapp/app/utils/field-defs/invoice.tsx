import { createColumnHelper } from "@tanstack/react-table";
import type { InvoiceDto } from "@backend/database/dtos";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";

const helper = createColumnHelper<InvoiceDto>();

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

function statusVariant(
  status: string | null,
  amountDue: number,
  dueDate: number | null,
) {
  if (status === "paid") return "outline" as const;
  if (status === "void" || status === "uncollectible")
    return "secondary" as const;
  if (
    (status === "open" || status === "draft") &&
    dueDate != null &&
    amountDue > 0 &&
    dueDate * 1000 < Date.now()
  ) {
    return "destructive" as const;
  }
  return "default" as const;
}

function statusLabel(
  status: string | null,
  amountDue: number,
  dueDate: number | null,
) {
  if (!status) return "Unknown";
  if (status === "open" && amountDue > 0 && dueDate != null) {
    if (new Date(dueDate * 1000) < new Date()) return "Overdue";
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const traineeInvoiceColumnDefs = [
  helper.accessor((row) => row.courseName ?? row.id, {
    id: "course",
    header: "Description",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.courseName ?? row.original.id}
      </span>
    ),
  }),
  helper.accessor("amountDue", {
    id: "amount",
    header: "Amount",
    cell: ({ row }) =>
      formatMoney(row.original.amountDue, row.original.currency),
  }),
  helper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const s = statusLabel(
        row.original.status,
        row.original.amountDue,
        row.original.dueDate,
      );
      return (
        <Badge
          variant={statusVariant(
            row.original.status,
            row.original.amountDue,
            row.original.dueDate,
          )}
        >
          {s}
        </Badge>
      );
    },
  }),
  helper.accessor("dueDate", {
    header: "Due",
    cell: ({ getValue }) => {
      const v = getValue();
      if (v == null) return "—";
      return format(new Date(v * 1000), "PPP");
    },
  }),
  helper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const url = row.original.hostedInvoiceUrl;
      const open =
        row.original.status === "open" || row.original.status === "draft";
      const canPay = open && row.original.amountDue > 0;
      if (canPay && url) {
        return (
          <Button asChild size="sm" variant="default">
            <a href={url} target="_blank" rel="noreferrer">
              Pay now
            </a>
          </Button>
        );
      }
      if (url) {
        return (
          <Button asChild size="sm" variant="outline">
            <a href={url} target="_blank" rel="noreferrer">
              View
            </a>
          </Button>
        );
      }
      return "—";
    },
  }),
];
