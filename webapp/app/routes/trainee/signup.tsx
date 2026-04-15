import { useTRPC } from "~/utils/trpc";
import { PageHeader } from "~/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Info } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";

import { useQuery, useMutation } from "@tanstack/react-query";

export default function SignupPage() {
  const trpc = useTRPC();
  const { data: sessions, isLoading: sessionsLoading } = useQuery(trpc.trainee.getAllAvailableSessions.queryOptions());
  const { data: profiles, isLoading: profilesLoading } = useQuery(trpc.profile.getMine.queryOptions());

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const registerMutation = useMutation(trpc.trainee.registerForSession.mutationOptions({
    onSuccess: (data) => {
      toast.success(data.status === "waitlisted" ? "Added to waitlist!" : "Registered successfully!");
    },
    onError: (err) => {
      toast.error(err.message);
    }
  }));
  if (sessionsLoading || profilesLoading) return <div className="p-10 text-center">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <PageHeader>Course Sign-up</PageHeader>
      
      <div className="max-w-xl bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Important</p>
          <p>Please select which profile you are registering for before choosing a course.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 py-4">
        <span className="text-sm font-medium">Select Profile:</span>
        <Select onValueChange={(value) => setSelectedProfileId(value)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Choose a profile..." />
          </SelectTrigger>
          <SelectContent>
            {profiles?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sessions?.map((session) => (
          <Card key={session.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{session.courseName}</CardTitle>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {session.description}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {session.classStartDatetime ? format(new Date(session.classStartDatetime), "PPP p") : "TBD"}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {session.locationType === "virtual" ? "Virtual" : session.physicalAddress || "TBD"}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {session.seats} Seats Available
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={!selectedProfileId || registerMutation.isPending}
                onClick={() => {
                  if (selectedProfileId) {
                    registerMutation.mutate({
                      profileId: selectedProfileId,
                      courseEventId: session.id
                    });
                  }
                }}
              >
                {registerMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
