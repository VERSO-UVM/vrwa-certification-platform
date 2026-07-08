/* Dev login buttons in home page */

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { signIn } from "~/utils/auth";
import { getUserRedirectUrl, isDev } from "~/utils/utils";

const seedLogins = {
  admin: {
    email: "example1@gmail.com",
    password: "password1",
    callbackURL: "/admin",
  },
  instructor: {
    email: "example2@gmail.com",
    password: "password2",
    callbackURL: "/instructor",
  },
  trainee: {
    email: "founders@gmail.com",
    password: "america123",
    callbackURL: "/profile-select",
  },
};

export function DevHacks() {
  const queryClient = useQueryClient();
  const devLogin = async function (where: "admin" | "instructor" | "trainee") {
    // Invalidate all queries
    queryClient.invalidateQueries();
    const { error } = await signIn.email(seedLogins[where]);
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
