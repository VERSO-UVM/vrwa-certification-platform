import { ProfileSelection } from "~/auth/profile-selection";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profile Select" }];
}

export default function () {
  return <ProfileSelection />;
}
