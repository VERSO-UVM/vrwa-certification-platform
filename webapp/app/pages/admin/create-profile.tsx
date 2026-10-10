/**
 * Admin page for creating trainee profiles. This is for adding people
 * who do not add themselves through the web interface. Also, if we are
 * redirected here from a course details page, we may want to enroll
 * the trainee in the course here as well.
 *
 * Important: this is different from the auth/create-profile.tsx, which
 * is where a user may manage *their own* profiles.
 */

import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { useTRPC } from "~/utils/trpc";

export function meta() {
  return [{ title: "Create Profile - VRWA" }];
}

export default function CreateProfile() {
  const [searchParams, _] = useSearchParams();
  const enrollIn = searchParams.get("enrollIn");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createProfile = useMutation(
    trpc.profiles.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.profiles.list.queryKey(),
        });
      },
    }),
  );

  return (<>

  </>);
}
