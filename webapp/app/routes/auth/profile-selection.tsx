import { useCallback, useRef, useState } from "react";
import { getSession, useSession } from "~/lib/auth-client";
import { getPostAuthPath } from "~/lib/auth-routing";
import { useTRPC } from "~/utils/trpc";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { User } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { ProfileForm, type ProfileFormValues } from "~/components/profile-form";

export default function ProfileSelection() {
  const {
    data: session,
    isPending: isSessionPending,
    refetch: refetchSession,
  } = useSession();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newProfileFormKey, setNewProfileFormKey] = useState(0);
  const didAutoSelectSingleProfile = useRef(false);

  const getMyProfiles = useQuery(
    trpc.profile.getMyProfiles.queryOptions(undefined, {
      enabled: !!session,
    }),
  );

  const switchProfile = useMutation(
    trpc.profile.switchProfile.mutationOptions(),
  );
  const createProfile = useMutation(
    trpc.profile.createProfile.mutationOptions(),
  );

  const activeProfileId = (
    session?.session as { activeProfileId?: string } | undefined
  )?.activeProfileId;

  const goToAppHome = useCallback(async () => {
    await refetchSession();
    const sessionRes = await getSession();
    navigate(getPostAuthPath(sessionRes?.data ?? null));
  }, [navigate, refetchSession]);

  useEffect(() => {
    if (!isSessionPending && !session) {
      navigate("/login");
    }
  }, [session, isSessionPending, navigate]);

  useEffect(() => {
    if (didAutoSelectSingleProfile.current) return;
    if (
      getMyProfiles.data &&
      getMyProfiles.data.length === 1 &&
      !activeProfileId
    ) {
      const firstProfile = getMyProfiles.data[0];
      if (!firstProfile) return;
      didAutoSelectSingleProfile.current = true;
      const profileId = firstProfile.id;
      switchProfile.mutate(
        { profileId },
        {
          onSuccess: async () => {
            await goToAppHome();
          },
          onError: () => {
            didAutoSelectSingleProfile.current = false;
          },
        },
      );
    }
  }, [getMyProfiles.data, activeProfileId, switchProfile, goToAppHome]);

  if (isSessionPending || getMyProfiles.isPending) {
    return <div className="p-10 text-center">Loading profiles...</div>;
  }

  const handleProfileSelect = (profileId: string) => {
    switchProfile.mutate(
      { profileId },
      {
        onSuccess: async () => {
          await goToAppHome();
        },
      },
    );
  };

  async function handleCreateProfile(values: ProfileFormValues) {
    const created = await createProfile.mutateAsync({
      ...values,
      isMember: false,
    });
    await switchProfile.mutateAsync({ profileId: created.id });
    await queryClient.invalidateQueries(
      trpc.profile.getMyProfiles.queryFilter(),
    );
    setCreateOpen(false);
    await goToAppHome();
  }

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
          {getMyProfiles.data?.map((p) => (
            <Button
              key={p.id}
              variant={activeProfileId === p.id ? "default" : "outline"}
              className="h-20 flex items-center justify-start gap-4 px-6"
              onClick={() => handleProfileSelect(p.id)}
              disabled={switchProfile.isPending || createProfile.isPending}
            >
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold text-lg">
                  {p.firstName} {p.lastName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {p.isMember ? "Member" : "Non-Member"}
                </span>
              </div>
            </Button>
          ))}
          <Dialog
            open={createOpen}
            onOpenChange={(open) => {
              setCreateOpen(open);
              if (open) setNewProfileFormKey((k) => k + 1);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full">
                Create new profile
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New profile</DialogTitle>
              </DialogHeader>
              <ProfileForm
                key={newProfileFormKey}
                formId="profile-selection-new"
                onSubmit={handleCreateProfile}
                submitLabel={
                  createProfile.isPending || switchProfile.isPending
                    ? "Saving..."
                    : "Create and use profile"
                }
                disabled={createProfile.isPending || switchProfile.isPending}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
