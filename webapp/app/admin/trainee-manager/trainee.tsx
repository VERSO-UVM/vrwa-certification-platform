import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TraineeReservations } from "~/admin/trainee-manager/reservations";
import type { Profile } from "@backend/database/schema";
import { TraineeEditButton } from "./edit-profile";
import { DetailsDisplay } from "~/components/entry-views/details-display";
import { profileDefPresets } from "~/utils/field-defs/profile";

export function Trainee({ trainee }: { trainee: Profile }) {
  return (
    <div id={trainee.id}>
      <br></br>
      <h2 className="text-xl font-medium text-left p-4 vrwa-light:text-gray-800 dark:text-gray-200 rounded-xl">
        {trainee.firstName} {trainee.lastName}
      </h2>

      <div className="flex flex-wrap place-content-between space-x-5">
        <Card
          className="flex-1 border-none shadow-none max-w-[100%]"
          variant="green"
        >
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>
              Manage allotted credit hours for past classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TraineeReservations profileId={trainee.id} />
          </CardContent>
        </Card>
        <Card className="w-[250px] border-none shadow-none" variant="yellow">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>
              {trainee.firstName + " " + trainee.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TraineeEditButton label="Edit" trainee={trainee} />
            <div className="pt-4"></div>
            <DetailsDisplay item={trainee} columns={profileDefPresets.all} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
