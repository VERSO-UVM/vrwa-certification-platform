import { UserManager } from "~/admin/user-manager";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin - Instructor Manager" }];
}

export default function () {
  return <UserManager />;
}
