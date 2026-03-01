import { Link } from "react-router";
import { Card, CardTitle, CardContent } from "~/components/ui/card";

export default function SignupPage() {
  return (
    <Card className="mt-10 w-md self-center">
      <CardTitle className="text-center">Sign-up</CardTitle>
      <CardContent>
        Or, <Link to="/login" className="text-blue-700 underline">log in</Link>.
      </CardContent>
    </Card>
  )
}

