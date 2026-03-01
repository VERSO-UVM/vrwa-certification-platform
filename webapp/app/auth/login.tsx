import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardTitle, CardContent, CardFooter } from "~/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="mt-10 w-md self-center">
      <CardTitle className="text-center">Login</CardTitle>
      <CardContent class="flex flex-row h-full"></CardContent>
      <CardFooter className="flex items-start flex-col gap-4">
        <div>
          Or,&nbsp;
          <Link to="/signup" className="text-blue-700 underline">
            sign up
          </Link>
          .
        </div>
        <div>
          <Link to="/" className="underline">
            Exit
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
