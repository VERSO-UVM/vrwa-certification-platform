/**
 * Admin page for creating trainee profiles. This is for adding people
 * who do not add themselves through the web interface. Also, if we are
 * redirected here from a course details page, we may want to enroll
 * the trainee in the course here as well.
 *
 * Important: this is different from the auth/create-profile.tsx, which
 * is where a user may manage *their own* profiles.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { EditForm } from "~/components/entry-views/edit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { profileDefs, profileRequiredFields } from "~/utils/field-defs/profile";
import { userDefs, userFieldHelper } from "~/utils/field-defs/user";
import { textInputEditor } from "~/utils/field-editors";
import { useTRPC } from "~/utils/trpc";

export function meta() {
  return [{ title: "Create Profile - VRWA" }];
}

const userFieldDefs = [
  userFieldHelper.accessor("email", {
    header: "Email",
    meta: {
      editor: textInputEditor(),
    },
  }),
  userDefs.role,
];

const fieldDefs = [
  profileDefs.user,
  profileDefs.firstName,
  profileDefs.lastName,
  profileDefs.city,
  profileDefs.state,
  profileDefs.postalCode,
  profileDefs.address,
  profileDefs.phoneNumber,
];

export default function CreateProfile() {
  const [searchParams, _] = useSearchParams();
  const enrollIn = searchParams.get("enrollIn");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createUser = useMutation(
    trpc.users.admin.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.users.pathKey(),
        });
      },
    }),
  );

  const createProfile = useMutation(
    trpc.profiles.admin.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.profiles.list.queryKey(),
        });
      },
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4 w-xl self-center">
        <CardHeader>
          <CardTitle className="text-center">Add User Account</CardTitle>
          <CardDescription>
            Multiple profiles may be associated with a single email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-2 w-lg m-auto">
          <EditForm
            required={{}}
            columns={userFieldDefs}
            onSave={async (_, values) => {}}
          />
        </CardContent>
      </Card>

      <Card className="p-4 w-xl self-center">
        <CardHeader>
          <CardTitle className="text-center">Create a Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 w-lg m-auto">
          <EditForm
            required={profileRequiredFields}
            columns={fieldDefs}
            onSave={async (_, values) => {
              await createProfile.mutateAsync(values);
              await navigate("/profile-select");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
