import { PageHeader } from "~/components/page-header";
import type { Route } from "./+types/registration-details";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Registration Details" }];
}

export default function RegistrationDetailsPage({
  params: { courseEventId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const { data: courseEvent } = useQuery(
    trpc.courseEvents.trainee.get.queryOptions({ courseEventId }),
  );

  return (
    <>
      <div className="pb-6">
        <Button variant="ghost" asChild>
          <Link to="/trainee/registration">
            <ArrowLeft className="mr-2" /> Back to Courses
          </Link>
        </Button>
      </div>
      <PageHeader></PageHeader>

      <div className="flex justify-center">
        <Card className="max-w-200 w-full">
          <CardHeader>
            <CardTitle>{courseEvent?.courseName}</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="min-h-64">{courseEvent?.description}</CardContent>
        </Card>
      </div>
      <div></div>
    </>
  );
}
