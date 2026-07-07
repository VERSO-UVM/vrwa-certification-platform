/* Dev login buttons in home page */

import { Button } from "~/components/ui/button";
import { signIn } from "~/utils/auth";
import { isDev } from "~/utils/utils";

async function devLogin(where: "admin" | "instructor" | "trainee") {
  const { error } = await signIn.email({
    email: "example1@gmail.com",
    password: "password1",
    callbackURL: `/${where}`,
  });
  if (error) throw error;
}

export function DevHacks() {
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
