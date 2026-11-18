/**
 * Form input to create a new profile.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Undo2 } from "lucide-react";
import { EditForm } from "~/components/entry-views/edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { profileDefs, profileRequiredFields } from "~/utils/field-defs/profile";
import { useTRPC } from "~/utils/trpc";
import { authClient } from "~/utils/auth";
import { getSessionData } from "~/utils/session";
import { safeRedirectPath } from "~/utils/redirect";

const columnDefs = [
  profileDefs.firstName,
  profileDefs.lastName,
  profileDefs.city,
  profileDefs.state,
  profileDefs.postalCode,
  profileDefs.address,
  profileDefs.phoneNumber,
];

export function meta() {
  return [{ title: "Create a Profile" }];
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [searchParams] = useSearchParams();
  const redirect = safeRedirectPath(
    searchParams.get("redirect"),
    "/profile-select",
  );

  const createProfile = useMutation(
    trpc.profiles.create.mutationOptions({
      onSuccess: async () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.profiles.pathKey(),
        });
      },
    }),
  );

  return (
    <Card className="p-4 w-xl self-center">
      <CardHeader>
        <CardTitle className="text-center">Create a Profile</CardTitle>
        <CardContent className="flex flex-col gap-4 w-lg m-auto">
          <EditForm
            required={profileRequiredFields}
            columns={columnDefs}
            onSave={async (_, values) => {
              const created = await createProfile.mutateAsync(values);
              const sessionData = await getSessionData();
              const activeProfileId = sessionData?.session?.activeProfileId;
              if (
                (activeProfileId == null || activeProfileId === "") &&
                created?.id
              ) {
                await authClient.updateSession({
                  activeProfileId: created.id,
                } as unknown as any);
              }
              await navigate(redirect);
            }}
          />
          <Link to="/profile-select">
            <Undo2 className="inline" /> Back
          </Link>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
