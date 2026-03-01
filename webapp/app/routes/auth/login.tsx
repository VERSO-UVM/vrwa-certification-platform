import LoginPage from "~/auth/login";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login" },
  ];
}

export default function () {
  return <LoginPage />
}
