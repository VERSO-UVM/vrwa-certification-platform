import { useTRPC } from "~/utils/trpc";
import type { Route } from "./+types/view-certificate";
import { useQuery } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { SkeletonCard } from "~/components/ui/skeleton";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - View Certificate" }];
}

export default function ViewCertificate({
  params: { courseEventId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const { data: certificate } = useQuery(
    trpc.certificates.trainee.get.queryOptions({ courseEventId }),
  );
  if (!certificate) {
    return (
      <>
        <Header />
        <SkeletonCard />
      </>
    );
  }

  // Using a Data URL to embed data directly as an URL
  // https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
  // Format: data:[<media-type>][;base64],<data>
  const url = "data:application/pdf;base64," + certificate.base64;

  return (
    <>
      <Header />
      <iframe
        src={url}
        width="100%"
        height="100%"
        title="PDF Viewer"
        className="print-root min-h-[75vh]"
        style={{ border: "none" }}
      />
    </>
  );
}

function Header() {
  return (
    <div className="pb-6">
      <Button variant="ghost" asChild>
        <Link to="/trainee/certificates">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Certificates
        </Link>
      </Button>
    </div>
  );
}
