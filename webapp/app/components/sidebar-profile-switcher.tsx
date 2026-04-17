import { RefreshCw, User } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { SidebarMenuItem } from "~/components/ui/sidebar";
import { authClient } from "~/lib/auth-client";
import { trpc } from "~/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export function SidebarProfileSwitcher() {
  const { data: session } = authClient.useSession();
  const trpcProxy = trpc();
  const getMyProfiles = useQuery(
    trpcProxy.profile.getMyProfiles.queryOptions(undefined, {
      enabled: !!session,
    }),
  );
  const activeProfileId = (
    session?.session as { activeProfileId?: string } | undefined
  )?.activeProfileId;

  const activeProfile = getMyProfiles.data?.find(
    (p) => p.id === activeProfileId,
  );

  if (!session) return null;

  return (
    <SidebarMenuItem>
      <div className="flex flex-col gap-1 p-2 bg-muted/50 rounded-md mb-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Active Profile
        </span>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate flex-1">
            {activeProfile
              ? `${activeProfile.firstName} ${activeProfile.lastName}`
              : "No active profile"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            asChild
            title="Switch Profile"
          >
            <Link to="/profile-selection">
              <RefreshCw className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </div>
    </SidebarMenuItem>
  );
}
