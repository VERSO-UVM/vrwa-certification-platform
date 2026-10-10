import { PaymentStatus } from "@backend/database/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import { DataTable } from "~/components/data-table";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { profileDefs, profileFieldHelper } from "~/utils/field-defs/profile";
import { useTRPC, useTRPCClient } from "~/utils/trpc";

export function RosterManager({ courseId }: { courseId: string }) {
  const trpc = useTRPC();
  const client = useTRPCClient();
  const queryClient = useQueryClient();
  const trainees = useQuery(trpc.profiles.admin.listTrainees.queryOptions());

  const reservations = useQuery(
    trpc.reservations.admin.listCourse.queryOptions({
      courseId,
    }),
  );
  const roster = reservations.data ?? [];
  const rosterIds = new Set(roster.map((r) => r.profileId));

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

  const unenroll = async (profileId: string) => {
    await reservationDeleteMutation.mutate({
      profileId: profileId,
      courseId: courseId,
    });
  };

  const defs = useMemo(
    () => (
      console.log("RE-RENDERING TABLE COLUMNS"),
      [
        profileDefs.firstName,
        profileDefs.lastName,
        profileDefs.address,
        profileDefs.city,
        profileDefs.postalCode,
        profileFieldHelper.accessor(({ id }) => rosterIds.has(id), {
          id: "enrolled",
          header: "Enrolled",
          cell: ({ row, getValue: isEnrolled }) => {
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
    ),
    [courseId, roster],
  );

  return (
    <Card variant="blue" className="col-span-full">
      <CardHeader>
        <CardTitle>Direct Enrollment</CardTitle>
        <CardDescription>
          Enroll trainees directly. Payment and invoices can be configured after
          enrollment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={defs} data={trainees?.data} />
        <Button className="mt-4" asChild>
          <Link
            to={`/admin/create-profile?enrollIn=${courseId}`}
          >
            Add New Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
