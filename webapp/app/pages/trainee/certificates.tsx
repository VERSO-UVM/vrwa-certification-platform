import { PageHeader } from "~/components/page-header";
import type { Route } from "./+types/certificates";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - Completed Courses" }];
}

export default function CertificatesPage() {
  return <>
    <PageHeader>Completed Courses</PageHeader>
  </>;
}
