import { PageHeader } from "~/components/page-header";

export function meta() {
  return [{ title: "Instructor Dashboard" }];
}

export default function InstructorHome() {
  return (
    <div>
      <PageHeader>VRWA | Instructor Dashboard</PageHeader>
    </div>
  );
}
