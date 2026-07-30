import { Outlet } from "react-router";

export default function Auth() {
  return (
    <main className="flex flex-col h-screen place-content-center vrwa-light:bg-gray-50 dark:bg-gray-950">
      <Outlet />
    </main>
  );
}
