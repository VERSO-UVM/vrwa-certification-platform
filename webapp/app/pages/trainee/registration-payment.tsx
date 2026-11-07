import type { Route } from "./+types/registration-payment";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
} from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useTRPC, type TRPC } from "~/utils/trpc";
import { prefetchLoader } from "~/utils/trpc.server";
import { unitPriceCents } from "@backend/utils/pricing";
import { formatCents } from "~/utils/money";
import { getStripePublishableKey } from "~/utils/env";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Payment" }];
}

function queries(trpc: TRPC, { courseId }: Route.LoaderArgs["params"]) {
  return [trpc.courses.trainee.get.queryOptions({ courseId })] as const;
}

export const loader = prefetchLoader(queries);
export const clientLoader = () => {};

const stripePromise = loadStripe(getStripePublishableKey());

export default function RegistrationPaymentPage({
  params: { courseId },
}: Route.ComponentProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [{ data: course }] = useSuspenseQueries({
    queries: queries(trpc, { courseId }),
  });

  const reservationIds = (searchParams.get("r") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const rate = searchParams.get("rate") === "member" ? "member" : "nonmember";
  const memberRate = rate === "member";

  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"card" | "check">("card");

  const createCheckout = useMutation(
    trpc.reservations.trainee.createCheckoutSession.mutationOptions(),
  );
  const payByCheck = useMutation(
    trpc.reservations.trainee.payByCheck.mutationOptions(),
  );

  const { data: status } = useQuery({
    ...trpc.reservations.trainee.registrationStatus.queryOptions({
      reservationIds,
    }),
    enabled: reservationIds.length > 0,
  });

  const unitCents = course
    ? unitPriceCents(course.priceCents, memberRate)
    : 0;
  const seatCount = status?.reservations.length ?? reservationIds.length;
  const totalCents = unitCents * seatCount;

  const profileNames = useMemo(() => {
    return (status?.reservations ?? []).map(
      (r) => `${r.firstName} ${r.lastName}`,
    );
  }, [status?.reservations]);

  if (reservationIds.length === 0) {
    return (
      <>
        <PageHeader>Payment</PageHeader>
        <Alert variant="destructive">
          <AlertTitle>Missing registration</AlertTitle>
          <AlertDescription>
            No reservations were provided.{" "}
            <Link
              to={`/trainee/registration/${courseId}`}
              className="underline"
            >
              Start over
            </Link>
            .
          </AlertDescription>
        </Alert>
      </>
    );
  }

  async function handlePayByCheck() {
    setError(null);
    try {
      await payByCheck.mutateAsync({ reservationIds });
      void queryClient.invalidateQueries({
        queryKey: trpc.reservations.trainee.pathKey(),
      });
      navigate(
        `/trainee/registration/${courseId}/confirmation?r=${encodeURIComponent(reservationIds.join(","))}&method=check`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to record check payment.",
      );
    }
  }

  return (
    <>
      <div className="pb-6">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link to={`/trainee/registration/${courseId}/profiles`} />}
        >
          <ArrowLeft className="mr-2" /> Back
        </Button>
      </div>
      <PageHeader>Payment</PageHeader>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Card variant="green">
          <CardHeader>
            <CardTitle>{course?.courseName ?? "Course"}</CardTitle>
            <CardDescription>
              {memberRate ? "Member" : "Non-member"} rate · {seatCount} seat
              {seatCount === 1 ? "" : "s"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div>
              <span className="font-medium">Profiles: </span>
              {profileNames.join(", ") || "—"}
            </div>
            <div>
              <span className="font-medium">Unit price: </span>
              {formatCents(unitCents)}
            </div>
            <div>
              <span className="font-medium">Total: </span>
              {formatCents(totalCents)}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Payment error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How would you like to pay?</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={method}
              onValueChange={(value) => {
                if (value === "card" || value === "check") setMethod(value);
              }}
            >
              <TabsList>
                <TabsTrigger value="card">Pay by card</TabsTrigger>
                <TabsTrigger value="check">Pay by check</TabsTrigger>
              </TabsList>
              <TabsContent value="card" className="mt-4">
                {method === "card" && (
                  <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{
                      fetchClientSecret: async () => {
                        const result = await createCheckout.mutateAsync({
                          reservationIds,
                        });
                        return result.clientSecret;
                      },
                    }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                )}
              </TabsContent>
              <TabsContent value="check" className="mt-4 flex flex-col gap-4">
                <p className="text-muted-foreground text-sm">
                  We will email you an invoice with mailing instructions.
                </p>
                <Button
                  type="button"
                  disabled={payByCheck.isPending}
                  onClick={() => void handlePayByCheck()}
                >
                  {payByCheck.isPending
                    ? "Saving…"
                    : "Confirm pay by check"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
