import { PageHeader } from "~/components/page-header";
import type { Route } from "./+types/registration-details";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
import { Button } from "~/components/ui/button";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { LocationTypeBadge } from "~/components/location-type-badge";
import { CreditHourCategory } from "@backend/database/schema";
import { unitPriceCents } from "@backend/utils/pricing";
import { formatCents } from "~/utils/money";
import { useSessionData } from "~/utils/session";
import { withRedirectParam } from "~/utils/redirect";
import { format } from "date-fns";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Registration Details" }];
}

function queries(trpc: TRPC, { courseId }: Route.LoaderArgs["params"]) {
  return [trpc.courses.trainee.get.queryOptions({ courseId })] as const;
}

/* Prefetch all queries during SSR. */
export const loader = prefetchLoader(queries);
/* Skip loader on client-side navigations */
export const clientLoader = () => {};

function formatCreditCategories(categories: CreditHourCategory[]) {
  const hasWater = categories.includes(CreditHourCategory.Water);
  const hasWastewater = categories.includes(CreditHourCategory.Wastewater);
  const codes = categories
    .filter((c) => c.includes(":"))
    .map((c) => c.split(":")[1]!)
    .sort();

  return { hasWater, hasWastewater, codes };
}

function sessionLocationLabel(session: {
  locationType: string;
  virtualLink: string | null;
  physicalAddress: string | null;
  town: string | null;
  venue: string | null;
}) {
  if (session.locationType === "virtual") return "Online";
  return (
    [session.venue, session.physicalAddress, session.town]
      .filter(Boolean)
      .join(", ") || "—"
  );
}

export default function RegistrationDetailsPage({
  params: { courseId },
}: Route.ComponentProps) {
  const [{ data: course }] = useSuspenseQueries({
    queries: queries(useTRPC(), { courseId }),
  });
  const session = useSessionData();
  const navigate = useNavigate();
  const [seats, setSeats] = useState(1);

  if (!course) {
    return (
      <>
        <PageHeader>Course not found</PageHeader>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to="/trainee/registration" />}
        >
          <ArrowLeft className="mr-2" /> Back to Courses
        </Button>
      </>
    );
  }

  const seatsLeft = Math.max(0, course.seats - course.spotsFilled);
  const needsWaitlist = seats > seatsLeft;
  const { hasWater, hasWastewater, codes } = formatCreditCategories(
    course.creditHourCategories,
  );
  const firstSession = course.sessions[0];

  function setSeatsClamped(next: number) {
    setSeats(Math.max(1, Math.floor(next) || 1));
  }

  function goToProfiles(rate: "member" | "nonmember", waitlist: boolean) {
    const params = new URLSearchParams({
      seats: String(seats),
      rate,
      ...(waitlist ? { waitlist: "1" } : {}),
    });
    const profilesPath = `/trainee/registration/${courseId}/profiles?${params}`;
    if (session?.user == null) {
      navigate(withRedirectParam("/signup", profilesPath));
      return;
    }
    navigate(profilesPath);
  }

  return (
    <>
      <div className="pb-6">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to="/trainee/registration" />}
        >
          <ArrowLeft className="mr-2" /> Back to Courses
        </Button>
      </div>
      <PageHeader>{course.courseName}</PageHeader>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{course.courseName}</CardTitle>
            <CardDescription>
              {course.startDate
                ? format(course.startDate, "EEEE, MMMM d, yyyy 'at' p")
                : "Date TBA"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="font-medium">Credit hours (TCH):</dt>
                <dd>{course.creditHours}</dd>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <dt className="font-medium">Type:</dt>
                <dd className="flex flex-wrap gap-1">
                  {hasWater && <Badge variant="blue">Water</Badge>}
                  {hasWastewater && (
                    <Badge variant="indigo">Wastewater</Badge>
                  )}
                  {codes.map((code) => (
                    <Badge key={code} variant="outline">
                      {code}
                    </Badge>
                  ))}
                  {!hasWater && !hasWastewater && codes.length === 0 && (
                    <span className="text-muted-foreground">—</span>
                  )}
                </dd>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <dt className="font-medium">Instructor:</dt>
                <dd>
                  {course.instructor
                    ? `${course.instructor.firstName} ${course.instructor.lastName}`
                    : "TBA"}
                </dd>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <dt className="font-medium">Seats left:</dt>
                <dd>
                  {seatsLeft} of {course.seats}
                  {course.waitlistSize > 0
                    ? ` (${course.waitlistSize} waitlisted)`
                    : ""}
                </dd>
              </div>
            </dl>

            {course.description ? (
              <div>
                <h3 className="mb-1 font-medium">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {course.description}
                </p>
              </div>
            ) : null}

            <div>
              <h3 className="mb-2 font-medium">Sessions</h3>
              {course.sessions.length === 0 ? (
                <p className="text-muted-foreground">No sessions scheduled.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {course.sessions.map((session) => (
                    <li
                      key={session.id}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">
                          {session.classStartDatetime
                            ? format(
                                session.classStartDatetime,
                                "MMM d, yyyy · p",
                              )
                            : "Date TBA"}
                        </span>
                        <LocationTypeBadge value={session.locationType} />
                        {session.durationMinutes != null && (
                          <span className="text-muted-foreground">
                            {session.durationMinutes} min
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {sessionLocationLabel(session)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Choose how many seats to purchase, then register at the member or
              non-member rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="seats">Number of seats</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSeatsClamped(seats - 1)}
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
                    onChange={(e) => setSeatsClamped(Number(e.target.value))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setSeatsClamped(seats + 1)}
                    aria-label="Increase seats"
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
              {firstSession?.classStartDatetime == null && (
                <p className="text-muted-foreground text-sm">
                  Session date not set yet.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <PricingRow
                label="Member"
                description="Half price (honor system for now)"
                unitCents={unitPriceCents(course.priceCents, true)}
                seats={seats}
                waitlist={needsWaitlist}
                seatsLeft={seatsLeft}
                onContinue={() => goToProfiles("member", needsWaitlist)}
              />
              <PricingRow
                label="Non-member"
                description="Full course price"
                unitCents={unitPriceCents(course.priceCents, false)}
                seats={seats}
                waitlist={needsWaitlist}
                seatsLeft={seatsLeft}
                onContinue={() => goToProfiles("nonmember", needsWaitlist)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function PricingRow({
  label,
  description,
  unitCents,
  seats,
  waitlist,
  seatsLeft,
  onContinue,
}: {
  label: string;
  description: string;
  unitCents: number;
  seats: number;
  waitlist: boolean;
  seatsLeft: number;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
        <div className="mt-1 text-sm">
          {formatCents(unitCents)} each ·{" "}
          <span className="font-medium">
            {formatCents(unitCents * seats)} total
          </span>
        </div>
        {waitlist && (
          <div className="text-muted-foreground mt-1 text-xs">
            {seatsLeft === 0
              ? "Course is full — join the waitlist"
              : `Only ${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left — join the waitlist for ${seats}`}
          </div>
        )}
      </div>
      <Button type="button" onClick={onContinue}>
        {waitlist ? "Join waitlist" : "Register"}
      </Button>
    </div>
  );
}
