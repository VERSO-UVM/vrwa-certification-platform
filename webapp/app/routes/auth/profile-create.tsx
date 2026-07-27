import { CreateProfile } from "~/pages/auth/create-profile";

export function meta() {
  return [{ title: "Create a Profile" }];
}

export default function () {
  return <CreateProfile />;
}
