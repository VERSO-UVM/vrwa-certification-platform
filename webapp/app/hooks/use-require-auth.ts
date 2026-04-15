import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useSession } from "~/lib/auth-client";

export function useRequireAuth(allowedRoles?: string[]) {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/login");
    }

    if (!isPending && session && allowedRoles) {
      const userRole = (session.user.role || "user") as string;
      
      // Admin can access everything
      if (userRole === "admin") return;

      // Check if the current role is allowed
      const isAllowed = allowedRoles.includes(userRole);

      // Special case: Instructor can access "user" (trainee) view
      const isInstructorAccessingTrainee = userRole === "instructor" && allowedRoles.includes("user");

      if (!isAllowed && !isInstructorAccessingTrainee) {
        // Redirect to their own dashboard if they are trying to access something they shouldn't
        if (userRole === "instructor") {
          navigate("/instructor");
        } else {
          navigate("/trainee");
        }
      }
    }
  }, [session, isPending, allowedRoles, navigate]);

  return { session, isPending };
}
