import { createColumnHelper } from "@tanstack/react-table";
import type { InvoiceDto } from "@backend/database/dtos";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";

const helper = createColumnHelper<InvoiceDto>();

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

const formatMoney = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100,
  );

export const adminInvoiceColumnDefs = [
  helper.accessor("id", {
    header: "Invoice",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      return <span className="font-mono text-xs">{v.slice(0, 20)}…</span>;
    },
  }),
  helper.accessor("customerName", {
    header: "Customer",
    cell: ({ row }) => (
      <span>
        {row.original.customerName ?? "—"}{" "}
        {row.original.customerEmail ? (
          <span className="text-muted-foreground text-xs block">
            {row.original.customerEmail}
          </span>
        ) : null}
      </span>
    ),
  }),
  helper.accessor((row) => row.courseName ?? "—", {
    id: "course",
    header: "Course",
    cell: ({ getValue }) => getValue(),
  }),
  helper.accessor("amountDue", {
    id: "amount",
    header: "Due",
    cell: ({ row }) =>
      formatMoney(row.original.amountDue, row.original.currency),
  }),
  helper.accessor("status", {
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={statusVariant(
          row.original.status,
          row.original.amountDue,
          row.original.dueDate,
        )}
      >
        {statusLabel(
          row.original.status,
          row.original.amountDue,
          row.original.dueDate,
        )}
      </Badge>
    ),
  }),
  helper.accessor("dueDate", {
    header: "Due date",
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      if (v == null) return "—";
      return format(new Date(v * 1000), "PPP");
    },
  }),
  helper.accessor("created", {
    header: "Created",
    cell: ({ getValue }) =>
      format(new Date((getValue() as number) * 1000), "PPP"),
  }),
];
