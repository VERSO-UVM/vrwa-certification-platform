import { PageHeader } from "~/components/page-header";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Certifications" }];
}

export default function TraineeHome() {
  return (
    <div>
      <PageHeader>VRWA Certifications Platform</PageHeader>
    </div>
  );
}
