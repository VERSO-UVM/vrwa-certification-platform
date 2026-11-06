import { PageHeader } from "~/components/page-header";
import type { Route } from "./+types/registration-details";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
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

function queries(trpc: TRPC, { courseId }: Route.LoaderArgs["params"]) {
  return [trpc.courses.trainee.get.queryOptions({ courseId })] as const;
}

/* Prefetch all queries during SSR. */
export const loader = prefetchLoader(queries);
/* Skip loader on client-side navigations */
export const clientLoader = () => {};

export default function RegistrationDetailsPage({
  params: { courseId },
}: Route.ComponentProps) {
  const [{ data: courseEvent }] = useSuspenseQueries({
    queries: queries(useTRPC(), { courseId }),
  });

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
          <CardContent className="min-h-64">
            {courseEvent?.description}
          </CardContent>
        </Card>
      </div>
      <div></div>
    </>
  );
}
