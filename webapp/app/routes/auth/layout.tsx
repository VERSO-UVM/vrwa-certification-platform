import { Outlet } from "react-router";

export default function Auth() {
  return (
    <main className="flex-1 flex flex-col @container">
      <Outlet />
    </main>
  );
}
