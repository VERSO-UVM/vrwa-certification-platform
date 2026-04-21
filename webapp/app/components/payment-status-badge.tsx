import type { PaymentStatus } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";

export function PaymentStatusBadge({ value }: { value: PaymentStatus }) {
  switch (value) {
    case "paid":
      return <Badge variant="green">Paid</Badge>;
    case "unpaid":
      return <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">Unpaid</Badge>;
  }
}
