import { useTRPC } from "~/utils/trpc";
import { PageHeader } from "~/components/page-header";
import { format, isFuture } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  CheckCircle2,
  Timer,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

import { useQuery } from "@tanstack/react-query";

export default function CalendarPage() {
  const trpc = useTRPC();
  const { data: upcomingSessions, isLoading } = useQuery(
    trpc.trainee.getMyUpcomingSessions.queryOptions(),
  );
  const { data: pastSessions } = useQuery(
    trpc.trainee.getMyPastSessions.queryOptions(),
  );

  if (isLoading)
    return <div className="p-10 text-center">Loading your calendar...</div>;

  return (
    <div className="space-y-6">
      <PageHeader>My Course Calendar</PageHeader>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-6">
          <div className="space-y-4">
            {upcomingSessions
              ?.filter(
                (s) =>
                  s.classStartDatetime &&
                  isFuture(new Date(s.classStartDatetime)),
              )
              .map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-700 p-3 rounded-lg flex flex-col items-center justify-center min-w-[80px]">
                          <span className="text-xs uppercase font-bold">
                            {session.classStartDatetime
                              ? format(
                                  new Date(session.classStartDatetime),
                                  "MMM",
                                )
                              : "???"}
                          </span>
                          <span className="text-2xl font-black">
                            {session.classStartDatetime
                              ? format(
                                  new Date(session.classStartDatetime),
                                  "dd",
                                )
                              : "??"}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {session.courseName}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              {session.classStartDatetime
                                ? format(
                                    new Date(session.classStartDatetime),
                                    "p",
                                  )
                                : "TBD"}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {session.locationType}
                            </div>
                            <div className="flex items-center">
                              <Timer className="mr-1 h-3 w-3" />
                              {session.creditHours} Credits
                            </div>
                          </div>
                          <p className="text-xs mt-2 text-muted-foreground">
                            Trainee: {session.profileName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                          <CheckCircle2 className="mr-1.5 h-4 w-4" /> Registered
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {upcomingSessions?.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">
                  No upcoming sessions found.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="past" className="mt-6">
          <div className="space-y-4">
            {pastSessions?.map((session) => (
              <Card key={session.id} className="opacity-85">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {session.courseName}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {session.classStartDatetime
                            ? format(
                                new Date(session.classStartDatetime),
                                "PPP p",
                              )
                            : "TBD"}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {session.locationType}
                        </div>
                        <div className="flex items-center">
                          <Timer className="mr-1 h-3 w-3" />
                          Earned: {session.creditHours} Credits
                        </div>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        to={`/trainee/certificates/view?profileId=${session.profileId}&eventId=${session.id}`}
                      >
                        View Certificate
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pastSessions?.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No past sessions found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
