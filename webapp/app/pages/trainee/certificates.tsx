import { PageHeader } from "~/components/page-header";
import type { Route } from "./+types/certificates";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/data-table";
import {
  reservationDefs,
  reservationFieldHelper,
} from "~/utils/field-defs/reservation";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - Completed Courses" }];
}

const columnDefs = [
  reservationFieldHelper.accessor("course.courseName", {
    header: "Course Name",
    cell: ({ renderValue }) => (
      <div className="font-medium">{renderValue()}</div>
    ),
  }),
  reservationDefs.classStartDateTime,
  reservationFieldHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Button variant="outline" className="my-4 py-4" asChild>
          <Link to={`${row.original.courseId}`}>View Certificate</Link>
        </Button>
      );
    },
  }),
];

function queries(trpc: TRPC) {
  return [trpc.reservations.trainee.listCompleted.queryOptions()] as const;
}

/* Prefetch all queries during SSR. */
export const loader = prefetchLoader(queries);
/* Skip loader on client-side navigations */
export const clientLoader = () => {};

export default function CertificatesPage() {
  const [{ data: reservations }] = useSuspenseQueries({
    queries: queries(useTRPC()),
  });

  return (
    <>
      <PageHeader>Completed Courses</PageHeader>
      <Card variant="green">
        <CardHeader>
          <CardTitle>Your Certificates</CardTitle>
          <CardDescription>
            View certificates from your completed classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columnDefs} data={reservations}></DataTable>
        </CardContent>
      </Card>
    </>
  );
}
