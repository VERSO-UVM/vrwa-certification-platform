import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient, getSession } from "~/lib/auth-client";
import { ProfileForm, type ProfileFormValues } from "~/components/profile-form";
import { useTRPC } from "~/utils/trpc";
import { useMutation } from "@tanstack/react-query";
import { getPostAuthPath } from "~/lib/auth-routing";

function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(" ");
  if (space === -1) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, space).trim(),
    lastName: trimmed.slice(space + 1).trim(),
  };
}

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const trpc = useTRPC();

  const createProfile = useMutation(
    trpc.profile.createProfile.mutationOptions(),
  );
  const switchProfile = useMutation(
    trpc.profile.switchProfile.mutationOptions(),
  );

  async function handleAccountStep(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name,
    });

    if (signUpError) {
      setError(signUpError.message || "Failed to sign up");
      setLoading(false);
    } else {
      setLoading(false);
      setStep(2);
    }
  }

  async function handleProfileSubmit(values: ProfileFormValues) {
    setLoading(true);
    setError(null);
    try {
      const created = await createProfile.mutateAsync({
        ...values,
        isMember: false,
      });
      await switchProfile.mutateAsync({ profileId: created.id });
      const sessionRes = await getSession();
      navigate(getPostAuthPath(sessionRes?.data ?? null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create profile");
    } finally {
      setLoading(false);
    }
  }

  const nameDefaults = splitFullName(name);

  return (
    <Card className="mt-10 w-full max-w-md self-center">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          {step === 1 ? "Sign Up" : "Your profile"}
        </CardTitle>
        {step === 2 && (
          <p className="text-center text-sm text-muted-foreground">
            Step 2 of 2 — operator details for classes and certificates
          </p>
        )}
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={handleAccountStep} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alexander Hamilton"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Continue"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <ProfileForm
              formId="signup-profile"
              defaultValues={{
                firstName: nameDefaults.firstName,
                lastName: nameDefaults.lastName,
              }}
              onSubmit={handleProfileSubmit}
              submitLabel={loading ? "Saving..." : "Complete sign up"}
              disabled={loading}
            />
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={loading}
              onClick={() => {
                setStep(1);
                setError(null);
              }}
            >
              Back
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-700 underline">
            Login
          </Link>
        </div>
        <Link to="/" className="text-sm underline">
          Home
        </Link>
      </CardFooter>
    </Card>
  );
}
