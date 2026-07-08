import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { authClient, getSession, useSession, type Session } from "~/utils/auth";
import { useTRPC } from "~/utils/trpc";
import { getUserRedirectUrl } from "~/utils/utils";

export function ProfileSelection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const profilesQuery = useQuery(trpc.profile.getProfiles.queryOptions());
  const profiles = profilesQuery.data ?? [];
  // Sort by last name
  profiles.sort((a, b) => a.lastName.localeCompare(b.lastName));

  const onProfileSelect = async (profileId: string) => {
    await authClient.updateSession({
      activeProfileId: profileId,
    });
    const { data: sessionData } = await getSession();
    await queryClient.invalidateQueries({
      queryKey: trpc.profile.getActiveProfile.queryKey(),
    });
    navigate(getUserRedirectUrl(sessionData as Session | null));
  };

  return (
    <Card className="p-4 w-xl mt-10 self-center">
      <CardHeader>
        <CardTitle className="text-center">Select Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 w-lg m-auto">
        {/* TODO: Create New Profile button */}
        {profiles.map((profile) => (
          <Button
            key={profile.id}
            variant="default"
            onClick={() => onProfileSelect(profile.id)}
          >
            {profile.firstName} {profile.lastName}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
