import { UserManager } from "~/admin/user-manager";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "User Manager - VRWA Training Database" }];
}

export default function () {
  return <UserManager />;
}
