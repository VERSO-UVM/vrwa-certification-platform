import type { Route } from "./+types/registration";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { courseEvent } from "@backend/database/schema";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [{ title: "VRWA - Course Registration" }];
}

const classCardVariants = ["blue", "green", "yellow", "orange"] as const;

export default function CourseRegistrationPage() {
  const trpc = useTRPC();
  const { data: courseEvents } = useQuery(
    trpc.courseEvents.trainee.listFuture.queryOptions(),
  );
  return (
    <>
      <PageHeader>Upcoming Trainings</PageHeader>
      <div className="grid grid-cols-1 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {courseEvents?.map((training, i) => {
          if (!training.classStartDatetime) return null;
          const variant = i % classCardVariants.length;
          return (
            <Link to={training.id} key={training.id} className="m-4">
              <Card variant={classCardVariants[variant]}>
                <CardHeader>
                  <CardTitle>{training.courseName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col justify-between min-h-36">
                  <dl className="grid grid-cols-1">
                    <div className="flex space-x-2">
                      <dt className="font-medium">Date: </dt>
                      <dd>{dateFormat(training.classStartDatetime)}</dd>
                    </div>
                    <div className="flex space-x-2">
                      <dt className="font-medium">Time: </dt>
                      <dd>{timeFormat(training.classStartDatetime)}</dd>
                    </div>
                    <div className="flex space-x-2">
                      <dt className="font-medium">Seats: </dt>
                      <dd>{training.seats}</dd>
                    </div>
                  </dl>
                  {/* We already have a link around the whole card, this button is just for visual indication */}
                  <Button className="mt-auto">Register</Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function dateFormat(date: Date) {
  return format(date, "eeee, LLLL M");
}

function timeFormat(date: Date) {
  return format(date, "p");
}
