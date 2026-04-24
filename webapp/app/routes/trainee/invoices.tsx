import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { PageHeader } from "~/components/page-header";
import { DataTable } from "~/components/data-table";
import { useTRPC } from "~/utils/trpc";
import { traineeInvoiceColumnDefs } from "~/utils/field-defs/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function InvoicesPage() {
  const trpc = useTRPC();
  const {
    data: invoices,
    isLoading,
    isError,
    error,
  } = useQuery(trpc.invoice.getMyInvoices.queryOptions());

  if (isLoading) {
    return <div className="p-10 text-muted-foreground">Loading invoices…</div>;
  }
  if (isError) {
    return (
      <div className="p-6 text-destructive">
        {error?.message ?? "Failed to load invoices. Check billing settings."}
      </div>
    );
  }

  const list = invoices ?? [];
  const outstanding = list.filter(
    (i) => (i.status === "open" || i.status === "draft") && i.amountDue > 0,
  );
  const totalDueCents = outstanding.reduce((s, i) => s + i.amountDue, 0);
  const displayCurrency = list[0]?.currency ?? "usd";

  return (
    <div className="space-y-6">
      <PageHeader>My Invoices</PageHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">
              Outstanding balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: displayCurrency,
              }).format(totalDueCents / 100)}
            </p>
            <p className="text-sm text-muted-foreground">
              {outstanding.length} unpaid invoice
              {outstanding.length === 1 ? "" : "s"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Pay online</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Use the Pay now button for any open invoice to open Stripe&apos;s
              secure payment page in a new tab.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/trainee/signup">Browse courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {list.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">You have no invoices yet.</p>
          <Button asChild className="mt-4" variant="link">
            <Link to="/trainee/signup">Sign up for a course</Link>
          </Button>
        </div>
      ) : (
        <DataTable data={list} columns={traineeInvoiceColumnDefs} />
      )}
    </div>
  );
}
