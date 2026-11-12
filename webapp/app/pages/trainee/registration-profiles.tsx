import type { Route } from "./+types/registration-profiles";
import {
  useMutation,
  useQueryClient,
  useSuspenseQueries,
} from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Minus, Plus, UserPlus } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "~/components/ui/item";
import { DrawerClose } from "~/components/ui/drawer";
import { StandardDrawer } from "~/components/standard-drawer";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { EditForm } from "~/components/entry-views/edit-form";
import { profileDefs, profileRequiredFields } from "~/utils/field-defs/profile";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
import { cn } from "~/utils/utils";
import { PaymentRate } from "@backend/database/schema";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Select Profiles" }];
}

function queries(trpc: TRPC, { courseId }: Route.LoaderArgs["params"]) {
  return [
    trpc.profiles.list.queryOptions(),
    trpc.profiles.listForCourse.queryOptions({ courseId }),
    trpc.courses.trainee.get.queryOptions({ courseId }),
    trpc.profiles.getActiveProfile.queryOptions(),
  ] as const;
}

export const loader = prefetchLoader(queries);
export const clientLoader = () => {};

const addProfileColumns = [
  profileDefs.firstName,
  profileDefs.lastName,
  profileDefs.city,
  profileDefs.state,
  profileDefs.postalCode,
  profileDefs.address,
  profileDefs.phoneNumber,
];

export default function RegistrationProfilesPage({
  params: { courseId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [
    { data: profiles },
    { data: alreadyRegistered },
    { data: course },
    { data: currentProfile },
  ] = useSuspenseQueries({
    queries: queries(trpc, { courseId }),
  });

  const seats = Math.max(1, Number(searchParams.get("seats") || "1") || 1);
  const paymentRate =
    searchParams.get("rate") === PaymentRate.Member
      ? PaymentRate.Member
      : PaymentRate.NonMember;
  const waitlist = searchParams.get("waitlist") === "1";

  const registeredSet = useMemo(
    () => new Set(alreadyRegistered),
    [alreadyRegistered],
  );

  const alreadyTaken = profiles.filter((p) => registeredSet.has(p.id));
  const [selectedIds, setSelectedIds] = useState<string[]>(
    /* Default to active profile selected */
    currentProfile && !alreadyTaken.find((p) => p.id == currentProfile.id)
      ? [currentProfile.id]
      : [],
  );
  const [addOpen, setAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProfile = useMutation(
    trpc.profiles.create.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.profiles.pathKey(),
        });
      },
    }),
  );

  const register = useMutation(
    trpc.reservations.trainee.register.mutationOptions(),
  );

  const available = profiles.filter(
    (p) => !selectedIds.includes(p.id) && !registeredSet.has(p.id),
  );
  const selected = profiles.filter((p) => selectedIds.includes(p.id));
  const overflow = selectedIds.length > seats;

  function setSeats(next: number) {
    const value = Math.max(1, Math.floor(next) || 1);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("seats", String(value));
    setSearchParams(nextParams, { replace: true });
  }

  function selectProfile(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  function deselectProfile(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  async function handleContinue() {
    setError(null);
    try {
      const result = await register.mutateAsync({
        courseId,
        profileIds: selectedIds,
        paymentRate,
        waitlist,
      });
      const r = result.reservationIds.join(",");
      // Navigate before invalidating — suspense refetch on this page would
      // remount and cancel the transition.
      if (waitlist) {
        await navigate(
          `/trainee/registration/${courseId}/confirmation?r=${encodeURIComponent(r)}&waitlist=1`,
        );
      } else {
        await navigate(
          `/trainee/registration/${courseId}/payment?r=${encodeURIComponent(r)}&rate=${paymentRate}`,
        );
      }
      void queryClient.invalidateQueries({
        queryKey: trpc.profiles.pathKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: trpc.courses.pathKey(),
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to create reservations.";
      setError(message);
    }
  }

  return (
    <>
      <div className="pb-6">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to={`/trainee/registration/${courseId}`} />}
        >
          <ArrowLeft className="mr-2" /> Back to course
        </Button>
      </div>
      <PageHeader>Select attendees</PageHeader>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card variant="yellow">
          <CardHeader>
            <CardTitle>{course?.courseName ?? "Course"}</CardTitle>
            <CardDescription>
              Choose <span className="font-bold">{seats}</span> attendees
              {seats === 1 ? "" : "s"} to register for {course?.courseName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="seats">Seats to purchase</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(seats - 1)}
                  disabled={seats <= 1}
                  aria-label="Decrease seats"
                >
                  <Minus />
                </Button>
                <Input
                  id="seats"
                  type="number"
                  min={1}
                  className="w-20 text-center"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats(seats + 1)}
                  aria-label="Increase seats"
                >
                  <Plus />
                </Button>
                <span className="text-muted-foreground text-sm">
                  Selected: {selectedIds.length} / {seats}
                </span>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Could not register</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <h3
                  id="available-profiles-heading"
                  className="mb-3 text-sm font-medium"
                >
                  Choose seats
                </h3>
                <ItemGroup
                  role="group"
                  aria-labelledby="available-profiles-heading"
                >
                  {available.map((profile) => {
                    const name = `${profile.firstName} ${profile.lastName}`;
                    return (
                      <Item
                        key={profile.id}
                        variant="outline"
                        className="cursor-pointer text-left"
                        render={<button type="button" />}
                        aria-label={`Add ${name} to registration`}
                        onClick={() => selectProfile(profile.id)}
                      >
                        <ItemContent>
                          <ItemTitle>{name}</ItemTitle>
                          <ItemDescription>{profile.city}</ItemDescription>
                        </ItemContent>
                      </Item>
                    );
                  })}
                  {alreadyTaken.map((profile) => (
                    <Item
                      key={profile.id}
                      variant="muted"
                      className="opacity-60"
                      aria-disabled="true"
                    >
                      <ItemContent>
                        <ItemTitle>
                          {profile.firstName} {profile.lastName}
                        </ItemTitle>
                        <ItemDescription>Already registered</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                  {available.length === 0 && alreadyTaken.length === 0 && (
                    <p className="text-muted-foreground text-sm">
                      Add a new profile on the right.
                    </p>
                  )}
                </ItemGroup>
              </div>

              <div
                className={cn(
                  "rounded-lg border p-3",
                  overflow && "border-destructive",
                )}
              >
                <h3
                  id="selected-profiles-heading"
                  className="mb-3 text-sm font-medium"
                >
                  Registering
                </h3>
                <ItemGroup
                  role="group"
                  aria-labelledby="selected-profiles-heading"
                >
                  {selected.map((profile) => {
                    const name = `${profile.firstName} ${profile.lastName}`;
                    return (
                      <Item
                        key={profile.id}
                        variant="outline"
                        className="cursor-pointer text-left"
                        render={<button type="button" />}
                        aria-label={`Remove ${name} from registration`}
                        onClick={() => deselectProfile(profile.id)}
                      >
                        <ItemContent>
                          <ItemTitle>{name}</ItemTitle>
                          <ItemDescription>Remove</ItemDescription>
                        </ItemContent>
                      </Item>
                    );
                  })}
                  <StandardDrawer
                    open={addOpen}
                    onOpenChange={setAddOpen}
                    title="Add trainee"
                    description="Add a new profile to register for this course."
                    openButton={
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                      >
                        <UserPlus className="mr-2" /> Add attendee
                      </Button>
                    }
                  >
                    <EditForm
                      required={profileRequiredFields}
                      columns={addProfileColumns}
                      submitButton={{ title: "Create profile" }}
                      onSave={async (_, values) => {
                        const created = await createProfile.mutateAsync(values);
                        if (created?.id) {
                          setSelectedIds((prev) => [...prev, created.id]);
                        }
                        setAddOpen(false);
                      }}
                    />
                    <DrawerClose render={<Button variant="cancel_button" />}>
                      Cancel
                    </DrawerClose>
                  </StandardDrawer>
                </ItemGroup>
                {overflow && (
                  <p className="text-destructive mt-2 text-sm">
                    Too many profiles for the seats you selected.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={
                  selectedIds.length !== seats || overflow || register.isPending
                }
                onClick={() => void handleContinue()}
              >
                {register.isPending
                  ? "Saving…"
                  : waitlist
                    ? "Join waitlist"
                    : "Continue to payment"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
