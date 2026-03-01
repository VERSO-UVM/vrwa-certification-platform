import { Link } from "react-router";
import { PageHeader } from "~/components/page-header";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Not found" }];
}

export default function () {
  return (
    <div className="flex-1">
      <PageHeader>404 - Not found</PageHeader>
      Page not found! Go to{" "}
      <Link to="/admin/" className="underline">
        admin home
      </Link>
      .
    </div>
  );
}
