import { PageHeader } from "~/components/page-header";

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader>My Certificates</PageHeader>
      <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
        <p className="text-muted-foreground">
          Your certificates will appear here once you complete courses.
        </p>
      </div>
    </div>
  );
}
