import type { Route } from "./+types/registration-profiles";
import { useMutation, useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { EditForm } from "~/components/entry-views/edit-form";
import { profileDefs, profileRequiredFields } from "~/utils/field-defs/profile";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
import { cn } from "~/utils/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Select Profiles" }];
}

function queries(trpc: TRPC, { courseId }: Route.LoaderArgs["params"]) {
  return [
    trpc.profiles.list.queryOptions(),
    trpc.profiles.listForCourse.queryOptions({ courseId }),
    trpc.courses.trainee.get.queryOptions({ courseId }),
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
  ] = useSuspenseQueries({
    queries: queries(trpc, { courseId }),
  });

  const seats = Math.max(1, Number(searchParams.get("seats") || "1") || 1);
  const rate = searchParams.get("rate") === "member" ? "member" : "nonmember";
  const waitlist = searchParams.get("waitlist") === "1";
  const memberRate = rate === "member";

  const registeredSet = useMemo(
    () => new Set(alreadyRegistered),
    [alreadyRegistered],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const alreadyTaken = profiles.filter((p) => registeredSet.has(p.id));
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
        memberRate,
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
          `/trainee/registration/${courseId}/payment?r=${encodeURIComponent(r)}&rate=${rate}`,
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
      <PageHeader>Select profiles</PageHeader>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{course?.courseName ?? "Course"}</CardTitle>
            <CardDescription>
              Move {seats} profile{seats === 1 ? "" : "s"} into the registration
              list ({memberRate ? "member" : "non-member"} rate
              {waitlist ? ", waitlist" : ""}).
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
                <h3 className="mb-3 text-sm font-medium">Your profiles</h3>
                <ItemGroup>
                  {available.map((profile) => (
                    <Item
                      key={profile.id}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => selectProfile(profile.id)}
                    >
                      <ItemContent>
                        <ItemTitle>
                          {profile.firstName} {profile.lastName}
                        </ItemTitle>
                        <ItemDescription>{profile.city}</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                  {alreadyTaken.map((profile) => (
                    <Item
                      key={profile.id}
                      variant="muted"
                      className="opacity-60"
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
                      No profiles yet. Add one on the right.
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
                <h3 className="mb-3 text-sm font-medium">Registering</h3>
                <ItemGroup>
                  {selected.map((profile) => (
                    <Item
                      key={profile.id}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => deselectProfile(profile.id)}
                    >
                      <ItemContent>
                        <ItemTitle>
                          {profile.firstName} {profile.lastName}
                        </ItemTitle>
                        <ItemDescription>Click to remove</ItemDescription>
                      </ItemContent>
                    </Item>
                  ))}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setAddOpen(true)}
                  >
                    <UserPlus className="mr-2" /> Add new profile
                  </Button>
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
                  selectedIds.length !== seats ||
                  overflow ||
                  register.isPending
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add new profile</DialogTitle>
            <DialogDescription>
              The new profile will be selected for this registration.
            </DialogDescription>
          </DialogHeader>
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
        </DialogContent>
      </Dialog>
    </>
  );
}
