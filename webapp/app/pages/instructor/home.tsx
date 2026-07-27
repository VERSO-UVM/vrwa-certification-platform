import { PageHeader } from "~/components/page-header";
import type { Route } from "./+types/home"

export function meta({} : Route.MetaArgs) {
  return [{ title: "Instructor Dashboard" }];
}

export default function InstructorHome() {
  return (
    <div>
      <PageHeader>VRWA | Instructor Dashboard</PageHeader>
    </div>
  );
}
