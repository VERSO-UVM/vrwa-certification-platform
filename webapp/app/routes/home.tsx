import { Card, CardContent, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "VRWA Training Database" }];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-8">
      <Card className="min-w-md">
        <CardTitle className="text-center">VRWA Training Database</CardTitle>
        <CardContent>
          <Link to="/login" className="block underline p-2">
            Login
          </Link>
          <Link to="/signup" className="block underline p-2">
            Sign-up
          </Link>
          <Link to="/admin" className="block underline p-2">
            DEV - admin dashboard
          </Link>
          <Link to="/trainee" className="block underline p-2">
            DEV - trainee home
          </Link>
          <Link to="/instructor" className="block underline p-2">
            DEV - instructor dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
