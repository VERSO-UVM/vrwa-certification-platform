import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { PageHeader } from "~/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export type RegistrationConfirmationState = {
  courseName: string;
  courseEventId: string;
  results: Array<{
    profileId: string;
    profileName: string;
    status: "registered" | "waitlisted" | "already_registered";
    hostedInvoiceUrl: string | null;
  }>;
};

export default function RegistrationConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RegistrationConfirmationState | null;

  useEffect(() => {
    if (!state?.results?.length) {
      navigate("/trainee/signup", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.results?.length) {
    return (
      <div className="p-10 text-center text-muted-foreground">Redirecting…</div>
    );
  }

  const registered = state.results.filter((r) => r.status === "registered");
  const waitlisted = state.results.filter((r) => r.status === "waitlisted");
  const already = state.results.filter(
    (r) => r.status === "already_registered",
  );

  const payEntries = registered
    .map((r) => ({
      name: r.profileName,
      url: r.hostedInvoiceUrl,
    }))
    .filter((e): e is { name: string; url: string } => Boolean(e.url));

  const firstPayUrl = payEntries[0]?.url;

  return (
    <div className="space-y-6">
      <PageHeader>Registration</PageHeader>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>You&apos;re signed up</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">
              {state.courseName}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {registered.length > 0 && (
            <div>
              <p className="font-medium">Registered</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                {registered.map((r) => (
                  <li key={r.profileId}>{r.profileName}</li>
                ))}
              </ul>
            </div>
          )}
          {waitlisted.length > 0 && (
            <div>
              <p className="font-medium">Waitlisted</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                {waitlisted.map((r) => (
                  <li key={r.profileId}>{r.profileName}</li>
                ))}
              </ul>
            </div>
          )}
          {already.length > 0 && (
            <div>
              <p className="font-medium">Already registered</p>
              <ul className="list-disc pl-5 text-muted-foreground">
                {already.map((r) => (
                  <li key={r.profileId}>{r.profileName}</li>
                ))}
              </ul>
            </div>
          )}
          {payEntries.length > 1 && (
            <div className="space-y-2">
              <p className="font-medium">Pay now</p>
              <p className="text-muted-foreground">
                Each registration has its own invoice. Open Stripe to pay.
              </p>
              <div className="flex flex-col gap-2">
                {payEntries.map((e) => (
                  <Button key={e.name} asChild variant="default" size="sm">
                    <a href={e.url} target="_blank" rel="noreferrer">
                      Pay for {e.name}
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-start">
          {firstPayUrl && payEntries.length === 1 ? (
            <Button asChild className="w-full sm:w-auto">
              <a href={firstPayUrl} target="_blank" rel="noreferrer">
                Pay now
              </a>
            </Button>
          ) : null}
          {!firstPayUrl && registered.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              No online invoice for this registration (free class or billing
              offline). You can still review invoices from Payments.
            </p>
          ) : null}
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link to="/trainee/invoices">Pay later</Link>
          </Button>
          <Button variant="ghost" asChild className="w-full sm:w-auto">
            <Link to="/trainee/signup">Back to sign-up</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
