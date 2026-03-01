import { InstructorHome } from "~/instructor/home";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Instructor Dashboard" }];
}

export default function () {
  return <InstructorHome />;
}
