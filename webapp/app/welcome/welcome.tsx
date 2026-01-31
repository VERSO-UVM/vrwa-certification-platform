import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useTRPC } from "~/utils/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "app/components/ui/card";
import type { Profile } from "../../../backend/src/database/schema";
import { DataTable } from "~/components/ui/data-table";


const columns: ColumnDef<Profile>[] = [
  {
    accessorKey: "accountId",
    header: "Account ID",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
]

export function Welcome() {
  const trpc = useTRPC();
  const profiles = useQuery(trpc.getProfiles.queryOptions());
  
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
          <DataTable columns={columns} data={profiles.data ?? []} />
        </CardContent>
      </Card>
    </main>
  );
}
