import { useTRPC } from "~/utils/trpc";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar, MapPin, Users, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";

import { useQuery, useMutation } from "@tanstack/react-query";

export default function SignupPage() {
  const trpc = useTRPC();
  const { data: sessions, isLoading: sessionsLoading } = useQuery(
    trpc.trainee.getAllAvailableSessions.queryOptions(),
  );
  const { data: profiles, isLoading: profilesLoading } = useQuery(
    trpc.profile.getMyProfiles.queryOptions(),
  );
  const { data: authSession } = authClient.useSession();
  const activeProfileId = (
    authSession?.session as { activeProfileId?: string } | undefined
  )?.activeProfileId;

  const [selectedProfileIds, setSelectedProfileIds] = useState<Set<string>>(
    new Set(),
  );
  const registerMutation = useMutation(
    trpc.trainee.registerMultipleForSession.mutationOptions({
      onSuccess: (data) => {
        const waitlistCount = data.results.filter(
          (result) => result.status === "waitlisted",
        ).length;
        const alreadyRegisteredCount = data.results.filter(
          (result) => result.status === "already_registered",
        ).length;
        const registeredCount = data.results.filter(
          (result) => result.status === "registered",
        ).length;

        const statusSummary = [
          registeredCount > 0 ? `${registeredCount} registered` : null,
          waitlistCount > 0 ? `${waitlistCount} waitlisted` : null,
          alreadyRegisteredCount > 0
            ? `${alreadyRegisteredCount} already registered`
            : null,
        ]
          .filter(Boolean)
          .join(", ");
        toast.success(statusSummary || "Registration processed.");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    }),
  );

  useEffect(() => {
    if (!profiles || profiles.length === 0) return;
    if (
      activeProfileId &&
      profiles.some((profile) => profile.id === activeProfileId)
    ) {
      setSelectedProfileIds(new Set([activeProfileId]));
      return;
    }
    if (profiles.length === 1) {
      const onlyProfile = profiles[0];
      if (onlyProfile) {
        setSelectedProfileIds(new Set([onlyProfile.id]));
      }
    }
  }, [profiles, activeProfileId]);

  const selectedProfileCount = selectedProfileIds.size;
  const hasWaitlistedResult = useMemo(
    () =>
      registerMutation.data?.results.some(
        (result) => result.status === "waitlisted",
      ) ?? false,
    [registerMutation.data],
  );

  const toggleProfile = (profileId: string, isChecked: boolean) => {
    setSelectedProfileIds((previous) => {
      const next = new Set(previous);
      if (isChecked) {
        next.add(profileId);
      } else {
        next.delete(profileId);
      }
      return next;
    });
  };

  if (sessionsLoading || profilesLoading)
    return <div className="p-10 text-center">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <PageHeader>Course Sign-up</PageHeader>

      <div className="max-w-xl bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Important</p>
          <p>
            Check the profile(s) you are registering before choosing a course.
          </p>
        </div>
      </div>

      <div className="space-y-3 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Select Profiles:</span>
          <span className="text-sm text-muted-foreground">
            {selectedProfileCount} selected
          </span>
        </div>
        <div className="max-w-xl rounded-md border p-4">
          <div className="flex flex-col gap-3">
            {profiles?.map((selectedProfile) => (
              <label
                key={selectedProfile.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2"
              >
                <Checkbox
                  checked={selectedProfileIds.has(selectedProfile.id)}
                  onCheckedChange={(checked) =>
                    toggleProfile(selectedProfile.id, checked === true)
                  }
                />
                <span className="text-sm font-medium">
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {hasWaitlistedResult && (
        <div className="rounded-md border border-border bg-muted p-4 text-sm">
          <p className="font-semibold">Added to waitlist</p>
          <p className="text-muted-foreground">
            This class is full right now. You are on the waitlist and will be
            contacted if a seat opens.
          </p>
        </div>
      )}

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
                  {session.classStartDatetime
                    ? format(new Date(session.classStartDatetime), "PPP p")
                    : "TBD"}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  {session.locationType === "virtual"
                    ? "Virtual"
                    : session.physicalAddress || "TBD"}
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  {session.seatsRemaining} Seats Remaining
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={
                  selectedProfileCount === 0 ||
                  registerMutation.isPending ||
                  (session.classStartDatetime
                    ? new Date(session.classStartDatetime) < new Date()
                    : false)
                }
                onClick={() => {
                  if (selectedProfileCount > 0) {
                    registerMutation.mutate({
                      profileIds: Array.from(selectedProfileIds),
                      courseEventId: session.id,
                    });
                  }
                }}
              >
                {registerMutation.isPending
                  ? "Submitting..."
                  : session.isFull
                    ? "Join Waitlist"
                    : "Register"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
