import { PaymentStatus } from "@backend/database/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link } from "react-router";
import { DataTable } from "~/components/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ButtonGroup } from "~/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { profileDefs, profileFieldHelper } from "~/utils/field-defs/profile";
import { reservationDefs, reservationFieldHelper } from "~/utils/field-defs/reservation";
import { useTRPC, useTRPCClient } from "~/utils/trpc";
import { EditTraineeReservation } from "../trainee-manager/edit-reservation";

export function RosterManager({ courseId }: { courseId: string }) {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();
  const trainees = useQuery(trpc.profiles.admin.listTrainees.queryOptions());

  const { data: course } = useQuery(
    trpc.courses.admin.get.queryOptions({ id: courseId }),
  );

  const reservations = useQuery(
    trpc.reservations.admin.listCourse.queryOptions({
      courseId,
    }),
  );
  const roster = reservations.data ?? [];
  const rosterIds = new Set(roster.map((r) => r.profileId));

  const seats = course?.seats ?? 0;
  const classFull = roster.length >= seats;

  const reservationCreateMutation = useMutation(
    trpc.reservations.admin.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.reservations.admin.listCourse.queryKey({
            courseId: courseId,
          }),
        });
      },
    }),
  );

  const reservationDeleteMutation = useMutation(
    trpc.reservations.admin.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.reservations.admin.listCourse.queryKey({
            courseId: courseId,
          }),
        });
      },
    }),
  );

  const enroll = (profileId: string) => {
    reservationCreateMutation.mutate({
      profileId: profileId,
      courseId: courseId,
      creditHours: "0",
      paymentStatus: PaymentStatus.Draft,
    });
  };

  const unenroll = (profileId: string) => {
    reservationDeleteMutation.mutate({
      profileId: profileId,
      courseId: courseId,
    });
  };

  const defs = useMemo(
    () =>
      [
        profileDefs.firstName,
        profileDefs.lastName,
        profileDefs.association,
        profileFieldHelper.accessor(({ id }) => rosterIds.has(id), {
          id: "enrolled",
          header: "Enrolled",
          cell: ({ row }) => {
            if (rosterIds.has(row.original.id)) {
              return (
                <Button
                  variant="destructive"
                  onClick={() => unenroll(row.original.id)}
                >
                  Unenroll
                </Button>
              );
            } else {
              return (
                <Button
                  variant="default"
                  onClick={() => enroll(row.original.id)}
                >
                  Enroll
                </Button>
              );
            }
          },
        }),
      ]
    ,
    [courseId, roster],
  );

  async function deleteRow(profileId: string, courseId: string) {
    await client.reservations.admin.delete.mutate({
      profileId,
      courseId,
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.reservations.admin.listCourse.queryKey({
        courseId: courseId!,
      }),
    });
  }

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
            <ButtonGroup>
              <EditTraineeReservation reservation={row.original} />
              <Button
                variant="destructive"
                onClick={() =>
                  deleteRow(row.original.profileId, row.original.courseId)
                }
              >
                Unenroll
              </Button>
            </ButtonGroup>
          );
        },
      }),
    ],
    [],
  );


  return (
    <>
      <Card variant="blue" className="col-span-full">
        <CardHeader>
          <CardTitle>Direct Enrollment</CardTitle>
          <CardDescription>
            Enroll trainees directly. Payment and invoices can be configured after
            enrollment. Use "Create and Enroll a New Profile" for those not yet added to the sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={defs} data={trainees?.data} />
          <div className="mt-4">
            <Button asChild>
              <Link
                to={`/admin/create-profile?enrollIn=${courseId}`}
              >
                Create and Enroll New Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card variant="yellow" className="col-span-full">
        <CardHeader className="pb-3">
          <CardTitle>
            Class Roster{" "}
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
    </>
  );
}
