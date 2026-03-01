import { Link } from "react-router";
import type { Route } from "../+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Not found" }];
}

export default function () {
  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold tracking-tight pb-6">
        404 - Not found
      </h1>
      Page not found! Go to{" "}
      <Link to="/instructor/" className="underline">
        instructor home
      </Link>
      .
    </div>
  );
}
