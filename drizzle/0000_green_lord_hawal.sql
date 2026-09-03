CREATE TABLE `download_tokens` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`order_id` bigint unsigned NOT NULL,
	`token` varchar(96) NOT NULL,
	`expires_at` datetime NOT NULL,
	`downloads` int NOT NULL DEFAULT 0,
	`max_downloads` int NOT NULL DEFAULT 5,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `download_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `download_tokens_token_uq` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `facts_verification` (
	`key` varchar(120) NOT NULL,
	`verified_by` varchar(160),
	`verified_on` datetime,
	`note` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facts_verification_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `lead_events` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`lead_id` bigint unsigned NOT NULL,
	`type` varchar(60) NOT NULL,
	`payload` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lead_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide') NOT NULL,
	`kind` enum('consultation','investor_inquiry','contact','quiz') NOT NULL,
	`name` varchar(160),
	`email` varchar(255) NOT NULL,
	`phone` varchar(40),
	`whatsapp` varchar(40),
	`country` varchar(2),
	`nationality` varchar(2),
	`message` text,
	`quiz_answers` json,
	`quiz_result` varchar(60),
	`page_path` varchar(512),
	`utm` json,
	`crm_status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`crm_response` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`product_id` bigint unsigned NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(160),
	`stripe_session_id` varchar(255) NOT NULL,
	`stripe_payment_intent` varchar(255),
	`amount_cents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','paid','refunded') NOT NULL DEFAULT 'pending',
	`site` enum('residency','investorpass','guide') NOT NULL DEFAULT 'guide',
	`utm` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`paid_at` datetime,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_stripe_session_uq` UNIQUE(`stripe_session_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(200) NOT NULL,
	`price_cents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`stripe_price_id` varchar(120),
	`file_key` varchar(255),
	`version` varchar(40) NOT NULL DEFAULT '1',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`site` enum('residency','investorpass','guide') NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(160),
	`source` varchar(120),
	`status` enum('pending','confirmed','unsubscribed') NOT NULL DEFAULT 'pending',
	`confirm_token` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`confirmed_at` datetime,
	CONSTRAINT `subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscribers_email_site_uq` UNIQUE(`email`,`site`),
	CONSTRAINT `subscribers_confirm_token_uq` UNIQUE(`confirm_token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(120),
	`role` enum('admin','editor') NOT NULL DEFAULT 'admin',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `download_tokens_order_idx` ON `download_tokens` (`order_id`);--> statement-breakpoint
CREATE INDEX `lead_events_lead_id_idx` ON `lead_events` (`lead_id`);--> statement-breakpoint
CREATE INDEX `leads_site_idx` ON `leads` (`site`);--> statement-breakpoint
CREATE INDEX `leads_kind_idx` ON `leads` (`kind`);--> statement-breakpoint
CREATE INDEX `leads_created_at_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE INDEX `leads_email_idx` ON `leads` (`email`);--> statement-breakpoint
CREATE INDEX `orders_email_idx` ON `orders` (`email`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);