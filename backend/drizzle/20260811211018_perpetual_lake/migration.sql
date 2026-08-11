CREATE TYPE "courseLocation" AS ENUM('in-person', 'virtual', 'hybrid');--> statement-breakpoint
CREATE TYPE "paymentStatus" AS ENUM('paid', 'unpaid');--> statement-breakpoint
ALTER TABLE "courseEvent" ADD COLUMN "duration" interval;--> statement-breakpoint
ALTER TABLE "reservation" ADD COLUMN "createdAt" timestamp;--> statement-breakpoint
ALTER TABLE "reservation" ALTER COLUMN "paymentStatus" SET DATA TYPE "paymentStatus" USING "paymentStatus"::"paymentStatus";