/**
 * Page to manage reservation of an individual user in a course.
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Route } from "./+types/enrollment";
import { useTRPC } from "~/utils/trpc";
import type { ReservationDto } from "@backend/database/dtos";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  reservationDefPresets,
  reservationDefs,
} from "~/utils/field-defs/reservation";
import { EditForm } from "~/components/entry-views/edit-form";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useReservationDeleteMutation } from "./use-reservation-delete-mutation";
import { PageHeader } from "~/components/page-header";

export function meta() {
  return [{ title: "Enrollment - VRWA" }];
}

const defs1 = [reservationDefs.paymentStatus];
const defs2 = [reservationDefs.creditHours];

export default function Enrollment({
  params: { courseId, profileId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: reservation, status } = useQuery(
    trpc.reservations.admin.get.queryOptions({
      courseId,
      profileId,
    }),
  );

  const { data: course, status: courseStatus } = useQuery(
    trpc.courses.admin.get.queryOptions({ id: courseId }),
  );

  const { data: profile, status: profileQuery } = useQuery(
    trpc.profiles.admin.get.queryOptions({ profileId }),
  );

  const reservationUpdater = useMutation(
    trpc.reservations.admin.update.mutationOptions(),
  );
  const reservationDeleteMutation = useReservationDeleteMutation();

  const updateData = async (updates: Partial<ReservationDto>) => {
    await reservationUpdater.mutateAsync({
      profileId: profileId,
      courseId: courseId,
      creditHours: updates.creditHours?.toString(),
      paymentStatus: updates.paymentStatus,
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.reservations.admin.pathKey(),
    });
  };

  return (
    <>
      <PageHeader>
        {profile?.firstName} {profile?.lastName}
      </PageHeader>
      {courseStatus === "success" && (
        <div className="flex">
          <Button variant="ghost" asChild>
            <Link to={`/admin/course-details/${courseId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Course details:{" "}
              {course?.courseName}
            </Link>
          </Button>
        </div>
      )}
      {status === "error" ? (
        <>Not currently enrolled.</>
      ) : (
        <div className="grid grid-cols-6 gap-2">
          <Card className="col-span-full @6xl:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Registration
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-50"
                  onClick={async () => {
                    await reservationDeleteMutation.mutateAsync({
                      profileId,
                      courseId,
                    });
                    await navigate(`/admin/course-details/${courseId}`);
                  }}
                >
                  Unenroll
                </Button>
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <EditForm
                item={reservation}
                onSave={updateData}
                columns={defs1}
                required={{
                  paymentStatus: true,
                }}
              />
            </CardContent>
          </Card>
          <Card className="col-span-full @6xl:col-span-3">
            <CardHeader>
              <CardTitle>Completion</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <EditForm
                item={reservation}
                onSave={updateData}
                columns={defs2}
                required={{
                  creditHours: true,
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
