import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Undo, Undo2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
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
import { getUserRedirectUrl } from "~/utils/session";

export function ProfileSelection() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const profilesQuery = useQuery(trpc.profile.list.queryOptions());
  const profiles = profilesQuery.data ?? [];
  // Sort by last name
  profiles.sort((a, b) => a.lastName.localeCompare(b.lastName));

  const onProfileSelect = async (profileId: string) => {
    // Update active profile for the current session
    await authClient.updateSession({
      activeProfileId: profileId,
    });
    const { data: sessionData } = await getSession();
    // TODO: Does this invalidate all needed queries?
    await queryClient.invalidateQueries({
      queryKey: trpc.profile.getActiveProfile.queryKey(),
    });
    navigate(getUserRedirectUrl(sessionData as Session | null));
  };

  const handleCreateProfile = async () => {
    navigate("/profile-create");
  };

  return (
    <Card className="p-4 w-xl mt-10 self-center">
      <CardHeader>
        <CardTitle className="text-center">Select Your Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 w-lg m-auto">
        {profiles.map((profile) => (
          <Button
            key={profile.id}
            variant="outline"
            onClick={() => onProfileSelect(profile.id)}
          >
            {profile.firstName} {profile.lastName}
          </Button>
        ))}
        <Button variant="secondary" onClick={() => handleCreateProfile()}>
          Add New Profile
        </Button>
        <Link to="/" className="justify-center gap-2 flex">
          <Undo className="inline" />
          Exit
        </Link>
      </CardContent>
    </Card>
  );
}
