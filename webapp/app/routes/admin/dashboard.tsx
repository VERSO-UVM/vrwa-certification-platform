import { AdminDashboard } from "~/admin/dashboard";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin Dashboard - VRWA Training Database" }];
}

export default function () {
  return <AdminDashboard />;
}
