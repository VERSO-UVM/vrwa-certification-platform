import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";

export function Welcome() {
  const trpc = useTRPC();
  const profiles = useQuery(trpc.getProfiles.queryOptions())
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <Card className="min-w-md">
        <CardTitle className="text-center">Welcome</CardTitle>
        <CardHeader>This is temporary!</CardHeader>
        <CardContent>
          <div>
            <a href="/login">Log in...</a>
          </div>
          <div>
            <a href="/signup">Sign up...</a>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-md">
        <CardTitle className="text-center">Profiles</CardTitle>
        <CardContent>
        {
          profiles.data?.map(profile => <li>
            {profile.firstName} {profile.lastName}
          </li>)
        }
        </CardContent>
      </Card>
    </main>
  );
}
