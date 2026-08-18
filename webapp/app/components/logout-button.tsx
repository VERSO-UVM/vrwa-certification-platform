import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/utils/auth";

export function LogOutButton() {
  const navigate = useNavigate();
  const logout = async function () {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await navigate("/login"); // redirect to login page
          // Don't invalidate queries here; it may cause them to be immediately
          // re-tried and result in unauthorized errors. Invalidating queries
          // when logging in is sufficient.
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
