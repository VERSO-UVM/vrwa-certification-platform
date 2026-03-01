import { UserHome } from "~/trainee/home";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Certifications" }];
}

export default function () {
  return <UserHome />;
}
