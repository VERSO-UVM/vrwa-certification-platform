import { PaymentStatus } from "@backend/database/schema";
import { Badge } from "~/components/ui/badge";

export function PaymentStatusBadge({ value }: { value: PaymentStatus }) {
  switch (value) {
    case PaymentStatus.Paid:
      return <Badge variant="green">Paid</Badge>;
    case PaymentStatus.Draft:
      return <Badge variant="blue">Draft</Badge>;
    case PaymentStatus.Open:
      return <Badge variant="blue">Open</Badge>;
    case PaymentStatus.Refunded:
      return <Badge variant="orange">Refunded</Badge>;
    case PaymentStatus.Void:
      return <Badge variant="indigo">Void</Badge>;
    case PaymentStatus.Uncollectible:
      return <Badge variant="orange">Uncollectible</Badge>;
  }
}
