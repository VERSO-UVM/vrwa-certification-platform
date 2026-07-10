import { CreateProfile } from "~/auth/create-profile";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Create a Profile" }];
}

export default function () {
  return <CreateProfile />;
}
