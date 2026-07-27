import { ProfileSelection } from "~/pages/auth/profile-selection";

export function meta() {
  return [{ title: "Profile Select" }];
}

export default function () {
  return <ProfileSelection />;
}
