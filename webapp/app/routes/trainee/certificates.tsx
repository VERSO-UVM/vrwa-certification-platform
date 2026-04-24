import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link, useSearchParams } from "react-router";
import { format } from "date-fns";
import { Trophy } from "lucide-react";

export default function CertificatesPage() {
  const trpc = useTRPC();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");
  const { data, isLoading } = useQuery(
    trpc.trainee.getMyCompletedCourses.queryOptions(),
  );

  if (isLoading) {
    return <div className="p-10 text-center">Loading your certificates...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader>My Certificates</PageHeader>
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((certificate) => {
            const isHighlighted = eventId === certificate.courseEventId;
            return (
              <Card
                key={`${certificate.profileId}_${certificate.courseEventId}`}
                className={isHighlighted ? "border-primary" : undefined}
              >
                <CardContent className="flex items-center justify-between p-5 gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {certificate.courseName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {certificate.classStartDatetime
                        ? format(
                            new Date(certificate.classStartDatetime),
                            "PPP p",
                          )
                        : "Date TBD"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {certificate.firstName} {certificate.lastName} •{" "}
                      {certificate.creditHours} credits
                    </div>
                  </div>
                  <Button asChild variant="outline">
                    <Link
                      to={`/trainee/certificates/view?profileId=${certificate.profileId}&eventId=${certificate.courseEventId}`}
                    >
                      View Certificate
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-2 text-muted-foreground">
            Your certificates will appear here once you complete courses.
          </p>
        </div>
      )}
    </div>
  );
}
