import { PageHeader } from "~/components/page-header";
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

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA Certifications" }];
}

export default function TraineeHome() {
  return (
    <div className="flex-1">
      {/* TODO: Add profile name here - look at sidebar code for a ActiveProfileIndicator function - can make helper function for it? */}
      <PageHeader>Hello, NAME!</PageHeader>
      <div className="grid gap-4 grid-cols-1 @xl:grid-cols-8">
        <Card className="@xl:col-span-4" variant="blue">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>
              See all upcoming classes you are registered for here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            [Add a DataTable for the classes a specific user is signed up for here.]
          </CardContent>
        </Card>
        <Card className="space-y-4 @xl:col-span-4" variant="green">
          <CardHeader>
            <CardTitle>
              Outstanding Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            [Add a DataTable for the unpaid invoices for a specific user here - might need to wait until after we set up the payment system?]
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
