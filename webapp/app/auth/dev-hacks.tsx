/* Dev login buttons in home page */

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { signIn } from "~/utils/auth";
import { isDev } from "~/utils/utils";

export function DevHacks() {
  const queryClient = useQueryClient();
  const devLogin = async function (where: "admin" | "instructor" | "trainee") {
    // Invalidate all queries
    queryClient.invalidateQueries();
    const { error } = await signIn.email({
      email: "example1@gmail.com",
      password: "password1",
      callbackURL: `/${where}`,
    });
    if (error) throw error;
  };

  if (!isDev()) return <></>;
  return (
    <>
      <Button variant="link" onClick={() => devLogin("admin")}>
        DEV LOGIN - admin dashboard
      </Button>
      <Button variant="link" onClick={() => devLogin("trainee")}>
        DEV - trainee home
      </Button>
      <Button variant="link" onClick={() => devLogin("instructor")}>
        DEV - instructor dashboard
      </Button>
    </>
  );
}
