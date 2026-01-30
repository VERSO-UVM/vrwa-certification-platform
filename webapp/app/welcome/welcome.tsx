import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/utils/trpc";
import { Card, CardHeader } from "app/components/ui/card";

export function Welcome() {
  const trpc = useTRPC();
  const greeting = useQuery(trpc.hello.queryOptions({ text: 'world' }));
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <Card>
        <CardHeader>Hello, {greeting.data?.greeting}!</CardHeader>
      </Card>
    </main>
  );
}
