import { useQueryClient } from "@tanstack/react-query";
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
import { getSessionData, getUserRedirectUrl } from "~/utils/session";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: _, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message || "Failed to sign in");
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

      navigate(getUserRedirectUrl(sessionData), { replace: true });
    }
  }

  return (
    <main className="flex items-center justify-center h-screen vrwa-light:bg-gray-50 dark:bg-gray-950">
      <Card className="mt-10 w-full max-w-md self-center">
        <CardHeader>
          <CardTitle className="text-center dark:text-gray-200 text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <Button type="submit" className="w-full dark:hover:bg-gray-300" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Need an account?{" "}
            <Link to="/signup" className="text-blue-700 dark:text-blue-300 underline">
              Sign up
            </Link>
          </div>
          <Link to="/" className="text-sm underline">
            Home
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
