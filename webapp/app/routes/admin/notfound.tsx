import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [{ title: "Not found" }];
}

export default function() {
  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold tracking-tight pb-6">
        404 - Not found
      </h1>
      Page not found!
      Go to {' '}
      <Link to="/admin/" className="underline">admin home</Link>.
    </div >
  )
}
