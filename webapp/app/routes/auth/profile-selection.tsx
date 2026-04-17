import { useSession } from "~/lib/auth-client";
import { trpc } from "~/utils/trpc";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { User } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

export default function ProfileSelection() {
  const {
    data: session,
    isPending: isSessionPending,
    refetch: refetchSession,
  } = useSession();
  const navigate = useNavigate();
  const trpcProxy = trpc();

  const getMyProfiles = useQuery(
    trpcProxy.profile.getMyProfiles.queryOptions(undefined, {
      enabled: !!session,
    }),
  );

  const switchProfile = useMutation(
    trpcProxy.profile.switchProfile.mutationOptions(),
  );
  const activeProfileId = (
    session?.session as { activeProfileId?: string } | undefined
  )?.activeProfileId;

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/login");
    }
  }, [session, isSessionPending, navigate]);

  useEffect(() => {
    if (
      getMyProfiles.data &&
      getMyProfiles.data.length === 1 &&
      !activeProfileId
    ) {
      // Auto-select if only one profile
      const profile = getMyProfiles.data[0];
      if (!profile) return;
      const profileId = profile.id;
      switchProfile.mutate(
        { profileId },
        {
          onSuccess: async () => {
            await refetchSession();
            navigate("/");
          },
        },
      );
    }
  }, [getMyProfiles.data, session, switchProfile, navigate, refetchSession]);

  if (isSessionPending || getMyProfiles.isPending) {
    return <div className="p-10 text-center">Loading profiles...</div>;
  }

  const handleProfileSelect = (profileId: string) => {
    switchProfile.mutate(
      { profileId },
      {
        onSuccess: async () => {
          await refetchSession();
          navigate("/");
        },
      },
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Select Profile
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Choose which profile to use for this session
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {getMyProfiles.data?.map((profile) => (
            <Button
              key={profile.id}
              variant={activeProfileId === profile.id ? "default" : "outline"}
              className="h-20 flex items-center justify-start gap-4 px-6"
              onClick={() => handleProfileSelect(profile.id)}
              disabled={switchProfile.isPending}
            >
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-lg">
                  {profile.firstName} {profile.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile.isMember ? "Member" : "Non-Member"}
                </span>
              </div>
            </Button>
          ))}
          {getMyProfiles.data?.length === 0 && (
            <p className="text-center text-muted-foreground">
              No profiles found. Please contact support.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
