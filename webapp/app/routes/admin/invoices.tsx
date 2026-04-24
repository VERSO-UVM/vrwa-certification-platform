import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type { InvoiceDto } from "@backend/database/dtos";
import { PageHeader } from "~/components/page-header";
import { DataTable } from "~/components/data-table";
import { useTRPC } from "~/utils/trpc";
import { adminInvoiceColumnDefs } from "~/utils/field-defs/admin-invoice";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ExternalLink } from "lucide-react";

const pk = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined;
const stripeTestMode = !pk || pk.startsWith("pk_test");

function dashboardInvoiceUrl(invoiceId: string) {
  const base = stripeTestMode
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
  return `${base}/invoices/${invoiceId}`;
}

export function meta() {
  return [{ title: "Invoices - VRWA Training" }];
}

function InvoiceRowActions({ row }: { row: { original: InvoiceDto } }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const inv = row.original;
  const [open, setOpen] = useState(false);
  const [checkMemo, setCheckMemo] = useState("Paid by check");
  const [refundReason, setRefundReason] = useState("");

  const onSuccess = () => {
    toast.success("Updated.");
    setOpen(false);
    void queryClient.invalidateQueries(trpc.invoice.listInvoices.queryFilter());
  };

  const markCheck = useMutation(
    trpc.invoice.markPaidByCheck.mutationOptions({
      onSuccess,
      onError: (e) => toast.error(e.message),
    }),
  );
  const waive = useMutation(
    trpc.invoice.waiveInvoice.mutationOptions({
      onSuccess,
      onError: (e) => toast.error(e.message),
    }),
  );
  const refund = useMutation(
    trpc.invoice.refundInvoice.mutationOptions({
      onSuccess,
      onError: (e) => toast.error(e.message),
    }),
  );
  const uncollect = useMutation(
    trpc.invoice.markUncollectible.mutationOptions({
      onSuccess,
      onError: (e) => toast.error(e.message),
    }),
  );
  const voidInv = useMutation(
    trpc.invoice.voidInvoice.mutationOptions({
      onSuccess,
      onError: (e) => toast.error(e.message),
    }),
  );

  const s = inv.status;
  const canPayByCheck = s === "open" || s === "draft";
  const canWaive = canPayByCheck;
  const canVoid = s === "open" || s === "draft";
  const canUncollect = s === "open";
  const canRefund = s === "paid";

  const busy =
    markCheck.isPending ||
    waive.isPending ||
    refund.isPending ||
    uncollect.isPending ||
    voidInv.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Actions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invoice {inv.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <a
            href={dashboardInvoiceUrl(inv.id)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary inline-flex items-center gap-1"
          >
            Open in Stripe <ExternalLink className="size-3" />
          </a>
          {canPayByCheck && (
            <div className="space-y-1">
              <Label htmlFor={`memo-${inv.id}`}>Memo (check payment)</Label>
              <Textarea
                id={`memo-${inv.id}`}
                value={checkMemo}
                onChange={(e) => setCheckMemo(e.target.value)}
                rows={2}
              />
              <Button
                size="sm"
                disabled={busy}
                onClick={() =>
                  markCheck.mutate({ invoiceId: inv.id, memo: checkMemo })
                }
              >
                Mark paid (check)
              </Button>
            </div>
          )}
          {canWaive && (
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => waive.mutate({ invoiceId: inv.id })}
            >
              Waive
            </Button>
          )}
          {canRefund && (
            <div className="space-y-1">
              <Label htmlFor={`refund-${inv.id}`}>
                Refund (optional note in metadata)
              </Label>
              <Textarea
                id={`refund-${inv.id}`}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={2}
                placeholder="Reason"
              />
              <Button
                size="sm"
                variant="destructive"
                disabled={busy}
                onClick={() =>
                  refund.mutate({
                    invoiceId: inv.id,
                    reason: refundReason || undefined,
                  })
                }
              >
                Refund
              </Button>
            </div>
          )}
          {canUncollect && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => uncollect.mutate({ invoiceId: inv.id })}
            >
              Mark uncollectible
            </Button>
          )}
          {canVoid && (
            <Button
              size="sm"
              variant="destructive"
              disabled={busy}
              onClick={() => voidInv.mutate({ invoiceId: inv.id })}
            >
              Void
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminInvoicesPage() {
  const trpc = useTRPC();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [status, setStatus] = useState<
    "all" | "draft" | "open" | "paid" | "void" | "uncollectible"
  >("all");

  const { data, isLoading, isError, error } = useQuery(
    trpc.invoice.listInvoices.queryOptions({ year, month, status }),
  );

  const columns: ColumnDef<InvoiceDto, any>[] = useMemo(
    () => [
      ...adminInvoiceColumnDefs,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => <InvoiceRowActions row={row} />,
      } as ColumnDef<InvoiceDto, any>,
    ],
    [],
  );

  const years = useMemo(() => {
    const y = now.getFullYear();
    return [y - 1, y, y + 1];
  }, [now]);

  return (
    <div className="space-y-6">
      <PageHeader>Invoice management</PageHeader>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Year</p>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Month</p>
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {new Date(2000, m - 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as typeof status)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="void">Void</SelectItem>
              <SelectItem value="uncollectible">Uncollectible</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {isLoading && <div className="p-4 text-muted-foreground">Loading…</div>}
      {isError && (
        <div className="p-4 text-destructive border border-destructive/30 rounded-md">
          {error?.message ?? "Failed to load invoices. Is Stripe configured?"}
        </div>
      )}
      {!isLoading && !isError && (
        <DataTable data={data ?? []} columns={columns} />
      )}
    </div>
  );
}
