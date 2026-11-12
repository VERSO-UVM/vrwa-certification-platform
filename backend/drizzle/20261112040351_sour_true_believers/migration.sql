CREATE TABLE `course` (
	`id` varchar(36) PRIMARY KEY,
	`courseName` text NOT NULL,
	`description` text,
	`creditHours` decimal(6,3) NOT NULL,
	`creditHourCategories` json NOT NULL DEFAULT (JSON_ARRAY()),
	`priceCents` int NOT NULL,
	`seats` int NOT NULL,
	`instructorId` varchar(36),
	`status` enum('active','deleted','canceled') NOT NULL DEFAULT 'active',
	`tags` json NOT NULL DEFAULT (JSON_ARRAY())
);
--> statement-breakpoint
CREATE TABLE `courseEvent` (
	`id` varchar(36) PRIMARY KEY,
	`courseId` varchar(36) NOT NULL,
	`locationType` enum('in-person','virtual','hybrid') NOT NULL,
	`virtualLink` text,
	`physicalAddress` text,
	`town` text,
	`venue` text,
	`classStartDatetime` timestamp(3),
	`durationMinutes` int
);
--> statement-breakpoint
CREATE TABLE `memberGroup` (
	`id` varchar(36) PRIMARY KEY,
	`name` text,
	`membershipStatus` enum('active','inactive') NOT NULL,
	`createdAt` timestamp(3) DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` varchar(36) PRIMARY KEY,
	`userId` varchar(36) NOT NULL,
	`memberGroupId` varchar(36),
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postalCode` text NOT NULL,
	`phoneNumber` text NOT NULL,
	`association` text,
	`createdAt` timestamp(3) NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE TABLE `reservation` (
	`id` varchar(36) PRIMARY KEY,
	`profileId` varchar(36) NOT NULL,
	`courseId` varchar(36) NOT NULL,
	`reservationStatus` enum('accepted','declined','waitlisted') NOT NULL,
	`statusUpdatedAt` timestamp(3) NOT NULL DEFAULT (now()),
	`paymentStatus` enum('draft','open','paid','refunded','void','uncollectible') NOT NULL,
	`stripeInvoiceId` varchar(255),
	`createdAt` timestamp(3) NOT NULL DEFAULT (now()),
	`creditHours` decimal(6,3) NOT NULL,
	CONSTRAINT `profileId_courseId_unique` UNIQUE INDEX(`profileId`,`courseId`)
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` varchar(36) PRIMARY KEY,
	`issuer` varchar(191) NOT NULL,
	`account_id` varchar(191) NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `account_issuer_accountId_uidx` UNIQUE INDEX(`issuer`,`account_id`)
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` varchar(36) PRIMARY KEY,
	`organization_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`inviter_id` varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` varchar(36) PRIMARY KEY,
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(255) NOT NULL DEFAULT 'member',
	`created_at` timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` varchar(36) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logo` text,
	`created_at` timestamp(3) NOT NULL,
	`metadata` text,
	CONSTRAINT `slug_unique` UNIQUE INDEX(`slug`),
	CONSTRAINT `organization_slug_uidx` UNIQUE INDEX(`slug`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) PRIMARY KEY,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	`active_organization_id` text,
	`active_profile_id` text,
	CONSTRAINT `token_unique` UNIQUE INDEX(`token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) PRIMARY KEY,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` timestamp(3),
	`stripe_customer_id` text,
	CONSTRAINT `email_unique` UNIQUE INDEX(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) PRIMARY KEY,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now())
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
ALTER TABLE `course` ADD CONSTRAINT `course_instructorId_profile_id_fkey` FOREIGN KEY (`instructorId`) REFERENCES `profile`(`id`);--> statement-breakpoint
ALTER TABLE `courseEvent` ADD CONSTRAINT `courseEvent_courseId_course_id_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `profile` ADD CONSTRAINT `profile_userId_user_id_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`);--> statement-breakpoint
ALTER TABLE `profile` ADD CONSTRAINT `profile_memberGroupId_memberGroup_id_fkey` FOREIGN KEY (`memberGroupId`) REFERENCES `memberGroup`(`id`);--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_profileId_profile_id_fkey` FOREIGN KEY (`profileId`) REFERENCES `profile`(`id`);--> statement-breakpoint
ALTER TABLE `reservation` ADD CONSTRAINT `reservation_courseId_course_id_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_organization_id_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_inviter_id_user_id_fkey` FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `member` ADD CONSTRAINT `member_organization_id_organization_id_fkey` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `member` ADD CONSTRAINT `member_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE;