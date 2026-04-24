import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";

export default function CertificateViewPage() {
  const trpc = useTRPC();
  const [searchParams] = useSearchParams();
  const profileId = searchParams.get("profileId");
  const eventId = searchParams.get("eventId");

  const enabled = Boolean(profileId && eventId);
  const certificate = useQuery(
    trpc.certificateRouter.getCertificate.queryOptions(
      {
        profileId: profileId ?? "",
        courseEventId: eventId ?? "",
      },
      { enabled },
    ),
  );

  if (!enabled) {
    return (
      <div className="p-8 text-center">Missing certificate identifiers.</div>
    );
  }

  if (certificate.isLoading) {
    return <div className="p-8 text-center">Loading certificate...</div>;
  }

  if (certificate.error || !certificate.data) {
    return <div className="p-8 text-center">Certificate is unavailable.</div>;
  }

  return (
    <div className="space-y-4">
      <PageHeader>Certificate</PageHeader>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link
            to={`/trainee/certificates/download?profileId=${profileId}&eventId=${eventId}`}
          >
            Download
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/trainee/certificates">Back to Certificates</Link>
        </Button>
      </div>
      <iframe
        className="w-full min-h-[75vh] rounded-md border bg-background"
        src={`data:application/pdf;base64,${certificate.data.pdf}`}
        title="Certificate PDF"
      />
    </div>
  );
}
