import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { authClient } from "~/utils/auth";
import { useTRPC } from "~/utils/trpc";
import { getSessionData, getUserRedirectUrl } from "~/utils/utils";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  async function handleSignup(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Our names our tied to profiles not users, but
    // Better-Auth requires a name for legacy reasons
    const name = email.split("@")[0];
    if (name == null) {
      setError("Failed to sign up");
      setLoading(false);
      return;
    }

    const { data: _, error: signInError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Failed to sign up");
      setLoading(false);
    } else {
      const sessionData = await getSessionData();
      if (sessionData?.user == null) {
        setError("Unable to sign in");
        setLoading(false);
        return;
      }

      // Invalidate ALL queries after logging in
      await queryClient.invalidateQueries();

      navigate("/profile-create", { replace: true });
    }
  }

  return (
    <Card className="mt-10 w-full max-w-md self-center">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Sign-up
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="account@example.com"
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
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Have an account?{" "}
          <Link to="/signup" className="text-blue-700 underline">
            Log in
          </Link>
        </div>
        <Link to="/" className="text-sm underline">
          Home
        </Link>
      </CardFooter>
    </Card>
  );
}
