import { PageHeader } from "~/components/page-header";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
import { useSuspenseQueries } from "@tanstack/react-query";
import type { Route } from "./+types/home";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DataTable } from "~/components/data-table";
import { reservationDefPresets } from "~/utils/field-defs/reservation";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Certifications" }];
}

function queries(trpc: TRPC) {
  return [
    trpc.profiles.getActiveProfile.queryOptions(),
    trpc.reservations.trainee.listUpcoming.queryOptions(),
  ] as const;
}

/* Prefetch all queries during SSR. */
export const loader = prefetchLoader(queries);
/* Skip loader on client-side navigations */
export const clientLoader = () => {};

export default function TraineeHome() {
  const [{ data: activeProfile }, { data: reservations }] = useSuspenseQueries({
    queries: queries(useTRPC()),
  });
  const profileName =
    (activeProfile?.firstName ?? "") + " " + (activeProfile?.lastName ?? "");

  return (
    <div className="flex-1">
      <PageHeader>Hello, {profileName}!</PageHeader>
      <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
        <Card className="@xl:col-span-4" variant="green">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>
              See all upcoming classes you are registered for here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={reservationDefPresets.basic}
              data={reservations}
              table={{ enableRowSelection: false }}
            />
          </CardContent>
        </Card>
        <Card className="space-y-4 @xl:col-span-4" variant="blue">
          <CardHeader>
            <CardTitle>Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            [Add a DataTable for the unpaid invoices for a specific user here -
            need to wait until after we set up the payment system]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
