import type { Route } from "./+types/registration-confirmation";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { CheckCircle2, CircleAlert } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { PaymentStatusBadge } from "~/components/payment-status-badge";
import { Badge } from "~/components/ui/badge";
import { ReservationStatus } from "@backend/database/schema";
import { useTRPC } from "~/utils/trpc";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Registration Confirmation" }];
}

export default function RegistrationConfirmationPage({
  params: { courseId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id") ?? undefined;
  const reservationIds = (searchParams.get("r") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const waitlist = searchParams.get("waitlist") === "1";
  const method = searchParams.get("method");

  const enabled = !!sessionId || reservationIds.length > 0;

  const { data, error, isError, isPending, isFetching } = useQuery({
    ...trpc.reservations.trainee.registrationStatus.queryOptions({
      reservationIds: reservationIds.length > 0 ? reservationIds : undefined,
      sessionId,
    }),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const reservations = data?.reservations ?? [];
  const unpaidSession =
    sessionId != null &&
    data?.sessionPaymentStatus != null &&
    data.sessionPaymentStatus !== "paid" &&
    data.sessionPaymentStatus !== "no_payment_required";

  const hasError =
    !enabled ||
    isError ||
    unpaidSession ||
    (!isPending && !isFetching && reservations.length === 0);

  const courseName = reservations[0]?.courseName ?? "Course";
  const allWaitlisted = reservations.every(
    (r) => r.reservationStatus === ReservationStatus.Waitlisted,
  );

  let headline = "Registration successful";
  let description = "You are registered for this course.";
  if (waitlist || allWaitlisted) {
    headline = "You are on the waitlist";
    description = "We will contact you if a seat opens. No payment is due yet.";
  } else if (method === "check") {
    headline = "Registration successful";
    description =
      "Your seats are held. An invoice with mailing instructions will be emailed.";
  } else if (sessionId && data?.sessionPaymentStatus === "paid") {
    headline = "Payment received";
    description = "Thank you — your registration is confirmed.";
  }

  if (isPending && enabled) {
    return (
      <>
        <PageHeader>Confirmation</PageHeader>
        <p className="text-muted-foreground text-center">
          Checking registration…
        </p>
      </>
    );
  }

  if (hasError) {
    return (
      <>
        <PageHeader>Registration</PageHeader>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {error?.message ||
                (unpaidSession
                  ? "Payment was not completed. You can try again from the payment page."
                  : "We could not find your registration.")}
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={
                <Link
                  to={`/trainee/registration/${courseId}/payment${
                    reservationIds.length
                      ? `?r=${encodeURIComponent(reservationIds.join(","))}`
                      : ""
                  }`}
                />
              }
            >
              Try payment again
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/trainee/registration" />}
            >
              Back to courses
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader>Confirmation</PageHeader>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Card variant="green">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {headline}
            </CardTitle>
            <CardDescription>
              {courseName}. {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {reservations.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium">
                  {r.firstName} {r.lastName}
                </span>
                <div className="flex items-center gap-2">
                  {r.reservationStatus === ReservationStatus.Waitlisted ? (
                    <Badge variant="blue">Waitlisted</Badge>
                  ) : (
                    <Badge variant="green">Accepted</Badge>
                  )}
                  <PaymentStatusBadge value={r.paymentStatus} />
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button nativeButton={false} render={<Link to="/trainee" />}>
                Go to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
