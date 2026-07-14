/* Dev quick-login buttons in home page */

import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { signIn } from "~/utils/auth";
import { getSessionData, getUserRedirectUrl, isDev } from "~/utils/utils";

const seedLogins = {
  admin: {
    email: "example1@gmail.com",
    password: "password1",
  },
  instructor: {
    email: "example2@gmail.com",
    password: "password2",
  },
  trainee: {
    email: "founders@gmail.com",
    password: "america123",
  },
};

export function DevLogins() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const devLogin = async function (where: "admin" | "instructor" | "trainee") {
    const { error } = await signIn.email(seedLogins[where]);
    if (error) throw error;
    // Do the same log-in steps as a normal login
    const sessionData = await getSessionData();
    await queryClient.invalidateQueries();
    navigate(getUserRedirectUrl(sessionData), { replace: true });
  };

  if (!isDev()) return <></>;
  return (
    <div className="flex flex-col">
      <Button variant="link" onClick={() => devLogin("admin")}>
        DEV login - Admin
      </Button>
      <Button variant="link" onClick={() => devLogin("trainee")}>
        DEV login - Trainee
      </Button>
      <Button variant="link" onClick={() => devLogin("instructor")}>
        DEV login - Instructor
      </Button>
    </div>
  );
}
