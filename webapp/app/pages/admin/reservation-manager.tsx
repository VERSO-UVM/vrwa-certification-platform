/**
 * Page to manage reservation of an individual user in a course.
 */

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/reservation-manager";
import { type TRPC, useTRPC } from "~/utils/trpc";
import type { ReservationDto } from "@backend/database/dtos";
import { useSuspenseQueries } from "@tanstack/react-query";
import { reservationDefs } from "~/utils/field-defs/reservation";
import { EditForm } from "~/components/entry-views/edit-form";
import { DetailsDisplay } from "~/components/entry-views/details-display";
import { Button } from "~/components/ui/button";
import { Link, type LoaderFunctionArgs, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  useReservationDeleteMutation,
  useReservationUpdateMutation,
} from "./course-manager/use-reservation-mutation";
import { PageHeader } from "~/components/page-header";
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
const attendanceEditForm = [reservationDefs.creditHours];

function queries(trpc: TRPC, params: Route.LoaderArgs["params"]) {
  const { courseId, profileId } = params;
  return [
    trpc.reservations.admin.get.queryOptions({
      courseId,
      profileId,
    }),
    trpc.courses.admin.get.queryOptions({ id: courseId }),
    trpc.profiles.admin.get.queryOptions({ profileId }),
  ] as const;
}

/* Prefetch queries in the server */
export const loader = prefetchLoader(queries);
/* Skip loader on client-side navigations */
export const clientLoader = () => {};

export default function Reservation({
  params: { courseId, profileId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const navigate = useNavigate();

  const [{ data: reservation }, { data: course }, { data: profile }] =
    useSuspenseQueries({
      queries: queries(trpc, { courseId, profileId }),
    });

  const reservationDeleteMutation = useReservationDeleteMutation();
  const reservationUpdateMutation = useReservationUpdateMutation();

  const onSave = async (updates: Partial<ReservationDto>) => {
    await reservationUpdateMutation.mutateAsync({
      profileId: profileId,
      courseId: courseId,
      ...updates,
    });
  };

  return (
    <>
      <PageHeader>
        {profile.firstName} {profile.lastName}
      </PageHeader>
      <div className="flex">
        <Button
          variant="ghost"
          render={<Link to={`/admin/course-details/${courseId}`} />}
          nativeButton={false}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Course details:{" "}
          {course.courseName}
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
                onClick={() => {
                  if (
                    !confirm("Are you sure you want to unenroll this trainee?")
                  ) {
                    return;
                  }
                  void reservationDeleteMutation
                    .mutateAsync({
                      profileId,
                      courseId,
                    })
                    .then(() => navigate(`/admin/course-details/${courseId}`));
                }}
              >
                Unenroll
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 @md:flex-row @md:gap-8">
            <DetailsDisplay
              item={reservation}
              columns={registrationBasicInfoDefs}
            />
            <EditForm
              item={reservation}
              onSave={onSave}
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
          </CardHeader>
          <CardContent className="flex flex-col gap-6 @md:flex-row @md-gap-8">
            <DetailsDisplay item={reservation} columns={attendanceInfoDefs} />
            <EditForm
              item={reservation}
              onSave={onSave}
              columns={attendanceEditForm}
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
