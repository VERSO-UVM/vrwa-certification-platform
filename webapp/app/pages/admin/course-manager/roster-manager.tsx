import { PaymentStatus } from "@backend/database/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { profileDefs, profileFieldHelper } from "~/utils/field-defs/profile";
import {
  reservationDefs,
  reservationFieldHelper,
} from "~/utils/field-defs/reservation";
import { useTRPC, useTRPCClient } from "~/utils/trpc";
import { useReservationDeleteMutation } from "./use-reservation-delete-mutation";
import { useReservationCreateMutation } from "./use-reservation-create-mutation";

export function RosterManager({ courseId }: { courseId: string }) {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const trainees = useQuery(trpc.profiles.admin.listTrainees.queryOptions());
  const { data: course } = useQuery(
    trpc.courses.admin.get.queryOptions({ id: courseId }),
  );
  const reservations = useQuery(
    trpc.reservations.admin.listCourse.queryOptions({
      courseId,
    }),
  );
  const reservationCreateMutation = useReservationCreateMutation();
  const reservationDeleteMutation = useReservationDeleteMutation();

  const roster = reservations.data ?? [];
  const rosterIds = new Set(roster.map((r) => r.profileId));

  const seats = course?.seats ?? 0;
  const classFull = roster.length >= seats;

  const enroll = async (profileId: string) => {
    await reservationCreateMutation.mutateAsync({
      profileId: profileId,
      courseId: courseId,
      creditHours: "0",
      paymentStatus: PaymentStatus.Draft,
    });
  };

  const unenroll = async (profileId: string) => {
    await reservationDeleteMutation.mutateAsync({
      profileId: profileId,
      courseId: courseId,
    });
  };

  const defs = useMemo(
    () => [
      profileDefs.firstName,
      profileDefs.lastName,
      profileDefs.association,
      profileFieldHelper.accessor(({ id }) => rosterIds.has(id), {
        id: "enrolled",
        header: "Enrolled",
        cell: ({ row }) => {
          if (rosterIds.has(row.original.id)) {
            /* Already enrolled */
            return (
              <Button variant="secondary" asChild>
                <Link to={`/admin/enrollment/${courseId}/${row.original.id}`}>
                  Manage
                </Link>
              </Button>
            );
          } else {
            /* Not yet enrolled */
            return (
              <Button
                variant="default"
                onClick={async () => {
                  await enroll(row.original.id);
                  await navigate(
                    `/admin/enrollment/${courseId}/${row.original.id}`,
                  );
                }}
              >
                Enroll
              </Button>
            );
          }
        },
      }),
    ],
    [courseId, roster],
  );

  //Data Table
  const rosterTableDef = useMemo(
    () => [
      reservationDefs.lastName,
      reservationDefs.firstName,
      reservationDefs.creditHours,
      reservationDefs.isMember,
      reservationDefs.paymentStatus,
      reservationFieldHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return (
            <Button asChild>
              <Link
                to={`/admin/enrollment/${courseId}/${row.original.profileId}`}
              >
                Manage Enrollment
              </Link>
            </Button>
          );
        },
      }),
    ],
    [],
  );

  return (
    <>
      <Card variant="yellow" className="col-span-full @6xl:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle>
            Current Enrollment{" "}
            {
              <Badge variant={classFull ? "destructive" : "outline"}>
                {classFull ? "Full" : "Open"}
              </Badge>
            }
          </CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={rosterTableDef} data={roster} />
        </CardContent>
      </Card>
      <Card variant="blue" className="col-span-full @6xl:col-span-3">
        <CardHeader>
          <CardTitle>All Trainees</CardTitle>
          <CardDescription>
            Enroll trainees directly. Payment and invoices can be configured
            after enrollment. Use "Create and Enroll a New Profile" for those
            not yet added to the sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={defs} data={trainees?.data} />
          <div className="mt-4">
            <Button asChild>
              <Link to={`/admin/create-profile?enrollIn=${courseId}`}>
                Create and Enroll New Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
