import type { Route } from "./+types/home";
import { AdminDashboard } from "../admin/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "VRWA Training Database" },
  ];
}

export default function Home() {
  return <AdminDashboard />;
}
