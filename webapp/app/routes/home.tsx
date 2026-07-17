import { Card, CardContent, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { DevLogins } from "~/auth/dev-logins";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Training Database" }];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-800/50">
      <Card variant="outline" className="min-w-md flex items-center justify-center text-lg lg:text-2xl size-1/2 lg:size-1/3">
        <CardTitle className="text-center text-gray-100">Welcome to the VRWA Training Database!</CardTitle>
        <CardContent>
          <DevLogins />
          <div className="flex justify-center">
            <Link to="/login" className="block underline p-2 dark:hover:text-gray-200">
              Log In
            </Link>
            <Link to="/signup" className="block underline p-2 dark:hover:text-gray-200">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
