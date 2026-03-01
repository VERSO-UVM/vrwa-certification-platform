import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardTitle, CardContent } from "~/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="mt-10 w-md self-center">
      <CardTitle className="text-center">Login</CardTitle>
      <CardContent>
        Or, <Link to="/signup" className="text-blue-700 underline">sign up</Link>.
      </CardContent>
    </Card>
  )
}
