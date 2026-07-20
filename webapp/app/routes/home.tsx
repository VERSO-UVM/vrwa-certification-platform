import { Card, CardContent, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/home";
import { Link } from "react-router";
import { DevLogins } from "~/auth/dev-logins";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Training Database" }];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center h-screen vrwa-light:bg-gray-50 dark:bg-gray-950">
      <Card className="min-w-md flex items-center justify-center text-lg lg:text-xl size-1/2 xl:size-1/3">
        <CardTitle className="text-center vrwa-light:text-gray-950 dark:text-gray-100">Welcome to the VRWA Training Database!</CardTitle>
        <CardContent>
          <DevLogins />
          <div className="flex justify-center">
            <Link to="/login" className="block p-2 hover:underline vrwa-light:hover:text-gray-950 dark:hover:text-gray-200">
              Log In
            </Link>
            <Link to="/signup" className="block p-2 hover:underline vrwa-light:hover:text-gray-950 dark:hover:text-gray-200">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
