import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { authClient } from "~/utils/auth";

export function LogOutButton() {
  const navigate = useNavigate();
  const logout = async function () {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/login"); // redirect to login page
        },
      },
    });
  };

  return (
    <Button
      className="!justify-start"
      variant="link"
      onClick={() => logout()}
    >
      Log out
    </Button>
  );
}
