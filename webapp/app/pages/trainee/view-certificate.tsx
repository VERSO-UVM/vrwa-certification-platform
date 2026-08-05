import { useTRPC } from "~/utils/trpc";
import type { Route } from "./+types/view-certificate";
import { useQuery } from "@tanstack/react-query";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - View Certificate" }];
}

export default function ViewCertificate({ params }: Route.ComponentProps) {
  const trpc = useTRPC();
  const certificateQuery = useQuery(
    trpc.certificates.trainee.get.queryOptions({
      courseEventId: params.courseEventId,
    }),
  );

  if (!certificateQuery.data) return <></>;

  // const blobUrl = URL.createObjectURL(certificateQuery.data.blob);

  return (
    <div style={{ width: "100%", height: "700px" }}>
      <iframe
        src={`data:application/pdf;base64,${certificateQuery.data.base64}`}
        width="100%"
        className="print-root"
        height="100%"
        title="PDF Viewer"
        style={{ border: "none" }}
      />
    </div>
  );
}
