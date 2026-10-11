/**
 * Admin page for creating trainee profiles. This is for adding people
 * who do not add themselves through the web interface. Also, if we are
 * redirected here from a course details page, we may want to enroll
 * the trainee in the course here as well.
 *
 * Important: this is different from the auth/create-profile.tsx, which
 * is where a user may manage *their own* profiles.
 */

import { PaymentStatus } from "@backend/database/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { EditForm } from "~/components/entry-views/edit-form";
import { Button } from "~/components/ui/button";
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

const profileFieldDefs = [
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
      onSuccess: async (users) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.users.pathKey(),
        });
      },
    }),
  );

  const navigate = useNavigate();

  const createReservation = useMutation(
    trpc.reservations.admin.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.reservations.admin.listCourse.queryKey({
            courseId: enrollIn ?? undefined,
          }),
        });
      },
    }),
  );

  const createProfile = useMutation(
    trpc.profiles.admin.create.mutationOptions({
      onSuccess: async (profiles) => {
        await queryClient.invalidateQueries({
          queryKey: trpc.profiles.list.queryKey(),
        });
      },
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button variant="ghost" size="lg" className="w-50" asChild>
          {enrollIn ? (
            <Link to={`/admin/course-details/${enrollIn}`}>
              <ArrowLeft /> Back to course
            </Link>
          ) : (
            <Link to="/admin/trainees">
              <ArrowLeft /> Trainees
            </Link>
          )}
        </Button>
      </div>
      <Card className="p-4 w-xl self-center" variant="blue">
        <CardHeader>
          <CardTitle className="text-center">Add User Account</CardTitle>
          <CardDescription>
            Multiple profiles may be associated with a single email.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-2 w-lg m-auto">
          <EditForm
            required={{
              email: true,
              role: true,
            }}
            columns={userFieldDefs}
            onSave={async (_, { email, role }) => {
              if (email != null && role != null) {
                createUser.mutate({ email, role });
              }
            }}
          />
        </CardContent>
      </Card>

      <Card className="p-4 w-xl self-center" variant="green">
        <CardHeader>
          <CardTitle className="text-center">Create a Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4 w-lg m-auto">
          <EditForm
            required={profileRequiredFields}
            columns={profileFieldDefs}
            onSave={async (_, values) => {
              const profiles = await createProfile.mutateAsync(values);
              const profile = profiles[0];
              if (profile == null) {
                /* No profile created */
                return;
              }
              if (enrollIn) {
                /* Also want to make reservation */
                await createReservation.mutateAsync({
                  profileId: profile.id,
                  courseId: enrollIn,
                  creditHours: "0",
                  paymentStatus: PaymentStatus.Draft,
                });

                await navigate(`/admin/course-details/${enrollIn}`);
              } else {
                await navigate(`/admin/trainees`);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
