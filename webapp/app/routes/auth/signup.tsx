import type { Route } from "../+types/home";
import SignupPage from "~/auth/signup";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Sign-up" },
  ];
}

export default function() {
  return <SignupPage />
}
