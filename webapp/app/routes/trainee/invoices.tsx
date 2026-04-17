import { PageHeader } from "~/components/page-header";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <PageHeader>My Invoices</PageHeader>
      <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          You have no outstanding invoices.
        </p>
      </div>
    </div>
  );
}
