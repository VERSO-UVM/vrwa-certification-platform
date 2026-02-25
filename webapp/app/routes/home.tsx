import { Card, CardContent, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Training Database" }];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-8">
      <Card className="min-w-md">
        <CardTitle className="text-center">VRWA Training Database</CardTitle>
        <CardContent>
          <a href="/login" className="block underline p-2">
            Log-in
          </a>
          <a href="/signup" className="block underline p-2">
            Sign up
          </a>
          <a href="/admin" className="block underline p-2">
            DEV - admin dashboard
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
