import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "../+types/home";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { DataTable } from "~/components/data-table";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { courseEventDefPresets } from "~/utils/field-defs/course-event";
import { reservationDefPresets } from "~/utils/field-defs/reservation";
import type { CourseEventDto, ReservationDto } from "@backend/database/dtos";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Certifications" }];
}

export default function TraineeHome() {
  // Code to get the active profile - taken from part of the ActiveProfileIndicator in active-profile-indicator.tsx
  const trpc = useTRPC();
  const activeProfileQuery = useQuery(
    trpc.profiles.getActiveProfile.queryOptions(),
  );
  const profileName = activeProfileQuery.data?.firstName + " " + activeProfileQuery.data?.lastName;

  const profileId = activeProfileQuery.data?.id;

  // We are telling queryOptions that the profileId input will not be null, which is fine to do in this case because of the enabled line right below.
  const reservations = useQuery(trpc.reservations.trainee.listTrainee.queryOptions({ profileId: profileId! },
    { enabled: !!profileId }
  ));

  return (
    <div className="flex-1">
      <PageHeader>Hello, {profileName}!
      </PageHeader>
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
              columns={reservationDefPresets.all}
              data={(reservations.data as ReservationDto[]) ?? []}
              table={{enableRowSelection: false,}}
            />
          </CardContent>
        </Card>
        <Card className="space-y-4 @xl:col-span-4" variant="blue">
          <CardHeader>
            <CardTitle>
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            [Add a DataTable for the unpaid invoices for a specific user here - need to wait until after we set up the payment system]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
