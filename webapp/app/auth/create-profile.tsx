/**
 * Form input to create a new profile.
 */

import type { Profile } from "@backend/database/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Undo2 } from "lucide-react";
import { EditForm } from "~/components/entry-views/edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { emptyProfile, profileDefs } from "~/utils/field-defs/profile";
import { useTRPC } from "~/utils/trpc";

const columnDefs = [
  profileDefs.firstName,
  profileDefs.lastName,
  profileDefs.city,
  profileDefs.state,
  profileDefs.postalCode,
  profileDefs.address,
  profileDefs.phoneNumber,
];

export function CreateProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const createProfile = useMutation(
    trpc.profiles.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.profiles.list.queryKey(),
        });
      },
    }),
  );

  const handleOnSave = (updates: Partial<Profile>) => {
    createProfile.mutate({
      ...emptyProfile,
      ...updates,
    } as Profile);
    navigate("/profile-select");
  };

  return (
    <Card className="p-4 w-xl mt-10 self-center">
      <CardHeader>
        <CardTitle className="text-center">Create a Profile</CardTitle>
        <CardContent className="flex flex-col space-y-4 w-lg m-auto">
          <EditForm
            item={emptyProfile}
            columns={columnDefs}
            onSave={handleOnSave}
          />
          <Link to="/profile-select">
            <Undo2 className="inline" /> Back
          </Link>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
