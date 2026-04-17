import { Card, CardContent, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/home";
import { Link, useNavigate } from "react-router";
import { useSession } from "~/lib/auth-client";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Training Database" }];
}

export default function Home() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const role = (session?.user as { role?: string } | undefined)?.role ?? "user";
  const activeProfileId = (
    session?.session as { activeProfileId?: string } | undefined
  )?.activeProfileId;

  useEffect(() => {
    console.log("Home useEffect:", { isPending, session: !!session, role });
    if (!isPending && session) {
      if (!activeProfileId) {
        navigate("/profile-selection");
        return;
      }
      console.log("Redirecting based on role:", role);
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/trainee");
      }
    }
  }, [session, isPending, navigate, role, activeProfileId]);

  if (isPending) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="flex items-center justify-center pt-8">
      <Card className="min-w-md">
        <CardTitle className="text-center pt-6">
          VRWA Training Database
        </CardTitle>
        <CardContent>
          <div className="flex flex-col gap-2 mt-4">
            <Link
              to="/login"
              className="block text-blue-600 underline text-center"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block text-blue-600 underline text-center"
            >
              Sign-up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
