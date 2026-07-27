import LoginPage from "~/pages/auth/login";

export function meta() {
  return [{ title: "Login" }];
}

export default function () {
  return <LoginPage />;
}
