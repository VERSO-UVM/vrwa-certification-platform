import { Link } from "react-router";
import { Card, CardTitle, CardContent, CardFooter } from "~/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="mt-10 w-md self-center">
      <CardTitle className="text-center">Sign-up</CardTitle>
      <CardFooter className="flex items-start flex-col gap-4">
        <div>
          Or,&nbsp;
          <Link to="/login" className="text-blue-700 underline">
            log in
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
  )
}

