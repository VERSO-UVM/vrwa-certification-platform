CREATE TYPE "paymentRate" AS ENUM('member', 'nonmember');--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "paymentRate" "paymentRate" DEFAULT 'nonmember'::"paymentRate" NOT NULL;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "stripeCheckoutSessionId" varchar;