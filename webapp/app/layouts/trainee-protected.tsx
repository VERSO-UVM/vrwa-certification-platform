import { Outlet } from "react-router";
import { protectedLoader } from "~/utils/session";

// Require a signed-in user for trainee pages other than public course listings
export const loader = protectedLoader("user");

export default function TraineeProtectedLayout() {
  return <Outlet />;
}
