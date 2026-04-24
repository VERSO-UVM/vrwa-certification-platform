import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useTRPC } from "~/utils/trpc";

export default function CertificateDownloadPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!enabled) {
      navigate("/trainee/certificates");
      return;
    }
    if (!certificate.data) return;

    const binary = atob(certificate.data.pdf);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = certificate.data.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    navigate(
      `/trainee/certificates/view?profileId=${profileId}&eventId=${eventId}`,
      { replace: true },
    );
  }, [certificate.data, enabled, eventId, navigate, profileId]);

  if (!enabled) return null;
  if (certificate.error) {
    return (
      <div className="p-8 text-center">Unable to download certificate.</div>
    );
  }
  return (
    <div className="p-8 text-center">
      Preparing your certificate download...
    </div>
  );
}
