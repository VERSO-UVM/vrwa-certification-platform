import { PaymentStatus } from "@backend/database/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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

  const enroll = async (profileId: string) => {
    console.log("ENROLL", profileId)
    await client.reservations.admin.create.mutate({
      profileId: profileId,
      courseId: courseId,
      creditHours: "0",
      paymentStatus: PaymentStatus.Draft,
    });

    await queryClient.invalidateQueries({
      queryKey: trpc.reservations.admin.listCourse.queryKey({
        courseId: courseId,
      }),
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.profiles.admin.listTrainees.queryKey(),
    });
  };

  const unenroll = async (profileId: string) => {
    await client.reservations.admin.delete.mutate({
      profileId: profileId,
      courseId: courseId,
    });

    await queryClient.invalidateQueries({
      queryKey: trpc.profiles.admin.listTrainees.queryKey(),
    });
  };

  const defs = useMemo(
    () => [
      profileDefs.firstName,
      profileDefs.lastName,
      profileDefs.address,
      profileDefs.city,
      profileDefs.postalCode,
      profileFieldHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (rosterIds.has(row.original.id)) {
            return (
              <Button
                variant="destructive"
                onClick={() => enroll(row.original.id)}
              >
                Unenroll
              </Button>
            );
          } else {
            return (
              <Button
                variant="default"
                onClick={() => unenroll(row.original.id)}
              >
                Enroll
              </Button>
            );
          }
        },
      }),
    ],
    [courseId, rosterIds],
  );

  return (
    <Card variant="blue" className="col-span-full">
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={defs} data={trainees?.data} />;
      </CardContent>
    </Card>
  );
}
