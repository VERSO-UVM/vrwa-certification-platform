import type { PaymentStatus } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";

export function PaymentStatusBadge({ value }: { value: PaymentStatus }) {
  switch (value) {
    case "paid":
      return <Badge variant="green">Paid</Badge>;
    case "unpaid":
      return <Badge variant="orange">Unpaid</Badge>;
  }
}
