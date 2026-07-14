import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/utils/auth";

export function LogOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = async function () {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigate("/login"); // redirect to login page
          // If we don't invalidate all queries, it doesn't actually
          // look like we've logged out
          await queryClient.invalidateQueries();
        },
      },
    });
  };

  return (
    <Button className="!justify-start" variant="link" onClick={() => logout()}>
      Log out
    </Button>
  );
}
