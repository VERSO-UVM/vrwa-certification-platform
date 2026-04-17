import { PageHeader } from "~/components/page-header";
import { useTRPC } from "~/utils/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Calendar, Clock, MapPin, DollarSign, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";

import { useQuery } from "@tanstack/react-query";

export function TraineeHome() {
  const trpc = useTRPC();
  const { data: sessions, isLoading } = useQuery(
    trpc.trainee.getMyUpcomingSessions.queryOptions(),
  );

  if (isLoading) return <div className="p-10">Loading your dashboard...</div>;

  return (
    <div className="space-y-8">
      <PageHeader>Operator Portal | Dashboard</PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Sessions Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-bold">
              Upcoming Courses
            </CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions?.map((session) => (
                <div
                  key={session.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{session.courseName}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {session.classStartDatetime
                        ? format(new Date(session.classStartDatetime), "PPP p")
                        : "TBD"}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {session.locationType}
                    </div>
                    <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      Trainee: {session.profileName}
                    </p>
                  </div>
                </div>
              ))}
              {sessions?.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No upcoming courses.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/trainee/signup">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Unpaid Invoices Quick View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xl font-bold">
              Outstanding Invoices
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Placeholder for now as invoices aren't fully implemented until Phase 4 */}
              <div className="flex items-center p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100">
                <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Invoice #INV-001 (Placeholder)</p>
                  <p className="text-sm">Due for: Water 101 - $100.00</p>
                </div>
                <Button size="sm" className="ml-auto" variant="outline">
                  Pay Now
                </Button>
              </div>

              <div className="text-center pt-4 border-t">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/trainee/invoices">View All Invoices</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
