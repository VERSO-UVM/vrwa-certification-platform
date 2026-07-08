import { useTRPC } from "~/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";

export function ActiveProfileIndicator() {
  const trpc = useTRPC();
  const activeProfileQuery = useQuery(
    trpc.profile.getActiveProfile.queryOptions(),
  );
  return (
    <div className="flex flex-col ml-4 text-xs">
      <span className="font-light">
        Signed in as{" "}
        <span className="font-normal text-sm">
          {activeProfileQuery.data?.firstName}{" "}
          {activeProfileQuery.data?.lastName}
        </span>
      </span>
      <Link
        to="/profile-select"
        className="text-sm font-medium hover:underline"
      >
        Switch Profiles
      </Link>
    </div>
  );
}
