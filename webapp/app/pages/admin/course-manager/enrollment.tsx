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
import { useTRPC, type TRPC } from "~/utils/trpc";
import type { ReservationDto } from "@backend/database/dtos";
import {
  useQueryClient,
  useMutation,
  useSuspenseQueries,
} from "@tanstack/react-query";
import { reservationDefs } from "~/utils/field-defs/reservation";
import { EditForm } from "~/components/entry-views/edit-form";
import { DetailsDisplay } from "~/components/entry-views/details-display";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useReservationDeleteMutation } from "./use-reservation-mutation";
import { PageHeader } from "~/components/page-header";
import { prefetchClientLoader } from "~/utils/prefetch";
import { prefetchLoader } from "~/utils/trpc.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Enrollment - VRWA" }];
}

const registrationBasicInfoDefs = [
  reservationDefs.email,
  reservationDefs.createdAt,
  reservationDefs.statusUpdatedAt,
];
const registrationEditFormDefs = [
  reservationDefs.reservationStatus,
  reservationDefs.paymentStatus,
];
const attendanceInfoDefs = [
  reservationDefs.classStartDateTime,
  reservationDefs.courseCreditHours,
];
const attendanceEditform = [reservationDefs.creditHours];

function queries(
  trpc: TRPC,
  { profileId, courseId }: Route.LoaderArgs["params"],
) {
  return [
    trpc.reservations.admin.get.queryOptions({
      courseId,
      profileId,
    }),
    trpc.courses.admin.get.queryOptions({ id: courseId }),
    trpc.profiles.admin.get.queryOptions({ profileId }),
  ] as const;
}

/* Prefetch all queries during SSR. */
export const loader = prefetchLoader(queries);
/* Prefetch into the browser cache on client-side navigations. */
export const clientLoader = prefetchClientLoader(queries);

export default function Enrollment({
  params: { courseId, profileId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [{ data: reservation }, { data: course }, { data: profile }] =
    useSuspenseQueries({
      queries: queries(trpc, { courseId, profileId }),
    });

  const reservationUpdater = useMutation(
    trpc.reservations.admin.update.mutationOptions(),
  );
  const reservationDeleteMutation = useReservationDeleteMutation();

  const updateData = async (updates: Partial<ReservationDto>) => {
    await reservationUpdater.mutateAsync({
      profileId: profileId,
      courseId: courseId,
      ...updates,
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.reservations.admin.pathKey(),
    });
  };

  return (
    <>
      <PageHeader>
        {profile.firstName} {profile.lastName}
      </PageHeader>
      <div className="flex">
        <Button variant="ghost" asChild>
          <Link to={`/admin/course-details/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Course details:{" "}
            {course.courseName}
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        <Card className="col-span-full @6xl:col-span-3" variant="green">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Registration
              <Button
                variant="destructive"
                size="lg"
                className="w-50"
                onClick={async () => {
                  if (
                    !confirm("Are you sure you want to unenroll this trainee?")
                  ) {
                    return;
                  }
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
          <CardContent className="flex flex-col gap-6 @md:flex-row @md:gap-8">
            <DetailsDisplay
              item={reservation}
              columns={registrationBasicInfoDefs}
            />
            <EditForm
              item={reservation}
              onSave={updateData}
              columns={registrationEditFormDefs}
              required={{
                paymentStatus: true,
                reservationStatus: true,
              }}
            />
          </CardContent>
        </Card>
        <Card className="col-span-full @6xl:col-span-3" variant="blue">
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 @md:flex-row @md-gap-8">
            <DetailsDisplay
              item={reservation}
              columns={attendanceInfoDefs}
            />
            <EditForm
              item={reservation}
              onSave={updateData}
              columns={attendanceEditform}
              required={{
                creditHours: true,
              }}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
